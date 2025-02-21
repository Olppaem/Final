from flask import Flask
from blueprints import blueprints  # `__init__.py`에서 가져옴



app = Flask(__name__)

# 🔹 Blueprint 등록
for bp in blueprints:
    app.register_blueprint(bp)

# 📌 현재 등록된 모든 URL 확인 (디버깅 용도)
print(app.url_map)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
