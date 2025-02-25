// main.js

document.addEventListener('DOMContentLoaded', () => {
    const departureBtn = document.getElementById('departureBtn29a913db9a6a5790649931aea921e6af');
    const departureModal = document.getElementById('departureModal');
    const closeDepartureModal = document.getElementById('closeDepartureModal');
    const departureInput = document.getElementById('departureInput');
    const departureResults = document.getElementById('departureResults');
    const departureDisplay = document.querySelector('.quickbookings__airport');

    const arrivalBtn = document.getElementById('destinationBtn29a913db9a6a5790649931aea921e6af');
    const arrivalModal = document.getElementById('arrivalModal');
    const closeArrivalModal = document.getElementById('closeArrivalModal');
    const arrivalDisplay = document.querySelector('.quickbookings__airport-arrival');

    const switchBtn = document.querySelector('.quickbookings__swap');
    const dateBtn = document.getElementById('date29a913db9a6a5790649931aea921e6af');
    const dateModal = document.getElementById('dateModal');
    const closeDateModal = document.getElementById('closeDateModal');

    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const departureDateSpan = document.querySelector('.departure-date');
    const arrivalDateSpan = document.querySelector('.arrival-date');

    const passengerBtn = document.getElementById('passengerBtn');
    const passengerModal = document.getElementById('passengerModal');
    const closePassengerModal = document.getElementById('closePassengerModal');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');
    const countDisplay = document.getElementById('count');
    const passengerCountDisplay = document.getElementById('passengerCount');

    const seatClassBtn = document.getElementById('seatClassBtn');
    const seatClassModal = document.getElementById('seatClassModal');
    const closeSeatClassModal = document.getElementById('closeSeatClassModal');
    const seatClassDisplay = document.getElementById('seatClassDisplay');
    const seatOptions = document.querySelectorAll('.seat-option');

    const confirmButton = document.getElementById('calendarConfirmBtn');

    let count = 1;
    let isSelectingDeparture = true;
    let currentDate = new Date();
    let departureDate = null;
    let arrivalDate = null;

    seatClassBtn.addEventListener('click', () => {
        seatClassModal.classList.add('show');
    });

    closeSeatClassModal.addEventListener('click', () => {
        seatClassModal.classList.remove('show');
    });

    seatOptions.forEach(option => {
        option.addEventListener('click', () => {
            seatClassDisplay.textContent = option.dataset.seat;
            seatClassModal.classList.remove('show');
        });
    });

    passengerBtn.addEventListener('click', () => {
        passengerModal.classList.add('show');
    });

    closePassengerModal.addEventListener('click', () => {
        passengerModal.classList.remove('show');
    });

    incrementBtn.addEventListener('click', () => {
        count++;
        updateDisplay();
    });

    decrementBtn.addEventListener('click', () => {
        if (count > 1) {
            count--;
            updateDisplay();
        }
    });

    const updateDisplay = () => {
        countDisplay.textContent = count;
        passengerCountDisplay.textContent = `성인 ${count}명`;
    };

    updateDisplay();



    const toggleModal = (modal, show) => modal?.classList[show ? 'add' : 'remove']('show');

    const renderCalendars = () => {
        renderCalendar(document.getElementById('calendar1'), currentDate);
        renderCalendar(document.getElementById('calendar2'), addMonths(currentDate, 1));
    };

    // JavaScript - Fully Functional renderCalendar with Selection and Reflection
    const renderCalendar = (container, date) => {
        const daysContainer = container?.querySelector('.calendar-days');
        const weekHeader = container.querySelector('.calendar-week-header');
        let monthHeader = container.querySelector('.calendar-month-header');
    
        if (!monthHeader) {
            monthHeader = document.createElement('div');
            monthHeader.classList.add('calendar-month-header');
            container.insertBefore(monthHeader, weekHeader);
        }
    
        monthHeader.textContent = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        daysContainer.innerHTML = '';
    
        Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }).forEach(() => {
            daysContainer.appendChild(document.createElement('div'));
        });
    
        Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, day) => day + 1).forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = day;
    
            const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
    
            if (departureDate && arrivalDate && fullDate > departureDate && fullDate < arrivalDate) {
                dayDiv.classList.add('calendar-range');
            }
            if (departureDate && fullDate.getTime() === departureDate.getTime()) {
                dayDiv.classList.add('calendar-start');
                dayDiv.innerHTML = `<div class="calendar-circle">${day}</div><div class="calendar-label">가는 날</div>`;
            }
            if (arrivalDate && fullDate.getTime() === arrivalDate.getTime()) {
                dayDiv.classList.add('calendar-end');
                dayDiv.innerHTML = `<div class="calendar-circle">${day}</div><div class="calendar-label">오는 날</div>`;
            }
    
            dayDiv.onclick = () => {
                if (!departureDate || arrivalDate) {
                    departureDate = fullDate;
                    arrivalDate = null;
                } else if (!arrivalDate && fullDate >= departureDate) {
                    arrivalDate = fullDate;
                } else {
                    departureDate = fullDate;
                    arrivalDate = null;
                }
                renderCalendars();
            };
    
            daysContainer.appendChild(dayDiv);
        });
    
        // Single Confirm Button Positioned in the Center
        const calendarContainer = container.closest('.calendar');
        if (confirmButton) {
            confirmButton.onclick = () => {
                if (departureDate) {
                    document.querySelector('.departure-date').textContent = `${departureDate.getFullYear()}-${departureDate.getMonth() + 1}-${departureDate.getDate()}`;
                } else {
                    document.querySelector('.departure-date').textContent = '가는날';
                }
        
                if (arrivalDate) {
                    document.querySelector('.arrival-date').textContent = `${arrivalDate.getFullYear()}-${arrivalDate.getMonth() + 1}-${arrivalDate.getDate()}`;
                } else {
                    document.querySelector('.arrival-date').textContent = '오는날';
                }
        
                toggleModal(dateModal, false);
            };
        }
        
        // Instant update when a date is clicked
        const updateDateDisplay = () => {
            if (departureDate) {
                document.querySelector('.departure-date').textContent = `${departureDate.getFullYear()}-${departureDate.getMonth() + 1}-${departureDate.getDate()}`;
            }
            if (arrivalDate) {
                document.querySelector('.arrival-date').textContent = `${arrivalDate.getFullYear()}-${arrivalDate.getMonth() + 1}-${arrivalDate.getDate()}`;
            }
        };
    };

    const addMonths = (date, months) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    };

    prevMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendars();
    });

    nextMonthBtn?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendars();
    });

    dateBtn?.addEventListener('click', () => {
        toggleModal(dateModal, true);
        renderCalendars();
    });

    closeDateModal?.addEventListener('click', () => toggleModal(dateModal, false));

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [departureModal, arrivalModal, dateModal].forEach(modal => {
                if (modal?.classList.contains('show')) toggleModal(modal, false);
            });
        }
    });
    
    if (switchBtn && departureBtn && arrivalBtn) {
        switchBtn.addEventListener('click', () => {
            const departureText = departureBtn.querySelector('.quickbookings__airport').textContent;
            const arrivalText = arrivalBtn.querySelector('.quickbookings__airport').textContent;

            departureBtn.querySelector('.quickbookings__airport').textContent = arrivalText;
            arrivalBtn.querySelector('.quickbookings__airport').textContent = departureText;
        });
    }

    departureBtn?.addEventListener('click', () => toggleModal(departureModal, true));
    closeDepartureModal?.addEventListener('click', () => toggleModal(departureModal, false));

    arrivalBtn?.addEventListener('click', () => toggleModal(arrivalModal, true));
    closeArrivalModal?.addEventListener('click', () => toggleModal(arrivalModal, false));

    departureInput?.addEventListener('input', () => {
        const searchValue = departureInput.value.trim().toLowerCase();
        departureResults.innerHTML = '';

        if (searchValue) {
            const filteredData = ['서울/모든 공항, 대한민국', '서울/김포, 대한민국', '서울/인천, 대한민국'].filter(item => item.toLowerCase().includes(searchValue));

            filteredData.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                resultItem.textContent = item;

                resultItem.addEventListener('click', () => {
                    departureDisplay.textContent = item;
                    toggleModal(departureModal, false);
                });

                departureResults.appendChild(resultItem);
            });
        }
    });

    renderCalendars();
});
