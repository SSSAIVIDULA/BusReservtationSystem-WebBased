let phone = localStorage.getItem("phone");
let busId, seatNumber;
let countdownTimer;

// =========================
// LOGIN FUNCTION
// =========================
async function login() {
  const phoneInput = document.getElementById("phone").value.trim();
  if (!phoneInput) return alert("Please enter your phone number.");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: phoneInput }),
  });

  if (!res.ok) return alert(await res.text());
  const data = await res.json();

  localStorage.setItem("phone", data.phone);
  window.location = "search.html";
}

// =========================
// SEARCH BUSES
// =========================
async function searchBus() {
  const busStand = document.getElementById("busStand").value;
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("date").value;

  if (!busStand || !from || !to || !date) {
    return alert("Please select bus stand, from, to, and date.");
  }

  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ busStand, from, to, date }),
  });

  const buses = await res.json();
  const div = document.getElementById("result");

  if (buses.length === 0) {
    div.innerHTML = "<p>No buses found for selected stand and date.</p>";
    return;
  }

  div.innerHTML = buses
    .map(
      (b) => `
    <div class="bus-card">
      <h3>${b.busStand} | ${b.from} ➜ ${b.to}</h3>
      <p>Departure: ${new Date(b.departureTime).toLocaleString()}</p>
      <p>Total Seats: ${b.totalSeats}</p>
      <button onclick="selectBus('${b._id}')">Select Bus</button>
    </div>
  `
    )
    .join("");
}

// =========================
// SELECT BUS
// =========================
function selectBus(id) {
  localStorage.setItem("busId", id);
  window.location = "seat.html";
}

// =========================
// SEAT SELECTION PAGE ONLOAD
// =========================
window.onload = async function () {
  if (!location.pathname.endsWith("seat.html")) return;

  busId = localStorage.getItem("busId");
  if (!busId) return alert("No bus selected.");

  const res = await fetch(`/api/bus/${busId}`);
  const data = await res.json();
  const { bus, bookings } = data;

  // Display bus info
  document.getElementById(
    "busInfo"
  ).innerText = `Bus from ${bus.from} to ${bus.to} | Departure: ${new Date(
    bus.departureTime
  ).toLocaleString()}`;

  // Generate seats
  let html = "";
  for (let i = 1; i <= bus.totalSeats; i++) {
    const booked = bookings.find((b) => b.seatNumber === i);
    html += `
      <button 
        id="seat-${i}"
        class="seat ${booked ? "booked" : ""}" 
        ${booked ? "disabled" : ""} 
        onclick="chooseSeat(${i})">
        ${i}
      </button>`;
  }
  document.getElementById("seats").innerHTML = html;

  // Timer logic: closes 10 min before departure
  const timerEl = document.getElementById("timer");
  const departureTime = new Date(bus.departureTime).getTime();
  const seatCloseTime = departureTime - 10 * 60 * 1000; // 10 min before departure
  let remainingSeconds = Math.floor((seatCloseTime - Date.now()) / 1000);

  if (remainingSeconds <= 0) {
    timerEl.innerText = "⛔ Seat selection closed.";
    disableAllSeats();
  } else {
    startCountdown(remainingSeconds);
  }
};

// =========================
// CHOOSE SEAT
// =========================
function chooseSeat(i) {
  seatNumber = i;

  document.querySelectorAll(".seat").forEach((btn) => {
    if (!btn.disabled) btn.classList.remove("selected");
  });

  document.getElementById(`seat-${i}`).classList.add("selected");

  document.getElementById("details").style.display = "block";
}

// =========================
// COUNTDOWN TIMER
// =========================
function startCountdown(duration) {
  let remaining = duration;
  const timerDisplay = document.getElementById("timer");

  countdownTimer = setInterval(() => {
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      timerDisplay.innerText = "⛔ Seat selection closed (10 min before departure).";
      disableAllSeats();
      return;
    }

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = Math.floor(remaining % 60);

    timerDisplay.innerText = `⏳ Time left to choose seat: ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    remaining--;
  }, 1000);
}

// =========================
// DISABLE ALL SEATS
// =========================
function disableAllSeats() {
  document.querySelectorAll(".seat").forEach((btn) => (btn.disabled = true));
  document.getElementById("confirmBtn")?.setAttribute("disabled", true);
}

// =========================
// CONFIRM BOOKING
// =========================
async function confirmBooking() {
  if (!seatNumber) return alert("Please select a seat first.");

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;

  if (!name || !age || !gender) return alert("Please fill all passenger details.");

  const res = await fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, busId, seatNumber, name, age, gender }),
  });

  if (!res.ok) return alert(await res.text());

  const booking = await res.json();
  localStorage.setItem("qr", booking.qrCode);
  window.location = "qr.html";
}
