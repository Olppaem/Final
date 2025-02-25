from flask import Flask, make_response, request, jsonify, render_template, session, redirect, url_for, current_app
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from passlib.context import CryptContext
from sqlalchemy import text
from datetime import datetime, timedelta
import random
import string
import bcrypt
from functools import wraps
from flask_wtf.csrf import generate_csrf

app = Flask(__name__, static_folder='static')
app.config.from_object('config.Config')

# 기본 설정
app.secret_key = 'root1234'
app.config['JWT_SECRET_KEY'] = 'root1234'

# 데이터베이스 설정
db = SQLAlchemy(app)

# 메일 설정
app.config.update(
    MAIL_SERVER = 'smtp.gmail.com',
    MAIL_PORT = 465,
    MAIL_USE_SSL = True,
    MAIL_USERNAME = 'dhthdals0723@gmail.com',
    MAIL_PASSWORD = 'xooz nwaj ohvf defu'
)
mail = Mail(app)

# JWT 설정
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # HTTPS가 아닌 경우 False (개발 환경)
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CORS 설정
CORS(app, supports_credentials=True)

# CSRF 보호 (주석 처리됨)
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)
app.config['WTF_CSRF_ENABLED'] = False
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
###################################
@app.route('/a')
def first():
    csrf_token = generate_csrf()
    return render_template('index.html', csrf_token=csrf_token)
#########################################   


