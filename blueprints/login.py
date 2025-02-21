from flask import Blueprint, render_template

# 블루프린트 생성
login_bp = Blueprint('login', __name__, url_prefix='/auth')

# 로그인 페이지
@login_bp.route('/login')
def login():
    return render_template('login.html')

# 회원가입 페이지
@login_bp.route('/signup')
def signup():
    return render_template('signup.html')
