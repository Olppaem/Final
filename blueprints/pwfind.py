from flask import Blueprint, request, jsonify, session, render_template
from blueprints.utils import get_db_connection
import random
import string
import bcrypt
import datetime
# smtp 이메일 전송라이브러리리
import smtplib
from email.mime.text import MIMEText




pwfind_bp = Blueprint('pwfind', __name__, url_prefix='/member')

# 인증코드 생성 함수
def generate_otp():
    """6자리 인증 코드 생성"""
    return ''.join(random.choices(string.digits, k=6))

# 이메일 전송 함수
def send_email(email, otp):

    # 이메일 내용 설정
    subject = "비밀번호 재설정 인증 코드"
    message = f"안녕하세요,\n\n비밀번호 재설정을 위한 인증 코드: {otp}\n\n10분 이내에 입력해주세요."

    send_email_smtp(email, subject, message)  # SMTP를 이용한 실제 이메일 전송 함수 호출

# SMTP를 이용한 이메일 전송 함수
def send_email_smtp(to_email, subject, message):
    smtp_server = "smtp.gmail.com"  # Gmail SMTP 서버 (사용하는 서비스에 따라 다름)
    smtp_port = 587  # SMTP 포트 (TLS: 587, SSL: 465)
    sender_email = "tjstjdghks@gmail.com"  # 발신자 이메일
    sender_password = "nmdq qjbr oxsb opdg"  # 앱 비밀번호 (보안 중요!)

    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # TLS 보안 설정
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ [이메일 전송 성공] {to_email} 로 인증코드 전송 완료!")
    except Exception as e:
        print(f"❌ [이메일 전송 실패] {e}")

# ✅ HTML 페이지 렌더링
@pwfind_bp.route('/forgot_password')

def forgot_password():
    return render_template('member/forgot_password.html')

# step 1
@pwfind_bp.route('/request-reset-code', methods=['POST'])
def request_reset_code():
    """사용자가 입력한 아이디를 확인하고 인증 코드 발송"""
    data = request.json
    user_id = data.get("user_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1️⃣ DB에서 해당 아이디의 이메일 조회
    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    print("🔹 조회된 사용자 정보:", user)  # 🔍 디버깅 출력

    if not user:
        conn.close()
        return jsonify({"success": False, "message": "아이디를 찾을 수 없습니다."})

    email = user["email"]
    otp = generate_otp()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)  # 10분 유효


    # 2️⃣ 기존 인증 코드 삭제 후 새 코드 삽입
    cursor.execute("DELETE FROM verifications WHERE email = %s", (email,))
    cursor.execute(
    "INSERT INTO verifications (email, otp, expires_at) VALUES (%s, %s, NOW() + INTERVAL 10 MINUTE)",
    (email, otp),
)

    conn.commit()
    conn.close()

    session["email"] = email  # 세션 저장
    print("세션 저장됨:", session.get("email"))

    # 3️⃣ 실제 이메일 발송 로직 (이메일 서버 필요)
    send_email(email,otp)

    return jsonify({"success": True, "message": "인증 코드가 이메일로 전송되었습니다."})


