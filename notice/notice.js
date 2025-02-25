// 메뉴 토글 기능
const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', () => {
    menu.classList.toggle('active');
    member.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", function () {
    const isAdmin = true; // 관리자 여부 설정 (true: 관리자, false: 일반 사용자)

    // 공지사항 데이터 (예제)
    const notices = [
        { id: 1, title: "서버 점검 안내(03/14)", type: "중요공지", date: "2025-02-28", fileUrl: "server_check.pdf" },
        { id: 2, title: "국내선 유류할증료 (2025년 2월)", type: "중요공지", date: "2025-01-06", fileUrl: "" },
        { id: 3, title: "최신 운항 스케줄 안내", type: "공지", date: "2024-12-28", fileUrl: "schedule.pdf" },
        { id: 4, title: "업데이트 예정 사항 안내", type: "공지", date: "2024-11-15", fileUrl: "" },
        { id: 5, title: "고객 서비스 개선 계획", type: "공지", date: "2024-10-05", fileUrl: "" },
        { id: 6, title: "이벤트 안내 (10월)", type: "이벤트", date: "2024-09-30", fileUrl: "event_details.pdf" }
    ];

    const itemsPerPage = 4; // 한 페이지당 표시할 공지 개수
    let currentPage = 1;

    function displayNotices() {
        const noticeList = document.getElementById("notice_list");

        noticeList.innerHTML = ""; // 기존 목록 초기화

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedNotices = notices.slice(start, end);

        paginatedNotices.forEach(notice => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${notice.type}</td>
                <td>
                    <a href="detail.html?id=${notice.id}" class="notice_link">${notice.title}</a>
                    ${notice.fileUrl ? `<a href="${notice.fileUrl}" target="_blank">
                        <img src="file_icon.png" alt="첨부파일" width="16">
                    </a>` : ""}
                </td>
                <td>${notice.date}</td>
            `;

            noticeList.appendChild(row);
        });

        displayPagination();
    }

    function displayPagination() {
        const pageNumbers = document.getElementById("pageNumbers");

        pageNumbers.innerHTML = ""; // 기존 페이지 초기화

        const totalPages = Math.ceil(notices.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement("span");
            pageSpan.textContent = i;
            pageSpan.classList.add("page-btn");
            if (i === currentPage) {
                pageSpan.classList.add("active-page");
            }
            pageSpan.addEventListener("click", () => {
                currentPage = i;
                displayNotices();
            });
            pageNumbers.appendChild(pageSpan);
        }

        document.getElementById("prevPage").style.display = currentPage > 1 ? "inline-block" : "none";
        document.getElementById("nextPage").style.display = currentPage < totalPages ? "inline-block" : "none";
    }

    // 🔹 "공지 등록" 버튼을 관리자(Admin)만 볼 수 있도록 설정
    const submitButton = document.getElementById("adsubmit_button");
    if (submitButton) {
        submitButton.style.display = isAdmin ? "block" : "none"; // 관리자일 경우 보이기
    }

    // 이전 페이지 버튼 기능
    document.getElementById("prevPage").addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            displayNotices();
        }
    });

    // 다음 페이지 버튼 기능
    document.getElementById("nextPage").addEventListener("click", function () {
        const totalPages = Math.ceil(notices.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayNotices();
        }
    });

    displayNotices(); // 공지사항 표시 실행
});

// 공지 등록 버튼 클릭 시 이동
function submitNotice() {
    window.location.href = "notice_add.html"; // 공지사항 등록 페이지로 이동
}
