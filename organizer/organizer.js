import { CONFIG } from "../config.js";

/* ---------- BASIC HELPERS ---------- */

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0,5);
}

function loadEventState() {
  document.getElementById("eventName").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("duration").value = "";
  localStorage.removeItem("locationConfig");
}

function updateLocationFromStorage() {
  const saved = localStorage.getItem("locationConfig");
  if(saved) {
    CONFIG.location = JSON.parse(saved);
  }
}

function readStoredLocation() {
  const saved = localStorage.getItem("locationConfig");
  return saved ? JSON.parse(saved) : null;
}

/* ---------- EVENT SAVE ---------- */

function saveEvent() {
  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;

  if(!name || !date || !time || !duration) {
    alert("Fill all event details");
    return;
  }

  CONFIG.event = {
    name,
    date,
    startTime: time,
    durationMinutes: parseInt(duration)
  };

  localStorage.setItem("eventConfig", JSON.stringify(CONFIG.event));
  alert("Event saved");
  updateQRButtonState();
}

/* ---------- LOCATION ---------- */

function setPresetLocation(name) {
  const presets = {
    AB5: {
      latitude: 13.12521377401022,
      longitude: 77.58983194828035,
      radius: 50
    },
    AB4: {
      latitude: 13.125328708114353,
      longitude: 77.59047567844392,
      radius: 50
    }
  };

  const loc = presets[name];
  if(!loc) return;

  localStorage.setItem("locationConfig", JSON.stringify(loc));
  CONFIG.location = loc;
  
  const presetEl = document.getElementById("presetSelected");
  if(presetEl) presetEl.innerText = name + " selected";
  
  updateQRButtonState();
  alert(`Location set to ${name}`);
}

/* ---------- QR BUTTON STATE ---------- */

function updateQRButtonState() {
  const eventName = document.getElementById("eventName").value.trim();
  const eventDate = document.getElementById("eventDate").value;
  const startTime = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;
  
  const hasEvent = eventName && eventDate && startTime && duration;
  const storedLoc = readStoredLocation();
  const hasLocation = !!storedLoc;
  
  const generateBtn = document.getElementById("generateQR");
  const statusHint = document.getElementById("qrStatusHint");
  
  if (hasEvent && hasLocation) {
    generateBtn.disabled = false;
    statusHint.style.display = "none";
  } else {
    generateBtn.disabled = true;
    const missing = [];
    if (!hasEvent) missing.push("event details");
    if (!hasLocation) missing.push("location");
    statusHint.innerHTML = `⚠️ Please set: ${missing.join(" and ")}`;
    statusHint.style.display = "block";
  }
}

/* ---------- QR GENERATE ---------- */

async function generateQR() {
  try {
    await fetch(CONFIG.mailerScriptURL, {
      method: "POST",
      body: new URLSearchParams({ action: "clearAttendance" })
    });
  } catch(err) {
    console.error("Error clearing attendance:", err);
  }

  const name = document.getElementById("eventName").value.trim();
  const date = document.getElementById("eventDate").value;
  const time = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;
  const loc = readStoredLocation();

  if(!name || !date || !time || !duration) {
    alert("Complete event details");
    return;
  }

  if(!loc) {
    alert("Please select a location preset");
    return;
  }

  CONFIG.event = {
    name, date, startTime: time, durationMinutes: parseInt(duration)
  };

  CONFIG.location = loc;

  const url = window.location.origin +
    "/MeetingQR/attendee/index.html" +
    `?event=${encodeURIComponent(name)}` +
    `&lat=${loc.latitude}` +
    `&lng=${loc.longitude}` +
    `&radius=${loc.radius}`;

  document.getElementById("qrImage").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(url);

  document.getElementById("qrSection").style.display = "block";
  document.getElementById("eventTitle").innerText = name;

  scheduleDirectorEmail();
  startQRTimer();
}

/* ---------- QR TIMER ---------- */

