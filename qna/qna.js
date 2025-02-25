// 헤더 
const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});


// 탭 전환 기능
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
}

// 서버에서 데이터를 가져오는 함수 (테스트용 데이터)
function fetchInquiryList() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 230, title: "비행기 지연 문제", author: "김철수", date: "2025-03-01", isMine: false },
                { id: 229, title: "티켓 환불 관련 문의", author: "이영희", date: "2025-02-28", isMine: false },
                { id: 228, title: "기내식 변경 가능 여부", author: "박지훈", date: "2025-02-27", isMine: true },
                { id: 227, title: "좌석 업그레이드 요청", author: "최민호", date: "2025-02-26", isMine: false },
                { id: 226, title: "수하물 분실 신고", author: "김민수", date: "2025-02-25", isMine: true },
                { id: 225, title: "비행 스케줄 변경 문의", author: "장윤정", date: "2025-02-24", isMine: false },
                { id: 224, title: "좌석 배정 문제", author: "한지원", date: "2025-02-23", isMine: false },
                { id: 223, title: "마일리지 적립 문의", author: "김지은", date: "2025-02-22", isMine: true },
                { id: 222, title: "항공권 취소 방법", author: "박서준", date: "2025-02-21", isMine: false }
            ]);
        }, 500);
    });
}

// 페이지당 표시할 개수
const itemsPerPage = 3;

// 문의사항 목록 로드 (페이지네이션 적용)
function loadInquiryList(page = 1) {
    fetchInquiryList().then(data => {
        let questionList = document.getElementById("question-list");
        let pagination = document.getElementById("pagination");

        questionList.innerHTML = "";
        pagination.innerHTML = "";

        // 전체 페이지 수 계산
        let totalPages = Math.ceil(data.length / itemsPerPage);
        let startIndex = (page - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        let currentPageData = data.slice(startIndex, endIndex);

        // 현재 페이지 데이터 렌더링
        currentPageData.forEach((item) => {
            let row = `
                <tr onclick="viewDetail(${item.id})">
                    <td>${item.id}</td>
                    <td>${item.title}</td>
                    <td>${item.author}</td>
                    <td>${item.date}</td>
                </tr>
            `;
            questionList.innerHTML += row;
        });

        // 페이지네이션 버튼 생성
        createPaginationButtons(totalPages, page);
    }).catch(error => {
        console.error("데이터 불러오기 실패:", error);
    });
}

// 페이지네이션 버튼 생성 함수
function createPaginationButtons(totalPages, currentPage) {
    let pagination = document.getElementById("pagination");

    // "Previous" 버튼
    let prevButton = document.createElement("button");
    prevButton.innerText = "← Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => loadInquiryList(currentPage - 1);
    pagination.appendChild(prevButton);
    // 페이지 번호 표시 (1, 2, 3, ..., 마지막 페이지)
    if (totalPages > 5) {
        if (currentPage > 2) {
            pagination.appendChild(createPageButton(1));
            if (currentPage > 3) pagination.appendChild(createDots());
        }
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pagination.appendChild(createPageButton(i, i === currentPage));
        }
        if (currentPage < totalPages - 2) {
            pagination.appendChild(createDots());
            pagination.appendChild(createPageButton(totalPages));
        }
    } else {
        for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(createPageButton(i, i === currentPage));
        }
    }
    // 페이지 번호 표시 (1, 2, 3, ..., 마지막 페이지)
    if (totalPages > 5) {
        if (currentPage > 2) {
            pagination.appendChild(createPageButton(1));
            if (currentPage > 3) pagination.appendChild(createDots());
        }
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pagination.appendChild(createPageButton(i, i === currentPage));
        }
        if (currentPage < totalPages - 2) {
            pagination.appendChild(createDots());
            pagination.appendChild(createPageButton(totalPages));
        }
    } else {
        for (let i = 1; i <= totalPages; i++) {
            pagination.appendChild(createPageButton(i, i === currentPage));
        }
    }

    // "Next" 버튼
    let nextButton = document.createElement("button");
    nextButton.innerText = "Next →";
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => loadInquiryList(currentPage + 1);
    pagination.appendChild(nextButton);
}
// 페이지 번호 버튼 생성 함수
function createPageButton(pageNumber, isActive = false) {
    let button = document.createElement("button");
    let span = document.createElement("span");

    span.innerText = pageNumber;
    button.appendChild(span);

    button.onclick = () => loadInquiryList(pageNumber);
    if (isActive) button.classList.add("active");

    return button;
}


// "..." (생략) 버튼 생성
function createDots() {
    let dots = document.createElement("button");
    dots.innerText = "...";
    dots.classList.add("dots");
    dots.disabled = true;
    return dots;
}

// 상세 페이지 이동
function viewDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// 페이지 로드 시 데이터 가져오기
document.addEventListener("DOMContentLoaded", () => loadInquiryList(1));

