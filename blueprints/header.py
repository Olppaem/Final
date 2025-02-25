from flask import Blueprint, Flask, render_template, session, redirect, url_for

header_bp = Blueprint('header', __name__, url_prefix='/header')

app = Flask(__name__)
app.secret_key = "supersecretkey"  # 세션을 위한 키

# 📌 메인 페이지 (헤더를 동적으로 출력)
@app.route("/")
def home():
    # 세션에서 로그인 상태 확인
    user = session.get("user")  # 사용자 정보
    isadmin = session.get("isadmin")  # 관리자 여부

    # 로그인 상태에 따른 헤더 구분
    if user:
        if isadmin:
            header_type = "header_admin.html"  # 관리자 헤더
        else:
            header_type = "header_login.html"  # 일반 사용자 헤더
    else:
        header_type = "header_unlogin.html"  # 비로그인 상태 헤더

    return render_template("index.html", header_template=header_type)

# 📌 로그인 처리
@app.route("/login")
def login():
    # 예제 사용자 정보 (DB 연동 시 실제 사용자 인증 필요)
    session["user"] = "kimcs"
    session["isadmin"] = False  # 일반 사용자
    return redirect(url_for("home"))

# 📌 관리자 로그인 처리
@app.route("/admin_login")
def admin_login():
    session["user"] = "admin123"
    session["isadmin"] = True  # 관리자
    return redirect(url_for("home"))

# 📌 로그아웃 처리
@app.route("/logout")
def logout():
    session.clear()  # 세션 삭제 (로그아웃)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
