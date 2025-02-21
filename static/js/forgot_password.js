// 헤더
const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', () => {
    menu.classList.toggle('active');
    member.classList.toggle('active');
});

let userId = '';

async function requestResetCode() {
    userId = document.getElementById('user_id').value;
    const step1Message = document.getElementById('step1Message'); // 메시지 표시 영역

    // 초기화
    step1Message.textContent = '';

    try {
        const response = await axios.post('/forgot_password', { user_id: userId });
        if (response.data.message) {
            step1Message.style.color = 'green'; // 성공 메시지는 초록색으로 표시
            step1Message.textContent = response.data.message;

            // Step 2로 이동
            document.getElementById('step1').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
        }
    } catch (error) {
        step1Message.style.color = 'red'; // 오류 메시지는 빨간색으로 표시
        if (error.response && error.response.data && error.response.data.error) {
            step1Message.textContent = error.response.data.error;
        } else {
            step1Message.textContent = '알 수 없는 오류가 발생했습니다.';
        }
    }
}

async function verifyResetCode() {
    const otp = document.getElementById('otp').value;
    const step2Message = document.getElementById('step2Message'); // 메시지 표시 영역

    // 초기화
    step2Message.textContent = '';

    try {
        const response = await axios.post('/verify_reset_code', { user_id: userId, otp: otp });
        if (response.data.message) {
            step2Message.style.color = 'green';
            step2Message.textContent = response.data.message;

            // Step 3로 이동
            document.getElementById('step2').classList.add('hidden');
            document.getElementById('step3').classList.remove('hidden');
        }
    } catch (error) {
        step2Message.style.color = 'red';
        if (error.response && error.response.data && error.response.data.error) {
            step2Message.textContent = error.response.data.error;
        } else {
            step2Message.textContent = '알 수 없는 오류가 발생했습니다.';
        }
    }
}

async function resetPassword() {
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const step3Message = document.getElementById('step3Message'); // 메시지 표시 영역

    // 초기화
    step3Message.textContent = '';

    try {
        const response = await axios.post('/reset_password', {
            user_id: userId,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        
        if (response.data.message) {
            step3Message.style.color = 'green';
            step3Message.textContent = response.data.message;

            // 완료 후 리다이렉션
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
    } catch (error) {
        step3Message.style.color = 'red';
        if (error.response && error.response.data && error.response.data.error) {
            step3Message.textContent = error.response.data.error;
        } else {
            step3Message.textContent = '알 수 없는 오류가 발생했습니다.';
        }
    }
}
