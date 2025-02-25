from flask import Blueprint

# 🔹 API 파일에서 Blueprint 가져오기
from .qna import qna_bp
from .notices import notices_bp
from .admin import admin_bp
from .reservation import reservation_bp
from .login import login_bp
from .pwfind import pwfind_bp


# 🔹 Blueprint 리스트를 만들어서 한 번에 등록할 수 있도록 설정
blueprints = [qna_bp, notices_bp, admin_bp,reservation_bp,login_bp,pwfind_bp]
