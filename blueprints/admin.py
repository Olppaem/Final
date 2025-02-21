from flask import Blueprint, render_template

# 📌 Flask Blueprint 생성 (이름 반드시 'admin_bp'으로 맞출 것)
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# 📌 관리자 로그인 페이지
@admin_bp.route('/login')
def admin_login():
    return render_template('admin_login.html')  # 관리자 로그인 페이지
