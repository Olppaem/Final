 //헤더
const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});
//여기까지 헤더


document.addEventListener("DOMContentLoaded", function() {
    const Edit_memberinfoForm = document.getElementById("Edit_memberinfoForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    // 🔹 수정 버튼 클릭 시 동작
    document.getElementById("updateBtn").addEventListener("click", function() {
        // 🔹 비밀번호 유효성 검사
        if (passwordInput) {
            passwordInput.addEventListener("input", function() {
                if (passwordInput.value !== "") {
                    // 비밀번호 유효성 검사를 진행
                    const isValid = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(passwordInput.value);
                    if (!isValid) {
                        passwordError.style.display = "block";
                        passwordError.innerText = "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 설정해야 합니다.";
                    } else {
                        passwordError.style.display = "none"; // 유효하면 오류 메시지 숨김
                    }
                } else {
                    passwordError.style.display = "none"; // 비밀번호 입력이 없으면 오류 메시지 숨김
                }
            });
        }

        // 🔹 비밀번호 확인 검사
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener("input", function() {
                if (passwordInput.value !== "") {  // 비밀번호 입력이 있을 때만 검사 수행
                    if (confirmPasswordInput.value !== passwordInput.value) {
                        confirmPasswordError.style.display = "block";
                        confirmPasswordError.innerText = "비밀번호가 일치하지 않습니다.";
                    } else {
                        confirmPasswordError.style.display = "none"; // 비밀번호가 일치하면 오류 메시지 숨김
                    }
                } else {
                    confirmPasswordError.style.display = "none"; // 비밀번호 입력이 없으면 오류 메시지 숨김
                }
            });
        }
    



    // 🔹 폼 제출 시 처리 (비밀번호와 주소가 비어있으면 무시)
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지
        
        // 비밀번호 변경 처리
        if (passwordInput.value === "" && confirmPasswordInput.value === "") {
            console.log("비밀번호 변경을 진행하지 않습니다.");
        } else if (passwordInput.value === confirmPasswordInput.value) {
            console.log("비밀번호 변경 진행: ", passwordInput.value);
        } else {
            console.log("비밀번호가 일치하지 않습니다.");
            return; // 비밀번호가 일치하지 않으면 제출 중단
        }

        // 주소 변경 처리
        const postcode = document.getElementById("postcode").value;
        const address = document.getElementById("address").value;
        const extraAddress = document.getElementById("extra_address").value;

        if (postcode === "" || address === "") {
            console.log("주소 변경을 진행하지 않습니다.");
        } else {
            console.log("주소 변경 진행: ", postcode, address, extraAddress);
        }

        // 기타 폼 데이터 처리
        // 실제로 서버로 데이터를 전송하려면 이 부분에 AJAX 등을 사용해 전송 로직을 추가
        console.log("폼 제출 완료!");
        });
    });
});
