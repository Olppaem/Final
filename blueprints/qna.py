from flask import Blueprint, render_template, request, redirect, url_for,jsonify,send_from_directory
from blueprints.utils import get_db_connection
#from flask_login import login_required, current_user
qna_bp = Blueprint('qna', __name__,url_prefix='/qna')

UPLOAD_FOLDER='static/uploads/'

# 📌 문의사항 목록 페이지 (HTML 반환)
@qna_bp.route('/')
def qna_page():
    """문의사항 목록 페이지 렌더링"""
    return render_template('qna/qna.html')  # JS에서 API 호출하여 데이터 표시

# 📌 문의사항 목록 API (JSON 반환)
@qna_bp.route('/api')
def qna_api():
    """문의사항 데이터를 JSON으로 반환"""
    conn = get_db_connection()
    cursor = conn.cursor()

    per_page = 5  # 페이지당 문의 개수
    page = request.args.get('page', 1, type=int)  # 페이지 값 가져오기
    offset = (page - 1) * per_page  

    # 문의사항 목록 조회
    cursor.execute("""
        SELECT inquiry_id, title, userID, status, created_at
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """, (per_page, offset))
    inquiries = cursor.fetchall()

    # 전체 문의사항 개수 조회
    cursor.execute("SELECT COUNT(*) AS total FROM inquiries")
    total_inquiries = cursor.fetchone()['total']
    total_pages = (total_inquiries + per_page - 1) // per_page  

    conn.close()

    # `created_at` 날짜를 문자열로 변환
    for inquiry in inquiries:
        if 'created_at' in inquiry and inquiry['created_at'] is not None:
            inquiry['created_at'] = inquiry['created_at'].strftime('%Y-%m-%d')

    return jsonify({'inquiries': inquiries, 'total_pages': total_pages})



# 📌 나의 문의 HTML 페이지 반환
@qna_bp.route('/my')
#@login_required  # 로그인한 사용자만 접근 가능
def my_inquiries_page():
    return render_template('qna/qna_my.html')

# 📌 나의 문의 API (로그인한 사용자만 조회, JS에서 페이지네이션 처리)
@qna_bp.route('/api/my')
#@login_required  # 로그인한 사용자만 API 호출 가능
def my_inquiries_api():
    """나의 문의 데이터를 JSON으로 반환 (현재 로그인 필터링 미적용)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    per_page = 3  # 페이지당 개수
    page = request.args.get('page', 1, type=int)
    offset = (page - 1) * per_page

    # ✅ 현재는 모든 데이터를 가져옴 (나중에 로그인 기능이 추가되면 `WHERE userID = %s` 조건 활성화)
    cursor.execute('''
        SELECT inquiry_id, title, status, created_at
        FROM inquiries
        -- WHERE userID = %s  ✅ 로그인한 사용자의 ID로 필터링 (현재 주석 처리)
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    ''', (per_page, offset))
    
    inquiries = cursor.fetchall()

    # 총 문의 개수 조회 (현재 모든 문의 개수를 반환)
    cursor.execute('SELECT COUNT(*) AS total FROM inquiries')
    total_inquiries = cursor.fetchone()['total']
    total_pages = (total_inquiries + per_page - 1) // per_page

    conn.close()

    # ✅ 날짜 변환
    for inquiry in inquiries:
        if 'created_at' in inquiry and inquiry['created_at'] is not None:
            inquiry['created_at'] = inquiry['created_at'].strftime('%Y-%m-%d')

    return jsonify({'inquiries': inquiries, 'total_pages': total_pages})

# 📌 문의사항 상세 페이지 (HTML 반환)
@qna_bp.route('/<int:qna_id>')
def qna_detail_page(qna_id):
    """문의사항 상세 페이지를 렌더링하는 엔드포인트"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # ✅ 올바른 컬럼명으로 수정하여 데이터 조회
    cursor.execute('''
        SELECT inquiry_id, title, content, userID, comment, status, created_at, file
        FROM inquiries
        WHERE inquiry_id = %s
    ''', (qna_id,))
    
    inquiry = cursor.fetchone()
    conn.close()

    if not inquiry:
        return "문의사항을 찾을 수 없습니다.", 404

    # ✅ HTML 페이지 렌더링 시 inquiry 데이터를 넘겨줌
    return render_template('qna/qna_detail.html', inquiry=inquiry)

