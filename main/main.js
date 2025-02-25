const togglebtn = document.querySelector('.navbar_togglebtn');
const menu = document.querySelector('.navbar_menu');
const member = document.querySelector('.navbar_member');

togglebtn.addEventListener('click', ()=>{
    menu.classList.toggle('active');
    member.classList.toggle('active');
});

window.addEventListener("resize", function() {
    const header = document.querySelector(".header_wrap");
    const minWidth = 800; 

    if (window.innerWidth < minWidth) {
        header.style.display = "none"; 
    } else {
        header.style.display = "flex"; 
    }
});
const noticeContainer = document.querySelector(".notice_container");

// 공지사항 데이터 배열
const notices = [
    "1번째 공지사항",
    "2번째 공지사항",
    "3번째 공지사항",
    "4번째 공지사항",
    "5번째 공지사항"
];

// 공지사항을 동적으로 추가하는 함수
notices.forEach((noticeText, index) => {
    const noticeDiv = document.createElement("div");
    noticeDiv.classList.add("notice_content");
    
    const h2 = document.createElement("h2");
    h2.textContent = "중요공지";
    
    const h3 = document.createElement("h3");
    h3.textContent = noticeText;
    
    noticeDiv.appendChild(h2);
    noticeDiv.appendChild(h3);
    
    noticeContainer.appendChild(noticeDiv);
});