@app.route('/request-verification', methods=['POST'])
def request_verification():
    email = request.json.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # 이메일 중복 확인
    existing_email = db.session.execute(text("""
        SELECT id FROM users WHERE email = :email
    """), {"email": email}).fetchone()

    if existing_email:
        return jsonify({"error": "Email already registered"}), 400

    otp = generate_otp()

    # OTP를 데이터베이스에 저장
    try:
        db.session.execute(text("""
            INSERT INTO verifications (email, otp, verified)
            VALUES (:email, :otp, FALSE)
            ON DUPLICATE KEY UPDATE otp = :otp, verified = FALSE
        """), {"email": email, "otp": otp})
        db.session.commit()

        msg = Message('이메일 인증 코드', sender=app.config['MAIL_USERNAME'], recipients=[email])
        msg.body = f'귀하의 인증 코드는 {otp}입니다.'
        mail.send(msg)

        return jsonify({"message": "Verification code sent"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# 이메일 인증 확인
@app.route('/verify', methods=['POST'])
def verify():
    email = request.json.get('email')
    user_otp = request.json.get('otp')
    if not email or not user_otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    result = db.session.execute(text("SELECT otp FROM verifications WHERE email = :email"), {"email": email}).fetchone()
    if result and result[0] == user_otp:
        db.session.execute(text("UPDATE verifications SET verified = TRUE WHERE email = :email"), {"email": email})
        db.session.commit()
        session['verified_email'] = email  # 세션에 이메일 저장
        return jsonify({"message": "Verification successful. You can now sign up.", "redirect": url_for('sign_up')}), 200

    return jsonify({"error": "Invalid OTP"}), 400


@app.route('/signup', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'GET':
        verified_email = session.get('verified_email')
        if not verified_email:
            return redirect(url_for('index'))
        return render_template('signup.html', email=verified_email)

    if request.method == 'POST':
        data = request.json
        required_fields = ['email', 'username', 'user_id', 'password', 'password_confirm', 'postal_code', 'address', 'add_detail', 'phone_number']
        
        if not all(data.get(field) for field in required_fields):
            return jsonify({"error": "All fields are required"}), 400
        
        if data['password'] != data['password_confirm']:
            return jsonify({"error": "Passwords do not match"}), 400
        
        result = db.session.execute(text("SELECT verified FROM verifications WHERE email = :email"), {"email": data['email']}).fetchone()
        if not result or not result[0]:
            return jsonify({"error": "Email not verified"}), 400

        hashed_password = hash_password(data['password'])
        
        try:
            db.session.execute(text("""
                INSERT INTO users (username, user_id, email, password, postal_code, address, add_detail, phone_number)
                VALUES (:username, :user_id, :email, :password, :postal_code, :address, :add_detail, :phone_number)
            """), {
                "username": data['username'],
                "user_id": data['user_id'],
                "email": data['email'],
                "password": hashed_password,
                "postal_code": data['postal_code'],
                "address": data['address'],
                "add_detail": data['add_detail'],
                "phone_number": data['phone_number']
            })
            db.session.commit()
            return jsonify({"message": "Sign up successful"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"An error occurred during sign up: {str(e)}"}), 500

@app.route('/check-id', methods=['POST'])
def check_id():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # 아이디 중복 확인
        existing_id = db.session.execute(text("""
            SELECT id FROM users WHERE user_id = :user_id
        """), {"user_id": user_id}).fetchone()

        if existing_id:
            return jsonify({"available": False, "message": "이미 사용 중인 아이디입니다."}), 200
        else:
            return jsonify({"available": True, "message": "사용 가능한 아이디입니다."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/email_confirm')
def index():
    return render_template('email_confirm.html')
######################################################################################
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.route('/login', methods=['GET'])
def login_page():
    next_url = request.args.get('next')

    # JWT 토큰 유효성 검증
    try:
        verify_jwt_in_request()  # 토큰이 유효한지 확인
        current_user = get_jwt_identity()
        if not next_url:  # 'next' 파라미터가 없으면 /edit_info로 이동
            return redirect(url_for('edit_info'))
    except Exception:
        pass  # 토큰이 없거나 유효하지 않으면 로그인 페이지 렌더링

    return render_template('login.html')

# 로그인 처리 (POST)
@app.route('/login', methods=['POST'])
def login():
    user_id = request.form.get('user_id')
    password = request.form.get('password')

    user = db.session.execute(text("""
        SELECT * FROM users WHERE user_id = :user_id
    """), {"user_id": user_id}).fetchone()

    if user and pwd_context.verify(password, user.password):
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        response = jsonify({"message": "Login successful"})
        response.set_cookie('access_token_cookie', access_token, httponly=True)
        response.set_cookie('refresh_token_cookie', refresh_token, httponly=True)
        return response

    return jsonify({"error": "Invalid username or password"}), 401

# 액세스 토큰 재발급 (POST)
@app.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)  # refresh=True를 추가하여 리프레시 토큰 검증
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    response = jsonify({"access_token": new_access_token})
    response.set_cookie('access_token_cookie', new_access_token, httponly=True)
    return response

# 인증 상태 확인 (GET)
@app.route('/check-auth', methods=['GET'])
@jwt_required()
def check_auth():
    current_user = get_jwt_identity()
    return jsonify({"message": "Authenticated", "user": current_user}), 200

# 보호된 엔드포인트 (GET)
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    try:
        current_user = get_jwt_identity()
        return jsonify(logged_in_as=current_user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 422

# 잘못된 토큰 처리
@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'msg': 'Invalid token',
        'error': str(error)
    }), 422

@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})  # JSON 응답 반환
    response.delete_cookie('access_token_cookie')  # 액세스 토큰 쿠키 삭제
    response.delete_cookie('refresh_token_cookie')  # 리프레시 토큰 쿠키 삭제
    return response
###################################################################

def dev_only_jwt_required(func): #토큰 없이 우회회
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if current_app.config['DEBUG']:
            return func(*args, **kwargs)
        else:
            return jwt_required()(func)(*args, **kwargs)
    return decorated_function

@app.route('/edit_info', methods=['GET', 'POST'])
#@dev_only_jwt_required #토큰 없이 우회
@jwt_required()
def edit_info():
    token = request.cookies.get('access_token_cookie')
    if not token:
        return jsonify({"error": "Missing access token"}), 401
    current_user_id = get_jwt_identity()
    
    
    if request.method == 'GET':
        user = db.session.execute(text("""
            SELECT * FROM users WHERE user_id = :user_id
        """), {"user_id": current_user_id}).fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return render_template('edit_info.html', user=user)
    
    if request.method == 'POST':
        new_password = request.form.get('password')
        new_address = request.form.get('address')
        new_postal_code = request.form.get('postal_code')
        new_add_detail = request.form.get('add_detail')

        updates = {}
        if new_password:
            updates['password'] = hash_password(new_password)
        if new_address:
            updates['address'] = new_address
        if new_postal_code:
            updates['postal_code'] = new_postal_code
        if new_add_detail:
            updates['add_detail'] = new_add_detail

        if updates:
            try:
                update_query = "UPDATE users SET " + ", ".join([f"{key} = :{key}" for key in updates.keys()]) + " WHERE user_id = :user_id"
                updates['user_id'] = current_user_id
                db.session.execute(text(update_query), updates)
                db.session.commit()
                return jsonify({"success": True, "message": "프로필이 성공적으로 업데이트되었습니다."})
            except Exception as e:
                db.session.rollback()
                return jsonify({"success": False, "message": f"프로필 업데이트 중 오류가 발생했습니다: {str(e)}"})
        else:
            return jsonify({"success": True, "message": "변경된 내용이 없습니다."})

    return jsonify({"error": "Invalid request method"}), 405

################################################################
@app.route('/forgot_password', methods=['GET'])
def forgot_password_page():
    return render_template('forgot_password.html')

@app.route('/forgot_password', methods=['POST'])
def forgot_password():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "아이디를 입력해주세요."}), 400

    # 사용자 조회
    user = db.session.execute(text("SELECT * FROM users WHERE user_id = :user_id"), {"user_id": user_id}).fetchone()
    if not user:
        return jsonify({"error": "존재하지 않는 아이디입니다."}), 404

    # OTP 생성 및 저장
    otp = generate_otp()
    expires_at = datetime.now() + timedelta(minutes=10)

    db.session.execute(text("""
        INSERT INTO password_reset_verifications (user_id, email, otp, expires_at)
        VALUES (:user_id, :email, :otp, :expires_at)
        ON DUPLICATE KEY UPDATE otp = :otp, expires_at = :expires_at, verified = FALSE
    """), {"user_id": user.user_id, "email": user.email, "otp": otp, "expires_at": expires_at})
    db.session.commit()

    # 이메일 전송
    msg = Message('비밀번호 재설정 코드', sender=app.config['MAIL_USERNAME'], recipients=[user.email])
    msg.body = f'비밀번호 재설정 코드는 {otp}입니다. 이 코드는 10분 후 만료됩니다.'
    mail.send(msg)

    return jsonify({"message": "가입하신 이메일로 인증코드를 전송하였습니다.", "success": True}), 200

