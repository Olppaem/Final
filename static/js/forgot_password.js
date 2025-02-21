const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
}); 
document.addEventListener("DOMContentLoaded", function () {
    // 비밀번호 찾기 폼 처리
    const form = document.getElementById("find_passwd_user-form");

    if (form) { // form 요소가 존재할 경우에만 이벤트 리스너 추가
        form.addEventListener("submit", async function (event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            const userID = document.querySelector("input[name='userID']").value.trim();

            if (!userID) {
                alert("ID를 입력해주세요.");
                return;
            }

            try {
                // 서버로 ID를 전송하여 이메일 확인 및 인증 코드 전송 요청
                const response = await fetch("/api/find-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userID }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("이메일로 인증 코드가 전송되었습니다.");
                    window.location.href = "find_pw_email.html";
                } else {
                    alert(result.message || "해당 ID를 찾을 수 없습니다.");
                }
            } catch (error) {
                console.error("에러 발생:", error);
                alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
            }
        });
    }

    // ✅ 이메일 정보를 동적으로 가져와서 label 업데이트
    function fetchEmail() {
        // 서버에서 이메일 정보를 가져온다고 가정 (현재는 더미 데이터)
        const email = "user@example.com"; // 실제 API 연동 필요

        console.log("서버에서 가져온 이메일:", email); // 디버깅용 로그 확인

        // 이메일 표시 업데이트 (✅ innerHTML 대신 textContent 사용)
        const emailLabel = document.getElementById("email_label");
        if (emailLabel) {
            emailLabel.textContent = `${email}로 인증번호를 보냈습니다.\n인증번호를 입력해주세요.`;
        }
    }

    // ✅ 페이지 로드 시 fetchEmail 실행
    fetchEmail();
});

// 새 비밀번호 입력 코드
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("password_reset_form"); // 폼 ID 설정
    const passwordInput = document.querySelector("input[name='password']");
    const confirmPasswordInput = document.querySelector("input[name='password_confirm']");
    const submitButton = document.querySelector(".new_passwd_butt button"); // 버튼 선택

    // 오류 메시지를 표시할 요소 생성 및 클래스 추가
    const passwordError = document.createElement("p");
    const confirmPasswordError = document.createElement("p");

    passwordError.classList.add("error-message");
    confirmPasswordError.classList.add("error-message");

    // 오류 메시지 위치 설정
    passwordInput.parentNode.appendChild(passwordError);
    confirmPasswordInput.parentNode.appendChild(confirmPasswordError);

    // 🔹 버튼 상태 업데이트 함수
    function updateButtonState() {
        if (passwordError.style.display === "block" || confirmPasswordError.style.display === "block") {
            submitButton.disabled = true; // 에러가 있으면 버튼 비활성화
            submitButton.style.backgroundColor = "#aaa"; // 비활성화 시 스타일 변경
        } else {
            submitButton.disabled = false; // 에러가 없으면 버튼 활성화
            submitButton.style.backgroundColor = "#333"; // 원래 색상 복구
        }
    }

    // ✅ 필드 유효성 검사 함수 (정규식 사용)
    function validateField(input, regex, errorElement, errorMessage) {
        input.addEventListener("input", function () {
            if (!regex.test(input.value)) {
                errorElement.style.display = "block";
                errorElement.innerText = errorMessage;
            } else {
                errorElement.style.display = "none";
            }
            updateButtonState(); // 버튼 상태 업데이트
        });
    }

    // 🔹 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함 8~20자)
    if (passwordInput) {
        validateField(
            passwordInput, 
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/, 
            passwordError, 
            "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 설정해야 합니다."
        );
    }

    // 🔹 비밀번호 확인 검사 (비밀번호와 일치하는지 확인)
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", function () {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordError.style.display = "block";
                confirmPasswordError.innerText = "비밀번호가 일치하지 않습니다.";
            } else {
                confirmPasswordError.style.display = "none";
            }
            updateButtonState(); // 버튼 상태 업데이트
        });
    }

    // 🔹 폼 제출 시 최종 검증 (버튼이 비활성화된 경우 제출 방지)
    form.addEventListener("submit", function (event) {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

        if (!passwordRegex.test(password)) {
            event.preventDefault();
            passwordError.style.display = "block";
            passwordError.innerText = "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 설정해야 합니다.";
            updateButtonState();
            return;
        }

        if (password !== confirmPassword) {
            event.preventDefault();
            confirmPasswordError.style.display = "block";
            confirmPasswordError.innerText = "비밀번호가 일치하지 않습니다.";
            updateButtonState();
            return;
        }

        // 버튼이 비활성화 상태이면 폼 제출 막기
        if (submitButton.disabled) {
            event.preventDefault();
            return;
        }
    });
});
