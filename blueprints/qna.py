from flask import Blueprint, render_template, request, redirect, url_for,jsonify
from blueprints.utils import get_db_connection
#from flask_login import login_required, current_user
qna_bp = Blueprint('qna', __name__,url_prefix='/qna')

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
        SELECT inquiry_id, title, content, userID, comment, status, created_at
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

    return jsonify(inquiry)

# 문의사항 등록 페이지 (입력 폼)
@qna_bp.route('/create')
def qna_create():
    return render_template('qna/qna_create.html')



