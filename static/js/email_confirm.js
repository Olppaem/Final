document.addEventListener("DOMContentLoaded", function() {
    // 네비게이션 토글 버튼
    const toggleBtn = document.querySelector(".navbar_togglebtn");
    const menu = document.querySelector(".navbar_menu");
    const member = document.querySelector(".navbar_member");

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("active");
        member.classList.toggle("active");
    });

    // 이메일 인증 코드 전송 버튼
    document.getElementById("email-button").addEventListener("click", function() {
        const emailInput = document.querySelector('input[name="mail"]');
        const email = emailInput.value.trim(); // 공백 제거

        if (!validateEmail(email)) {
            alert("유효한 이메일 주소를 입력하세요.");
            return;
        }

        sendEmailVerificationCode(email);
    });

    // 인증 코드 확인 버튼
    document.getElementById("code-button").addEventListener("click", function() {
        const codeInput = document.querySelector('input[name="mail_code"]');
        const code = codeInput.value.trim(); // 공백 제거

        if (!code) {
            alert("인증 코드를 입력하세요.");
            return;
        }

        verifyEmailCode(code);
    });
});

// 이메일 인증 코드 전송 함수
function sendEmailVerificationCode(email) {
    console.log("인증 코드 전송 요청:", email);

    // AJAX 요청을 보낼 수 있도록 구현
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/send-email-verification", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert("인증 코드가 이메일로 전송되었습니다.");
            } else {
                alert("이메일 전송에 실패했습니다. 다시 시도해 주세요.");
            }
        }
    };

    xhr.send(JSON.stringify({ email: email }));
}

// 이메일 인증 코드 검증 함수
function verifyEmailCode(code) {
    console.log("인증 코드 확인 요청:", code);

    // 서버에서 받은 실제 코드 (테스트용 하드코딩, 실제 서버와 연동 필요)
    const correctCode = "1234"; // 실제로는 서버 응답값을 이용해야 함

    if (code === correctCode) {
        document.getElementById("verification-message").style.display = "block";
        document.getElementById("verification-error").style.display = "none";

        // 인증 성공 후 회원가입 페이지로 이동
        setTimeout(function() {
            window.location.href = "signup.html"; // 회원가입 페이지 URL로 변경
        }, 500);
    } else {
        document.getElementById("verification-message").style.display = "none";
        document.getElementById("verification-error").style.display = "block";
    }
}

// 이메일 유효성 검사 함수
function validateEmail(email) {
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