@app.route('/verify_reset_code', methods=['POST'])
def verify_reset_code():
    user_id = request.json.get('user_id')
    otp = request.json.get('otp')
    
    if not user_id or not otp:
        return jsonify({"error": "아이디와 인증 코드를 모두 입력해주세요."}), 400

    # 인증 코드 검증
    result = db.session.execute(text("""
        SELECT * FROM password_reset_verifications 
        WHERE user_id = :user_id AND otp = :otp AND expires_at > NOW() AND verified = FALSE
    """), {"user_id": user_id, "otp": otp}).fetchone()

    if result:
        # 인증 완료 처리
        db.session.execute(text("""
            UPDATE password_reset_verifications SET verified = TRUE WHERE user_id = :user_id
        """), {"user_id": user_id})
        db.session.commit()
        return jsonify({"message": "인증이 완료되었습니다.", "success": True}), 200
    else:
        return jsonify({"error": "잘못된 인증 코드이거나 만료되었습니다."}), 400

@app.route('/reset_password', methods=['POST'])
def reset_password():
    user_id = request.json.get('user_id')
    new_password = request.json.get('new_password')
    confirm_password = request.json.get('confirm_password')

    if not user_id or not new_password or not confirm_password:
        return jsonify({"error": "모든 필드를 입력해주세요."}), 400

    if new_password != confirm_password:
        return jsonify({"error": "비밀번호가 일치하지 않습니다."}), 400

    # 인증 상태 확인
    verification = db.session.execute(text("""
        SELECT * FROM password_reset_verifications WHERE user_id = :user_id AND verified = TRUE
    """), {"user_id": user_id}).fetchone()

    if not verification:
        return jsonify({"error": "인증되지 않은 사용자입니다."}), 400

    # 비밀번호 해싱 및 업데이트
    hashed_password = hash_password(new_password)
    
    db.session.execute(text("""
        UPDATE users SET password = :password WHERE user_id = :user_id
    """), {"password": hashed_password, "user_id": user_id})
    
    db.session.commit()

    # 인증 데이터 삭제
    db.session.execute(text("""
        DELETE FROM password_reset_verifications WHERE user_id = :user_id
    """), {"user_id": user_id})
    
    db.session.commit()

    return jsonify({"message": "비밀번호가 성공적으로 재설정되었습니다.", "success": True}), 200

#########################################################################################
@app.route('/user_delete', methods=['GET'])
@dev_only_jwt_required
def user_delete_page():
    return render_template('user_delete.html')

@app.route('/user_delete', methods=['POST'])
@dev_only_jwt_required
def user_delete():
    if app.config['DEBUG']:
        current_user_id = 'test2'
    else:
        current_user_id = get_jwt_identity()
    
    password = request.json.get('password')

    if not password:
        return jsonify({"error": "비밀번호를 입력해주세요."}), 400

    user = db.session.execute(text("""
        SELECT * FROM users WHERE user_id = :user_id
    """), {"user_id": current_user_id}).fetchone()

    if not user:
        return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404

    try:
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            db.session.execute(text("""
                DELETE FROM users WHERE user_id = :user_id
            """), {"user_id": current_user_id})
            db.session.commit()
            return jsonify({"message": "회원 탈퇴가 완료되었습니다.", "success": True}), 200
        else:
            return jsonify({"error": "비밀번호가 일치하지 않습니다."}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error during user deletion: {str(e)}")
        return jsonify({"error": "회원 탈퇴 중 오류가 발생했습니다."}), 500
    
##################################################################




if __name__ == '__main__':
    app.run(debug=True)