function startQRTimer() {
  const event = CONFIG.event;
  if (!event || !event.date || !event.startTime) return;
  
  const start = new Date(`${event.date}T${event.startTime}`);
  const end = new Date(start.getTime() + event.durationMinutes * 60000);
  
  const updateTimer = () => {
    const now = new Date();
    const timerEl = document.getElementById("qrTimer");
    
    if (now < start) {
      timerEl.innerHTML = `⏳ Starts in ${formatTimeUntil(start)}`;
    } else if (now > end) {
      timerEl.innerHTML = `⏹️ Event ended`;
    } else {
      timerEl.innerHTML = `✅ Active (${formatTimeUntil(end)} remaining)`;
    }
  };
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

function formatTimeUntil(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff < 0) return "ended";
  
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/* ---------- DOWNLOAD QR ---------- */

function downloadQR() {
  const img = document.getElementById("qrImage");

  if(!img.src) {
    alert("Generate QR first");
    return;
  }

  const eventName = CONFIG.event?.name || "event";
  const filename = eventName.replace(/\s+/g, "_") + "_QR.png";

  const link = document.createElement("a");
  link.href = img.src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ---------- DOWNLOAD CSV ---------- */

async function downloadCSV() {
  if(!CONFIG.event || !CONFIG.event.name) {
    alert("Generate QR first");
    return;
  }

  try {
    const { getAllAttendance } = await import("../firebase.js");
    const records = await getAllAttendance();

    if(!records.length) {
      alert("No records found");
      return;
    }

    let csv = "Timestamp,Event,Name,Email,FacultyID,Department,Latitude,Longitude\n";
    
    records.forEach(r => {
      csv +=
        `${r.timestamp || ""},` +
        `${r.eventName || ""},` +
        `${r.name || ""},` +
        `${r.email || ""},` +
        `${r.facultyId || ""},` +
        `${r.department || ""},` +
        `${r.latitude || ""},` +
        `${r.longitude || ""}\n`;
    });

    const filename = CONFIG.event.name.replace(/\s+/g, "_") + "_Attendance.csv";
    
    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);

  } catch(err) {
    console.error("Error downloading CSV:", err);
    alert("Failed to download CSV: " + err.message);
  }
}

/* ---------- EMAIL ---------- */

async function sendCSVToEmail() {
  const email = document.getElementById("directorEmail").value;

  if(!email) {
    alert("Enter email address");
    return;
  }

  try {
    const response = await fetch(CONFIG.mailerScriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "sendAttendanceEmail",
        email: email
      })
    });
    
    const data = await response.json();
    
    if(data.success) {
      alert("Email sent to " + email);
    } else {
      alert("Failed: " + (data.error || "Unknown error"));
    }
    
  } catch(err) {
    console.error("Error sending email:", err);
    alert("Failed to send email");
  }
}

/* ---------- EMAIL SCHEDULER ---------- */

function scheduleDirectorEmail() {
  const event = CONFIG.event;
  if(!event || !event.date || !event.startTime) return;

  const end = new Date(`${event.date}T${event.startTime}`);
  end.setMinutes(end.getMinutes() + event.durationMinutes);

  const delay = end.getTime() - Date.now();
  if(delay <= 0) return;

  setTimeout(sendDirectorEmailNow, delay);
}

async function sendDirectorEmailNow() {
  try {
    await fetch(CONFIG.mailerScriptURL, {
      method: "POST",
      body: new URLSearchParams({
        action: "sendDirectorEmail"
      })
    });
    console.log("Director email sent");
  } catch(err) {
    console.error("Error sending director email:", err);
  }
}

/* ---------- OPEN LOCATION PAGE ---------- */

function openLocationPage() {
  window.open("map.html", "_blank", "width=1200,height=800");
}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadEventState();
  updateLocationFromStorage();
  
  // Set current time
  document.getElementById("startTime").value = getCurrentTime();
  
  // Initialize date picker
  flatpickr("#eventDate", {
    enableTime: false,
    dateFormat: "Y-m-d",
    minDate: "today"
  });
  
  // Add event listeners for real-time validation
  document.getElementById("eventName").addEventListener("input", updateQRButtonState);
  document.getElementById("eventDate").addEventListener("change", updateQRButtonState);
  document.getElementById("startTime").addEventListener("input", updateQRButtonState);
  document.getElementById("duration").addEventListener("input", updateQRButtonState);
  
  // Initial button state
  updateQRButtonState();
  
  // Listen for storage changes (location updates from map.html)
  window.addEventListener("storage", (e) => {
    if (e.key === "locationConfig") {
      updateLocationFromStorage();
      updateQRButtonState();
    }
  });
});

// Also check when page gets focus
window.addEventListener("focus", () => {
  updateLocationFromStorage();
  updateQRButtonState();
});

/* ---------- EXPORT GLOBAL ---------- */

window.saveEvent = saveEvent;
window.setPresetLocation = setPresetLocation;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.downloadCSV = downloadCSV;
window.sendCSVToEmail = sendCSVToEmail;
window.openLocationPage = openLocationPage;
