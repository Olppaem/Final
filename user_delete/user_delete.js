document.addEventListener("DOMContentLoaded", function () {
    const correctPassword = "1234"; // 올바른 비밀번호 (예제)
    
    document.getElementById("passwordForm").addEventListener("submit", function (event) {
        event.preventDefault(); // 기본 제출 방지

        const inputPassword = document.getElementById("password").value;
        const errorMessage = document.getElementById("error-message");

        if (inputPassword === correctPassword) {
            alert("비밀번호가 확인되었습니다.");
            window.location.href = "next_page.html"; // 다음 페이지로 이동
        } else {
            errorMessage.style.display = "block";
        }
    });
});