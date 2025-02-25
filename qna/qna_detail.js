const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});
document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = false; // 관리자 여부 (true: 관리자, false: 일반 사용자)

    // 샘플 데이터 (실제 데이터는 API 또는 DB에서 불러올 수 있음)
    const qnaData = {
        id: 1,
        title: "비행기 못 탔어요. 환불해주세요.",
        writer: "박**",
        date: "2025.02.28",
        status: "답변완료",
        content: "아 저만 빼고 가는 게 어딨습니까...",
        adminReply: "고객님, 환불 관련 문의는 고객센터로 연락 부탁드립니다.",
        fileUrl: "ticket.pdf" // 첨부 파일이 있는 경우
    };

    // 데이터 채우기
    document.getElementById("qna_title").textContent = qnaData.title;
    document.getElementById("qna_writer").textContent = qnaData.writer;
    document.getElementById("qna_date").textContent = qnaData.date;
    document.getElementById("qna_status").textContent = qnaData.status;
    document.getElementById("qna_content").textContent = qnaData.content;
    document.getElementById("admin_reply_text").textContent = qnaData.adminReply;

    // 파일 아이콘 추가 (파일이 있을 경우)
    if (qnaData.fileUrl) {
        const fileIcon = document.createElement("a");
        fileIcon.href = qnaData.fileUrl;
        fileIcon.target = "_blank";
        fileIcon.innerHTML = '<img src="file_icon.png" alt="첨부파일" width="16">';
        document.getElementById("file_icon").appendChild(fileIcon);
    }

    // 관리자일 경우 수정/삭제 버튼 표시
    if (isAdmin) {
        document.getElementById("answerBtn").hidden = false;
        document.getElementById("editBtn").hidden = false;
        document.getElementById("deleteBtn").hidden = false;
    }

    // 수정 버튼 클릭 시 이동
    document.getElementById("editBtn").addEventListener("click", function () {
        window.location.href = `qna_edit.html?id=${qnaData.id}`;
    });

    // 삭제 버튼 클릭 시 확인 후 삭제
    document.getElementById("deleteBtn").addEventListener("click", function () {
        if (confirm("정말로 삭제하시겠습니까?")) {
            alert("문의사항이 삭제되었습니다.");
            window.location.href = "qna.html"; // 문의사항 페이지로 이동
        }
    });

    // 목록보기 버튼 클릭 시 이전 페이지로 이동
    document.getElementById("backBtn").addEventListener("click", function () {
        window.location.href = "qna.html";
    });
    document.getElementById("answerBtn").addEventListener("click", function () {
        window.location.href = `qna.html?id=${qnaData.id}`;
    });
    const adminReplyText = document.getElementById("admin_reply_text");
    const adminReplyInput = document.getElementById("admin_reply_input");
    const submitReplyBtn = document.getElementById("submitReplyBtn");

        // 관리자만 답변 등록 가능
    if (isAdmin) {
        adminReplyText.style.display = "none"; // 기존 답변 숨김
        adminReplyInput.style.display = "block"; // 관리자만 입력 가능
        submitReplyBtn.hidden = false;
    }
    
        // 답변 등록 버튼 클릭 시
    submitReplyBtn.addEventListener("click", function () {
    const replyText = adminReplyInput.value.trim();
    
        if (replyText === "") {
            alert("답변을 입력하세요.");
            return;
        }
    
            // 답변 저장 (로컬 데이터, 실제 프로젝트에서는 서버로 전송)
        qnaData.adminReply = replyText;
        adminReplyText.textContent = replyText;
        adminReplyText.style.display = "block";
        adminReplyInput.style.display = "none"; // 입력창 숨기기
        submitReplyBtn.hidden = true; // 등록 버튼 숨기기
        alert("답변이 등록되었습니다.");
    });
});