// 현재 선택된 항공편 번호
let currentFlight = 1;

// 항공권 데이터 (예제)
const flights = [
    { departure: "06:10", arrival: "10:15", duration: "04시간 05분", price: "1,300,000원" },
    { departure: "06:10", arrival: "10:15", duration: "04시간 05분", price: "1,300,000원" },
    { departure: "06:10", arrival: "10:15", duration: "04시간 05분", price: "1,300,000원" },
];

// 항공편 제목 변경하는 함수
function updateFlightTitle() {
    document.getElementById("flightTitle").textContent = `FLIGHT_0${currentFlight}`;
}

// 항공권 목록을 추가할 컨테이너
const flightList = document.querySelector(".flight-list");

// 항공권 목록 렌더링 함수
function renderFlights() {
    flightList.innerHTML = ""; // 기존 목록 초기화

    flights.forEach((flight, index) => {
        const flightItem = document.createElement("div");
        flightItem.classList.add("flight-item");

        flightItem.innerHTML = `
            <div class="flight-info">
                <div>
                    <p>Fri, 17 May 2022</p>
                    <p class="flight-time">${flight.departure}</p>
                    <p>LKPR ✈ MAD</p>
                </div>
                <div>
                    <p>Fri, 17 May 2022</p>
                    <p class="flight-time">${flight.arrival}</p>
                    <p>${flight.duration}</p>
                </div>
                <p>First Class</p>
                <p class="flight-price">${flight.price}</p>
            </div>
            <input type="checkbox" class="flight-checkbox" id="checkbox-${index}">
        `;

        flightList.appendChild(flightItem);
            // 체크박스 하나만 선택되도록 설정
        const checkboxes = document.querySelectorAll(".flight-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            });
        });
    });
}

// 화살표 버튼 클릭 이벤트
document.querySelector(".arrow-btn.right").addEventListener("click", () => {
    if (currentFlight < 5) {
        currentFlight++;
    } else {
        currentFlight = 1; // 다시 FLIGHT_01로 되돌아감
    }
    updateFlightTitle();
    renderFlights();
});

document.querySelector(".arrow-btn.left").addEventListener("click", () => {
    if (currentFlight > 1) {
        currentFlight--;
    } else {
        currentFlight = 5; // 마지막 FLIGHT로 되돌아감
    }
    updateFlightTitle();
    renderFlights();
});

// 페이지 로드 시 항공권 목록 표시
document.addEventListener("DOMContentLoaded", () => {
    updateFlightTitle();
    renderFlights();
});

// 제출 버튼 클릭 시 특정 URL로 이동
document.querySelector(".submit-btn").addEventListener("click", function () {
    window.location.href = "https://example.com"; // 여기에 이동할 URL 입력
});