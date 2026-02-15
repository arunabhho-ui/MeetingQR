/* Auto-fill current time when page loads */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/* Load saved event config from localStorage */
function loadEventState() {
  // Always reset form fields on page load
  document.getElementById("eventName").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("duration").value = "";
}

/* Load saved location config from localStorage */
function loadLocationState() {
  // Always reset location on initial page load
  CONFIG.location = {
    latitude: 0,
    longitude: 0,
    radius: 0
  };
}

/* Load location from storage (called when map.html saves location) */
function updateLocationFromStorage() {
  const saved = localStorage.getItem("locationConfig");
  if (saved) {
    try {
      const config = JSON.parse(saved);
      CONFIG.location = config;
    } catch (e) {
      console.error("Failed to parse location config", e);
    }
  }
}

/* Read location directly from localStorage (authoritative) */
function readStoredLocation() {
  const saved = localStorage.getItem("locationConfig");
  if (!saved) return null;
  try {
    const cfg = JSON.parse(saved);
    if (cfg && cfg.latitude && cfg.longitude && cfg.latitude > 0 && cfg.longitude > 0) {
      return cfg;
    }
  } catch (e) {
    console.error('readStoredLocation parse error', e);
  }
  return null;
}

/* Save event details and update CONFIG */
function saveEvent() {
  const eventName = document.getElementById("eventName").value.trim();
  const eventDate = document.getElementById("eventDate").value;
  const startTime = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;

  if (!eventName || !eventDate || !startTime || !duration) {
    alert("Please fill in all event details");
    return;
  }

  CONFIG.event = {
    name: eventName,
    date: eventDate,
    startTime: startTime,
    durationMinutes: parseInt(duration)
  };

  localStorage.setItem("eventConfig", JSON.stringify(CONFIG.event));
  alert("✅ Event details saved!");
  updateQRButtonState();

  fetch(CONFIG.googleScriptURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "createEvent",
      eventDate: CONFIG.event.date,
      startTime: CONFIG.event.startTime,
      durationMinutes: CONFIG.event.durationMinutes
    })
  });
}

/* Enable/disable Generate QR button based on event and location config */
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
    if (!hasEvent) {
      const eventMissing = [];
      if (!eventName) eventMissing.push("name");
      if (!eventDate) eventMissing.push("date");
      if (!startTime) eventMissing.push("time");
      if (!duration) eventMissing.push("duration");
      missing.push(`event (${eventMissing.join(", ")})`);
    }
    if (!hasLocation) missing.push("location");
    statusHint.innerHTML = `⚠️ Required: ${missing.join(" + ")}`;
    statusHint.style.display = "block";
  }
}

/* Initialize date picker */
function initializeDatePicker() {
  flatpickr("#eventDate", {
    enableTime: false,
    dateFormat: "Y-m-d",
    minDate: "today"
  });
}

/* Initialize time input */
function initializeTimePicker() {
  const timeInput = document.getElementById("startTime");
  timeInput.placeholder = "HH:MM (24-hour format)";
  timeInput.addEventListener("change", updateQRButtonState);
}

/* Open location selection page */
function openLocationPage() {
  window.open("map.html", "_blank", "width=1200,height=800");
}

/* Generate QR code */
function generateQR() {
  const eventName = document.getElementById("eventName").value.trim();
  const eventDate = document.getElementById("eventDate").value;
  const startTime = document.getElementById("startTime").value;
  const duration = document.getElementById("duration").value;
  
  const hasEvent = eventName && eventDate && startTime && duration;
  const storedLoc = readStoredLocation();
  const hasLocation = !!storedLoc;

  if (!hasEvent || !hasLocation) {
    const missing = [];
    if (!hasEvent) missing.push("event details");
    if (!hasLocation) missing.push("location");
    alert(`⚠️ Please set: ${missing.join(" and ")}`);
    return;
  }

  // Update CONFIG with current form values
  CONFIG.event = {
    name: eventName,
    date: eventDate,
    startTime: startTime,
    durationMinutes: parseInt(duration)
  };

  // Ensure CONFIG.location reflects stored location before generating QR
  if (storedLoc) CONFIG.location = storedLoc;

  const url = window.location.origin + window.location.pathname.split("/organizer")[0] + "/attendee/index.html";


  const qrImage = document.getElementById("qrImage");

  qrImage.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(url);

  document.getElementById("qrSection").style.display = "block";
  document.getElementById("eventTitle").innerText = CONFIG.event.name;
  startQRTimer();
  async function createEventOnServer() {

    const eventDate =
      document.getElementById("eventDate").value;

    const startTime =
      document.getElementById("startTime").value;

    const durationMinutes =
      document.getElementById("duration").value;

    const formData = new FormData();

    formData.append("action", "createEvent");
    formData.append("eventDate", eventDate);
    formData.append("startTime", startTime);
    formData.append("durationMinutes", durationMinutes);

    await fetch(CONFIG.googleScriptURL, {

      method: "POST",
      body: formData

    });

  }

}