# step 2
@pwfind_bp.route('/verify-reset-code', methods=['POST'])
def verify_reset_code():
    """사용자가 입력한 인증 코드 검증"""
    data = request.json
    email = session.get("email") # step1에 email 세션사용 및 OTP 검증용으로 사용용
    otp_input = data.get("otp")

    if not email or not otp_input:
        return jsonify({"success": False, "message": "잘못된 요청입니다."})

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1️⃣ 사용자 이메일 가져오기

    # 2️⃣ OTP 검증
    cursor.execute(
        "SELECT otp, expires_at FROM verifications WHERE email = %s", (email,)
    )
    otp_record = cursor.fetchone()
    

    if not otp_record:
        conn.close()
        return jsonify({"success": False, "message": "인증 코드가 존재하지 않습니다."})


    
    # 인증 코드 만료기간 확인 mysql에서 쿼리문으로 비교하는방법
    cursor.execute(
        "SELECT COUNT(*) AS valid FROM verifications WHERE email = %s AND expires_at > NOW()",
        (email,),
    )
    otp_valid = cursor.fetchone()["valid"]

    if otp_valid == 0:
        conn.close()
        return jsonify({"success": False, "message": "인증 코드가 만료되었습니다."})

    # DB에 저장된 otp를 가져와 stored_otp에 저장
    stored_otp = otp_record["otp"]
    #인증 코드 맞는지 틀린지 비교
    if stored_otp != otp_input:
        conn.close()
        return jsonify({"success": False, "message": "인증 코드가 일치하지 않습니다."})

    # 3️⃣ 인증 코드 사용 후 삭제
    cursor.execute("DELETE FROM verifications WHERE email = %s", (email,))
    conn.commit()
    conn.close()

    session["verified"] = True  # ✅ Step 3 진행 가능하도록 세션 저장
    print("✅ Step 2 인증 완료, 세션 저장:", session.get("verified"))  # 디버깅용 출력

    return jsonify({"success": True, "message": "인증이 완료되었습니다."})

#step3
@pwfind_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """비밀번호 재설정"""
    data = request.json
    email = session.get("email")
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({"success": False, "message": "잘못된 요청입니다."})
    
    # ✅ Step 2 인증 성공 여부 확인 (Step 3로 넘어갈 수 있는지)
    if not session.get("verified"):
        return jsonify({"success": False, "message": "인증이 완료되지 않았습니다. Step 2를 먼저 수행하세요."})
    
    # ######## 비밀번호 암호화 생략 db확인 및 취약하게만들기위해해
    # # 1️⃣ 비밀번호 해싱
    # hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    # conn = get_db_connection()
    # cursor = conn.cursor()
    # # 2️⃣ 비밀번호 업데이트
    # cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, email))
    # conn.commit()
    # conn.close()

    # 취약하고 test관리하기 위해 해싱 없이 비밀번호 저장
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
    conn.commit()
    conn.close()

    session.pop("user_id", None)  # 세션 삭제

    return jsonify({"success": True, "message": "비밀번호가 성공적으로 변경되었습니다."})


