document.addEventListener("DOMContentLoaded", function () {
    const members = [];
    for (let i = 1; i <= 200; i++) {
        members.push({
            index: i,
            id: "user" + i,
            name: "홍길동" + i,
            phone: "010-1234-" + String(i).padStart(4, "0"),
            email: "user" + i + "@email.com"
        });
    }

    const itemsPerPage = 10;
    let currentPage = 1;

    function displayMembers() {
        const memberTable = document.getElementById("memberTable");
        memberTable.innerHTML = "";

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedMembers = members.slice(start, end);

        paginatedMembers.forEach(member => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${member.index}</td>
                <td><input type="text" value="${member.id}" readonly></td>
                <td><input type="text" value="${member.name}"></td>
                <td><input type="text" value="${member.phone}"></td>
                <td><input type="text" value="${member.email}"></td>
                <td><button class="delete-btn" onclick="deleteMember(${member.index})">삭제</button></td>
            `;

            memberTable.appendChild(row);
        });

        displayPagination();
    }

    function displayPagination() {
        const pageNumbers = document.getElementById("pageNumbers");
        pageNumbers.innerHTML = "";

        const totalPages = Math.ceil(members.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement("span");
            pageSpan.textContent = i;
            pageSpan.classList.add("page-btn");
            if (i === currentPage) {
                pageSpan.classList.add("active-page");
            }
            pageSpan.addEventListener("click", () => {
                currentPage = i;
                displayMembers();
            });
            pageNumbers.appendChild(pageSpan);
        }

        document.getElementById("prevPage").style.display = currentPage > 1 ? "inline-block" : "none";
        document.getElementById("nextPage").style.display = currentPage < totalPages ? "inline-block" : "none";
    }

    function deleteMember(index) {
        const confirmDelete = confirm("정말 삭제하시겠습니까?");
        if (confirmDelete) {
            const memberIndex = members.findIndex(member => member.index === index);
            if (memberIndex !== -1) {
                members.splice(memberIndex, 1);
                displayMembers();
            }
        }
    }

    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayMembers();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPages = Math.ceil(members.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayMembers();
        }
    });

    displayMembers();
});

// 검색 기능
function searchMembers() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll("#memberTable tr");

    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(input) ? "" : "none";
    });
}