/* Start countdown timer for QR validity */
function startQRTimer() {
  const event = CONFIG.event;
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

/* Format time difference for display */
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

/* Download QR code */
function downloadQR() {
  const qrImage = document.getElementById("qrImage");
  if (!qrImage.src) {
    alert("Generate QR code first");
    return;
  }

  // Fetch the image as a blob so download works reliably across origins
  fetch(qrImage.src)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = (CONFIG.event && CONFIG.event.name) ? `${CONFIG.event.name}-QR.png` : 'event-QR.png';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // release memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    })
    .catch(err => {
      console.error('Failed to download QR image', err);
      alert('Failed to download QR image. Open the QR and save manually as a fallback.');
    });
}

/* Export CSV */
function exportCSV() {
  alert(
    "Download CSV directly from Google Sheets:\n\n" +
    "File → Download → CSV"
  );
}

/* Email CSV */
function emailCSV() {
  const email = document.getElementById("directorEmail").value.trim();
  if (!email) {
    alert("Please enter director email");
    return;
  }
  
  // In a real app, this would call your backend
  alert(`CSV will be sent to: ${email}`);
}

/* Initialize on page load */
document.addEventListener("DOMContentLoaded", () => {
  // FIRST: Clear everything on page load
  loadEventState();
  loadLocationState();
  localStorage.removeItem("eventConfig");
  localStorage.removeItem("locationConfig");
  
  // Auto-fill current time if startTime is empty
  const startTimeInput = document.getElementById("startTime");
  if (!startTimeInput.value) {
    startTimeInput.value = getCurrentTime();
  }
  
  // Reset QR section
  document.getElementById("qrSection").style.display = "none";
  
  // Reset director email field
  const directorEmailInput = document.getElementById("directorEmail");
  if (directorEmailInput) {
    directorEmailInput.value = "";
  }
  
  initializeDatePicker();
  initializeTimePicker();
  
  // Add real-time listeners to all event detail fields for instant validation
  document.getElementById("eventName").addEventListener("input", () => {
    CONFIG.event.name = document.getElementById("eventName").value;
    updateQRButtonState();
  });
  
  document.getElementById("eventDate").addEventListener("change", () => {
    CONFIG.event.date = document.getElementById("eventDate").value;
    updateQRButtonState();
  });
  
  document.getElementById("startTime").addEventListener("input", () => {
    CONFIG.event.startTime = document.getElementById("startTime").value;
    updateQRButtonState();
  });
  
  document.getElementById("duration").addEventListener("input", () => {
    const duration = document.getElementById("duration").value;
    CONFIG.event.durationMinutes = duration ? parseInt(duration) : 0;
    updateQRButtonState();
  });
  
  updateQRButtonState();
  
  // Listen for storage changes (location updates from map.html)
  window.addEventListener("storage", (e) => {
    if (e.key === "locationConfig") {
      updateLocationFromStorage();
      updateQRButtonState();
    }
  });
});

/* Also check for location updates when page regains focus */
window.addEventListener("focus", () => {
  // IMPORTANT: Always check current location state
  // Don't restore from localStorage on focus
  updateQRButtonState();
});

function downloadCSV() {

  const url =
    CONFIG.googleScriptURL + "?action=downloadCSV";

  window.open(url, "_blank");

}



function sendCSVToEmail() {

  const email =
    document.getElementById("directorEmail").value.trim();

  if (!email) {

    alert("Enter email");

    return;

  }

  fetch(CONFIG.googleScriptURL, {

    method: "POST",

    body: new URLSearchParams({

      action: "emailCSV",

      email: email

    })

  })
  .then(res => res.json())
  .then(data => {

    if (data.success)
      alert("CSV sent successfully");

    else
      alert("Failed: " + data.error);

  })
  .catch(err => {

    console.error(err);

    alert("Error sending CSV");

  });

}
