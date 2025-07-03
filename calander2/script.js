const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");

const modal = document.getElementById("eventModal");
const modalDate = document.getElementById("modalDate");
const eventInput = document.getElementById("eventInput");
const eventList = document.getElementById("eventList");
const closeModal = document.getElementById("closeModal");

let date = new Date();
let currentMonth = date.getMonth();
let currentYear = date.getFullYear();
let selectedDate = "";

closeModal.onclick = () => modal.style.display = "none";

window.onclick = e => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
};

function renderCalendar(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthYear.innerText = `${months[month]} ${year}`;
  calendarDays.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    calendarDays.innerHTML += "<div></div>";
  }

  for (let i = 1; i <= lastDate; i++) {
    const dayDiv = document.createElement("div");
    const fullDate = `${year}-${month + 1}-${i}`;

    dayDiv.textContent = i;
    dayDiv.onclick = () => openModal(fullDate);

    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("today");
    }

    if (getEvents(fullDate).length > 0) {
      const dot = document.createElement("div");
      dot.classList.add("event-dot");
      dayDiv.appendChild(dot);
    }

    calendarDays.appendChild(dayDiv);
  }
}

function openModal(dateStr) {
  selectedDate = dateStr;
  modal.style.display = "flex";
  modalDate.innerText = ` Events for ${dateStr}`;
  eventInput.value = "";
  showEvents();
}

function saveEvent() {
  const text = eventInput.value.trim();
  if (text === "") return;

  const events = getEvents(selectedDate);
  events.push(text);
  localStorage.setItem(selectedDate, JSON.stringify(events));
  eventInput.value = "";
  showEvents();
  renderCalendar(currentMonth, currentYear);
}

function showEvents() {
  const events = getEvents(selectedDate);
  eventList.innerHTML = "";

  events.forEach((event, index) => {
    const li = document.createElement("li");
    li.textContent = event;
    li.onclick = () => {
      if (confirm("Delete this event?")) {
        events.splice(index, 1);
        localStorage.setItem(selectedDate, JSON.stringify(events));
        showEvents();
        renderCalendar(currentMonth, currentYear);
      }
    };
    eventList.appendChild(li);
  });
}

function getEvents(dateStr) {
  return JSON.parse(localStorage.getItem(dateStr)) || [];
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
}

renderCalendar(currentMonth, currentYear);