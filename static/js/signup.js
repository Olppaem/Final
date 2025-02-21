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
    const signupForm = document.getElementById("signupForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm_password");
    const phoneInput = document.getElementById("phone");
    const userIdInput = document.getElementById("userId");
    const nameInput = document.getElementById("name");
    const checkIdBtn = document.getElementById("checkIdBtn");

    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const phoneError = document.getElementById("phoneError");
    const userIdError = document.getElementById("userIdError");
    const nameError = document.getElementById("nameError");
    const userIdCheckError = document.getElementById("userIdCheckError");

    let isUserIdChecked = false; // 중복 체크 여부 확인 변수

    function validateField(input, regex, errorElement, errorMessage) {
        input.addEventListener("input", function() {
            if (!regex.test(input.value)) {
                errorElement.style.display = "block";
                errorElement.innerText = errorMessage;
            } else {
                errorElement.style.display = "none";
            }
        });

        input.addEventListener("blur", function() {
            if (input.value.trim() === "") {
                errorElement.style.display = "none";
            }
        });
    }

    // 🔹 비밀번호 유효성 검사
    if (passwordInput) {
        validateField(
            passwordInput, 
            /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/, 
            passwordError, 
            "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 설정해야 합니다."
        );
    }

    // 🔹 비밀번호 확인 검사
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", function() {
            confirmPasswordError.style.display = (passwordInput.value !== confirmPasswordInput.value) ? "block" : "none";
            confirmPasswordError.innerText = "비밀번호가 일치하지 않습니다.";
        });
    }

    // 🔹 전화번호 유효성 검사
    if (phoneInput) {
        validateField(
            phoneInput, 
            /^010-\d{4}-\d{4}$|^010\d{8}$/, 
            phoneError, 
            "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678 또는 01012345678)"
        );
    }

    // 🔹 아이디 유효성 검사
    if (userIdInput) {
        validateField(
            userIdInput, 
            /^[a-zA-Z0-9]{5,15}$/, 
            userIdError, 
            "아이디는 영문과 숫자로 구성된 5~15자여야 합니다."
        );

        // 아이디 입력 시 중복 체크 여부 초기화
        userIdInput.addEventListener("input", function() {
            isUserIdChecked = false;
            userIdCheckError.style.display = "block";
            userIdCheckError.innerText = "아이디 중복 확인을 해주세요.";
        });
    }

    // 🔹 이름 유효성 검사
    if (nameInput) {
        nameInput.addEventListener("input", function() {
            nameError.style.display = (nameInput.value.trim().length < 2) ? "block" : "none";
            nameError.innerText = "이름은 최소 2자 이상 입력해야 합니다.";
        });
    }

    // 🔹 아이디 중복 체크 버튼 이벤트
    if (checkIdBtn) {
        checkIdBtn.addEventListener("click", function() {
            const userId = userIdInput.value.trim();
            if (!/^[a-zA-Z0-9]{5,15}$/.test(userId)) {
                userIdCheckError.style.display = "block";
                userIdCheckError.innerText = "유효한 아이디를 입력하세요.";
                return;
            }

            // 가상의 중복 체크 함수 (서버 통신 필요)
            checkDuplicateUserId(userId)
                .then(isAvailable => {
                    if (isAvailable) {
                        userIdCheckError.style.display = "none";
                        isUserIdChecked = true;
                    } else {
                        userIdCheckError.style.display = "block";
                        userIdCheckError.innerText = "이미 사용 중인 아이디입니다.";
                        isUserIdChecked = false;
                    }
                })
                .catch(() => {
                    userIdCheckError.style.display = "block";
                    userIdCheckError.innerText = "서버 오류 발생. 다시 시도해주세요.";
                });
        });
    }

    // 🔹 폼 제출 시 모든 유효성 검사 확인 + 중복 체크 확인
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            if (
                passwordError.style.display === "block" ||
                confirmPasswordError.style.display === "block" ||
                userIdError.style.display === "block" ||
                phoneError.style.display === "block" ||
                nameError.style.display === "block" ||
                !isUserIdChecked
            ) {
                event.preventDefault(); // 검증 실패 시 폼 제출 방지
                if (!isUserIdChecked) {
                    userIdCheckError.style.display = "block";
                    userIdCheckError.innerText = "아이디 중복 확인을 해주세요.";
                }
            }
        });
    }

    // 🔹 주소 찾기 버튼 기능
    document.getElementById("findAddressBtn").addEventListener("click", function() {
        new daum.Postcode({
            oncomplete: function(data) {
                document.getElementById("postcode").value = data.zonecode;
                document.getElementById("address").value = data.address;
            }
        }).open();
    });

});

// 🔹 가상의 서버 중복 체크 함수
function checkDuplicateUserId(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingUsers = ["test123", "user456", "admin"];
            resolve(!existingUsers.includes(userId));
        }, 500);
    });
}

        // 🔹 다음 주소 검색 API
        const findAddressBtn = document.getElementById("findAddressBtn");
        if (findAddressBtn) {
            findAddressBtn.addEventListener("click", function() {
                if (typeof daum === "undefined" || !daum.Postcode) {
                    console.error("다음 주소 API가 로드되지 않았습니다.");
                    alert("주소 검색 기능을 사용할 수 없습니다. 페이지를 새로고침 해주세요.");
                    return;
                }
    
                new daum.Postcode({
                    oncomplete: function(data) {
                        document.getElementById("postcode").value = data.zonecode;
                        document.getElementById("address").value = data.roadAddress || data.jibunAddress;
                    }
                }).open();
            });
        }
    
        // 🔹 아이디 중복 체크 기능
        const checkDuplicateBtn = document.getElementById("checkIdBtn");
        if (checkDuplicateBtn) {
            checkDuplicateBtn.addEventListener("click", checkDuplicateId);
        }
    

    

// // 저장한 이메일 가져오기
//     document.addEventListener("DOMContentLoaded", function () {
//         const emailInput = document.getElementById("email");
    
//         // sessionStorage에서 이메일 가져와서 자동 입력
//         const verifiedEmail = sessionStorage.getItem("verifiedEmail");
//         if (verifiedEmail) {
//             emailInput.value = verifiedEmail; // 이메일 필드 자동 입력
    //     }
    // });    
    // 전페이지에서 저장

    // 이메일 인증 후, 인증된 이메일을 저장
//function saveEmail(email) {
    // sessionStorage.setItem("verifiedEmail", email); // sessionStorage에 저장
    // window.location.href = "signup.html"; // 회원가입 페이지로 이동

