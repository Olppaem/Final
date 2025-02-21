from flask import Blueprint, render_template

reservation_bp = Blueprint('reservation', __name__, url_prefix='/reservation')

# 📌 예약 페이지 라우트
@reservation_bp.route('/')
def main():
    return render_template('reservation.html')