'''
# 랜덤 OTP 생성 함수
def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

# 이메일 전송 함수
def send_email(user_id, otp):
    conn = get_db_connection()
    cursor = conn.cursor()
    conn.commit()
    print(f"🔍 [디버깅] 최초 user_id 값: {user_id}")  # 1️⃣ 최초 user_id 값
    # `users` 테이블에서 user_id에 해당하는 email 가져오기
    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()  # 튜플 형태로 반환됨

    print(f"🔍 [디버깅] 조회된 사용자 데이터: {user}")  # 정상적으로 데이터가 들어오는지 확인

    cursor.close()
    conn.close()

    print(f"🔍 [디버깅] user_id 값 확인 (DB 조회 후): {user_id}")  # 3️⃣ user_id가 변경되었는지 확인

    if not user:  # ❌ user 변수가 존재하지 않음 (오타)
        print(f"⚠️ [이메일 전송 실패] user_id: {user_id} 에 해당하는 이메일이 없습니다.")
        return

    email = user['email']  # 조회한 이메일

    # 이메일 내용 설정
    subject = "비밀번호 재설정 인증 코드"
    message = f"안녕하세요,\n\n비밀번호 재설정을 위한 인증 코드: {otp}\n\n10분 이내에 입력해주세요."

    send_email_smtp(email, subject, message)  # SMTP를 이용한 실제 이메일 전송 함수 호출

# SMTP를 이용한 이메일 전송 함수
def send_email_smtp(to_email, subject, message):
    smtp_server = "smtp.gmail.com"  # Gmail SMTP 서버 (사용하는 서비스에 따라 다름)
    smtp_port = 587  # SMTP 포트 (TLS: 587, SSL: 465)
    sender_email = "tjstjdghks@gmail.com"  # 발신자 이메일
    sender_password = "nmdq qjbr oxsb opdg"  # 앱 비밀번호 (보안 중요!)

    msg = MIMEText(message)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # TLS 보안 설정
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ [이메일 전송 성공] {to_email} 로 인증코드 전송 완료!")
    except Exception as e:
        print(f"❌ [이메일 전송 실패] {e}")

# ✅ [Step 1] 아이디 입력 후 인증 코드 요청
@pwfind_bp.route('/request_reset_code', methods=['POST'])
def request_reset_code():
    data = request.json  # JavaScript에서 보낸 데이터 받기
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'status': 'error', 'message': '아이디를 입력해주세요.'})

    conn = get_db_connection()  # ✅ MySQL DB 연결
    cursor = conn.cursor()

    # ✅ 1️⃣ `users` 테이블에서 user_id에 해당하는 이메일 조회
    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    # ✅ 2️⃣ 조회된 데이터가 없는 경우 (거짓 처리)
    if not user:
        return jsonify({'status': 'error', 'message': '존재하지 않는 아이디입니다.'})

    # ✅ 3️⃣ 조회된 데이터가 있는 경우 (참 처리)
    email = user['email']  # 조회된 이메일

    # ✅ 4️⃣ 랜덤 OTP 생성 및 저장
    otp = generate_otp()
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)

    # OTP와 이메일을 verifications 테이블에 저장 ( created_at을 현재 시간(NOW())으로 설정 ) ( OTP의 만료 시간을 expires_at 값으로 설정 )
    cursor.execute(
        "INSERT INTO verifications (email, otp, created_at, expires_at) VALUES (%s, %s, NOW(), %s)",
        (email, otp, expires_at)
    )
    # INSERT 문을 실행한 후 변경 사항을 MySQL에 저장하는 역할
    conn.commit()

    # SQL 실행을 담당하는 커서를 닫아 리소스 해제
    cursor.close()
    # MySQL 데이터베이스 연결을 종료하여 리소스를 반환
    conn.close()

    # ✅ 5️⃣ 이메일 전송
    send_email(email, otp)

    return jsonify({'status': 'success', 'message': '인증 코드가 이메일로 전송되었습니다.'})

# ✅ [Step 2] 인증 코드 검증
@pwfind_bp.route('/verify_reset_code', methods=['POST'])
def verify_reset_code():
    data = request.json
    user_id = data.get('user_id')
    otp = data.get('otp')

    if not user_id or not otp:
        return jsonify({'status': 'error', 'message': '아이디와 인증 코드를 입력해주세요.'})

    conn = get_db_connection()
    cursor = conn.cursor()

    # 이메일 가져오기
    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'status': 'error', 'message': '존재하지 않는 아이디입니다.'})

    email = user['email']

    # 인증 코드 확인
    cursor.execute(
        "SELECT * FROM verifications WHERE email = %s AND otp = %s AND expires_at > NOW()",
        (email, otp)
    )
    verification = cursor.fetchone()

    cursor.close()
    conn.close()

    if verification:
        return jsonify({'status': 'success', 'message': '인증이 완료되었습니다.'})
    else:
        return jsonify({'status': 'error', 'message': '인증 코드가 올바르지 않거나 만료되었습니다.'})

# ✅ [Step 3] 비밀번호 재설정
@pwfind_bp.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    user_id = data.get('user_id')
    new_password = data.get('new_password')

    if not user_id or not new_password:
        return jsonify({'status': 'error', 'message': '아이디와 새 비밀번호를 입력해주세요.'})

    conn = get_db_connection()
    cursor = conn.cursor()

    # 이메일 가져오기
    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'status': 'error', 'message': '존재하지 않는 아이디입니다.'})

    email = user['email']

    # 비밀번호 업데이트
    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'status': 'success', 'message': '비밀번호가 성공적으로 변경되었습니다.'})

# ✅ HTML 페이지 렌더링
@pwfind_bp.route('/forgot_password')
def forgot_password():
    return render_template('member/forgot_password.html')


# Step 1: 아이디 입력 후 인증 코드 요청
@pwfind_bp.route('/member/request_reset_code', methods=['POST'])
def requestResetCode():
    if not user_id:
        return {'status': 'error', 'message': '아이디를 입력해주세요.'}


        '''