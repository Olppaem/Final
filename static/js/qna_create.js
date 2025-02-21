const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("qnaForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // 기본 제출 동작 방지

        const title = document.getElementById("title").value.trim();
        const content = document.getElementById("content").value.trim();
        const file = document.getElementById("file").files[0];
        const isPrivate = document.getElementById("private").checked;

        // 입력값 검증
        if (title === "") {
            alert("제목을 입력하세요.");
            return;
        }
        if (content === "") {
            alert("내용을 입력하세요.");
            return;
        }

        // 문의 데이터 객체 생성
        const newInquiry = {
            title: title,
            content: content,
            fileUrl: file ? file.name : "", // 파일이 있으면 파일명 저장
            isPrivate: isPrivate,
            date: new Date().toISOString().split("T")[0] // 오늘 날짜
        };

        console.log("문의 등록됨:", newInquiry);

        // 문의 목록 페이지로 이동
        alert("문의가 등록되었습니다.");
        window.location.href = "qna.html";
    });
});