# 📌 문의사항 상세 API (JSON 반환)
@qna_bp.route('/api/<int:qna_id>')
def qna_detail_api(qna_id):
    """문의사항 상세 데이터를 JSON으로 반환하는 API"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT inquiry_id, title, content, userID, comment, status, created_at
        FROM inquiries
        WHERE inquiry_id = %s
    ''', (qna_id,))
    
    inquiry = cursor.fetchone()
    conn.close()

    if not inquiry:
        return jsonify({'error': '문의사항을 찾을 수 없습니다.'}), 404

    # ✅ JSON 직렬화를 위해 날짜 변환
    if 'created_at' in inquiry and inquiry['created_at']:
        inquiry['created_at'] = inquiry['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    # ✅ 파일이 있는 경우 파일 경로 추가
    file_url = None
    if inquiry['file']:
        file_url = url_for('qna.download_file', filename=os.path.basename(inquiry['file']))  
    if inquiry['file'] is None:
        inquiry['file']= ""

    return jsonify({
        'inquiry_id': inquiry['inquiry_id'],
        'title': inquiry['title'],
        'content': inquiry['content'],
        'userID': inquiry['userID'],
        'comment': inquiry['comment'],
        'status': inquiry['status'],
        'created_at': inquiry['created_at'],
        'file_url': file_url  # ✅ 파일 다운로드 URL 추가
    })

# 📌 파일 다운로드 API
@qna_bp.route('/download/<filename>')
def download_file(filename):
    """업로드된 파일을 다운로드하는 API"""
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

# 문의사항 등록 페이지 (입력 폼)
@qna_bp.route('/create',methods=['GET'])
def qna_create_page():
    return render_template('qna/qna_create.html')

# 📌 문의사항 등록 API (POST 요청)
@qna_bp.route('/api/create', methods=['POST'])
def qna_create_api():
    """문의사항을 DB에 등록하는 API"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # ✅ 요청 데이터 가져오기
    data = request.form
    title = data.get('title')
    content = data.get('content')
    file = request.files.get('file')  # 파일 업로드 처리
    is_private = data.get('isPrivate') == "true"  # 문자열을 Boolean으로 변환
    user_id = "test_user"  # ❗️ 나중에 로그인한 사용자 ID로 대체해야 함

    # ✅ 파일 저장 (파일이 있을 경우)
    file_url = None
    if file:
        file_path = f"static/uploads/{file.filename}"
        file.save(file_path)
        file_url = file_path

    # ✅ DB에 저장
    cursor.execute('''
        INSERT INTO inquiries (userID, title, content, file, is_secret, status, created_at)
        VALUES (%s, %s, %s, %s, %s, 'Pending', NOW())
    ''', (user_id, title, content, file_url, is_private))

    conn.commit()
    conn.close()

    # ✅ 문의사항 목록 페이지로 리디렉트
    return jsonify({'message': '문의사항이 성공적으로 등록되었습니다.', 'redirect_url': url_for('qna.qna_page')})

# 📌 문의사항 수정 페이지 (HTML 반환)
@qna_bp.route('/edit/<int:qna_id>', methods=['GET'])
def qna_edit_page(qna_id):
    """문의사항 수정 페이지 렌더링"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT inquiry_id, title, content, file, is_secret, status
        FROM inquiries
        WHERE inquiry_id = %s
    ''', (qna_id,))
    
    inquiry = cursor.fetchone()
    conn.close()

    if not inquiry:
        return "문의사항을 찾을 수 없습니다.", 404

    return render_template('qna/qna_edit.html', inquiry=inquiry)

# 📌 문의사항 수정 API (POST 요청)
@qna_bp.route('/api/edit/<int:qna_id>', methods=['POST'])
def qna_edit_api(qna_id):
    """문의사항을 수정하는 API"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # ✅ 요청 데이터 가져오기
    data = request.form
    title = data.get('title')
    content = data.get('content')
    is_private = data.get('isPrivate') == "true"

    # 필수 필드 확인
    if not title or not content:
        return jsonify({'error': '제목과 내용을 입력하세요.'}), 400

    # ✅ 기존 파일 유지
    cursor.execute("SELECT file FROM inquiries WHERE inquiry_id = %s", (qna_id,))
    existing_file_data = cursor.fetchone()

    existing_file = existing_file_data['file'] if existing_file_data else None

    file = request.files.get('file')
    file_url = existing_file

    if file:
        filename = file.filename  # 원본 파일명 유지
        file_path = f"static/uploads/{filename}"
        file.save(file_path)
        file_url = file_path  # 새로운 파일 저장

    # ✅ 기존 글 수정
    cursor.execute('''
        UPDATE inquiries
        SET title = %s, content = %s, file = %s, is_secret = %s, updated_at = NOW()
        WHERE inquiry_id = %s
    ''', (title, content, file_url, is_private, qna_id))

    conn.commit()
    conn.close()

    return jsonify({'message': '문의사항이 성공적으로 수정되었습니다.', 'redirect_url': url_for('qna.qna_page')})
