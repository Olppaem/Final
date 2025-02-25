const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
}); 

// step 1
async function requestResetCode() {
    const userId = document.getElementById("user_id").value;

    if (!userId) {
        document.getElementById("step1Message").textContent = "아이디를 입력하세요.";
        return;
    }

    const response = await fetch('/member/request-reset-code', {  // ✅ 엔드포인트 변경
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    });

    const result = await response.json();
    document.getElementById("step1Message").textContent = result.message;

    if (result.success) {
        document.getElementById("step1_form").classList.add("hidden");
        document.getElementById("step2_form").classList.remove("hidden");
    }
}

//step 2
async function verifyResetCode() {
    const otp = document.getElementById("otp").value;

    if (!otp) {
        document.getElementById("step2Message").textContent = "인증 코드를 입력하세요.";
        return;
    }

    const response = await fetch('/member/verify-reset-code', {  // ✅ 엔드포인트 변경
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
    });

    const result = await response.json();
    document.getElementById("step2Message").textContent = result.message;

    if (result.success) {
        document.getElementById("step2_form").classList.add("hidden");
        document.getElementById("step3_form").classList.remove("hidden");
    }
}

async function resetPassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (!newPassword || !confirmPassword) {
        document.getElementById("step3Message").textContent = "비밀번호를 입력하세요.";
        return;
    }

    if (newPassword !== confirmPassword) {
        document.getElementById("step3Message").textContent = "비밀번호가 일치하지 않습니다.";
        return;
    }

    const response = await fetch('/member/reset-password', {  // ✅ 엔드포인트 변경
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword })
    });

    const result = await response.json();
    document.getElementById("step3Message").textContent = result.message;

    if (result.success) {
        alert("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
        window.location.href = "/login"; // 로그인 페이지로 이동
    }
}

// 폼 이벤트 리스너 추가
document.getElementById("step3_form").addEventListener("submit", resetPassword);


/*
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ 페이지 로드 완료");

    const step1Form = document.getElementById("step1_form");
    const step2Form = document.getElementById("step2_form");
    const step3Form = document.getElementById("step3_form");
    const step1Message = document.getElementById("step1Message");
    const step2Message = document.getElementById("step2Message");
    const step3Message = document.getElementById("step3Message");

    if (!step1Form || !step2Form || !step3Form) {
        console.error("❌ 오류: 필요한 폼(step1_form, step2_form, step3_form) 중 하나를 찾을 수 없습니다.");
        return;
    }

    console.log("✅ step1_form 확인됨:", step1Form);
    console.log("✅ step2_form 확인됨:", step2Form);
    console.log("✅ step3_form 확인됨:", step3Form);

    // ✅ Step 1: 아이디 입력 후 인증 코드 요청
    step1Form.addEventListener("submit", function (event) {
        event.preventDefault(); // 기본 폼 제출 방지
        requestResetCode();
    });

    // ✅ Step 2: 인증 코드 확인
    step2Form.addEventListener("submit", function (event) {
        event.preventDefault();
        verifyResetCode();
    });

    // ✅ Step 3: 비밀번호 재설정
    step3Form.addEventListener("submit", function (event) {
        event.preventDefault();
        resetPassword();
    });
});

function requestResetCode() {
    console.log("✅ [requestResetCode] 함수 실행됨");
    
    const userId = document.getElementById("user_id").value.trim();
    const step1Message = document.getElementById("step1Message");

    if (!userId) {
        step1Message.textContent = "❌ 아이디를 입력해주세요.";
        step1Message.style.color = "red";
        return;
    }

    // ✅ 서버 요청
    fetch("/member/request_reset_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔄 서버 응답:", data);
        step1Message.textContent = data.message;
        step1Message.style.color = data.status === "success" ? "green" : "red";

        if (data.status === "success") {
            setTimeout(() => {
                document.getElementById("step1").classList.add("hidden");
                document.getElementById("step2").classList.remove("hidden");
            }, 1000);
        }
    })
    .catch(error => {
        console.error("❌ 오류 발생:", error);
        step1Message.textContent = "⚠ 서버 오류 발생. 다시 시도해주세요.";
        step1Message.style.color = "red";
    });
}

function verifyResetCode() {
    console.log("✅ [verifyResetCode] 함수 실행됨");

    const userId = document.getElementById("user_id").value;
    const otp = document.getElementById("otp").value;
    const step2Message = document.getElementById("step2Message");

    fetch("/member/verify_reset_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, otp: otp })
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔄 서버 응답:", data);
        step2Message.textContent = data.message;
        step2Message.style.color = data.status === "success" ? "green" : "red";
        
        if (data.status === "success") {
            setTimeout(() => {
                document.getElementById("step2").classList.add("hidden");
                document.getElementById("step3").classList.remove("hidden");
            }, 1000);
        }
    })
    .catch(error => {
        console.error("❌ 오류 발생:", error);
        step2Message.textContent = "⚠ 서버 오류 발생. 다시 시도해주세요.";
        step2Message.style.color = "red";
    });
}

function resetPassword() {
    console.log("✅ [resetPassword] 함수 실행됨");

    const userId = document.getElementById("user_id").value;
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const step3Message = document.getElementById("step3Message");

    if (newPassword !== confirmPassword) {
        step3Message.textContent = "비밀번호가 일치하지 않습니다.";
        step3Message.style.color = "red";
        return;
    }

    fetch("/member/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_password: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔄 서버 응답:", data);
        step3Message.textContent = data.message;
        step3Message.style.color = data.status === "success" ? "green" : "red";
        
        if (data.status === "success") {
            alert("비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.");
            window.location.href = "/login";
        }
    })
    .catch(error => {
        console.error("❌ 오류 발생:", error);
        step3Message.textContent = "⚠ 서버 오류 발생. 다시 시도해주세요.";
        step3Message.style.color = "red";
    });
}
*/

