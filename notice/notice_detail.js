const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});

// 공지사항 데이터 (예제)
const notices = {
    "1": { title: "서버 점검 안내(03/14)", type: "중요공지", date: "2025.02.28.", content: "서버 점검이 진행됩니다. 02:00 ~ 06:00 동안 점검 예정입니다." },
    "2": { title: "국내선 유류할증료 변경", type: "공지", date: "2025.01.06.", content: "국내선 유류할증료가 2025년 2월부터 조정됩니다." }
};

// ✅ 공지사항 상세 정보를 로드하는 함수
function loadNoticeDetail() {
    // 현재 URL에서 공지 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const noticeId = urlParams.get("id");

    // 콘솔에서 값 확인 (디버깅용)
    console.log("URL에서 가져온 ID:", noticeId);
    console.log("notices 객체에 존재하는가?", notices.hasOwnProperty(noticeId));

    // 공지사항 ID가 존재하는 경우 상세 내용 표시
    if (noticeId && notices[noticeId]) {
        document.getElementById("notice_detail_title").textContent = notices[noticeId].title;
        document.getElementById("notice_detail_type").textContent = notices[noticeId].type;
        document.getElementById("notice_detail_date").textContent = notices[noticeId].date;
        document.getElementById("notice_detail_content").textContent = notices[noticeId].content;
    } else {
        // ID가 없거나 잘못된 경우 예외 처리
        document.getElementById("notice_detail_title").textContent = "공지사항을 찾을 수 없습니다.";
        document.getElementById("notice_detail_content").textContent = "해당 공지사항이 존재하지 않거나 삭제되었습니다.";
    }
}

// ✅ 함수 실행 (페이지 로드 시)
document.addEventListener("DOMContentLoaded", loadNoticeDetail);

// ✅ 목록으로 돌아가는 함수
function goBack() {
    window.location.href = "notice.html"; // 공지사항 목록 페이지로 이동
}
