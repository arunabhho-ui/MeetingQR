import { CONFIG } from "../config.js";

/* Helper function to set loading state on button */
function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> Loading...`;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }
}

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
  // Clear any old location data from previous sessions
  localStorage.removeItem("locationConfig");
  // Clear preset selection text
  const presetEl = document.getElementById("presetSelected");
  if (presetEl) presetEl.innerText = "";
}

/* Load saved location config from localStorage */

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

    if (
      cfg &&
      typeof cfg.latitude === "number" &&
      typeof cfg.longitude === "number" &&
      typeof cfg.radius === "number"
    ) {
      return cfg;
    }

  } catch (e) {
    console.error("Location parse error:", e);
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
      missing.push(`event details (${eventMissing.join(", ")})`);
    }
    if (!hasLocation) missing.push("location");
    statusHint.innerHTML = `⚠️ Please set: ${missing.join(" and ")}`;
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

/* Preset locations: AB5 and AB4 */
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

  const p = presets[name];
  if (!p) return;

  // Save to localStorage (map.html reads this key)
  try {
    localStorage.setItem('locationConfig', JSON.stringify(p));
    CONFIG.location = p;
    const el = document.getElementById('presetSelected');
    if (el) el.innerText = `${name} Selected`;
    updateQRButtonState();
    alert(`Location set to ${name}`);
  } catch (err) {
    console.error('Failed to set preset location', err);
    alert('Failed to set preset location');
  }
}

/* Generate QR code */
async function generateQR() {
  setButtonLoading('generateQR', true);
  try {
    // Clear any leftover attendance immediately when a new QR is generated.
    // Do NOT email director at this time; director will be emailed when event ends.
    try{
      await fetch(CONFIG.mailerScriptURL,{
        method: "POST",
        body: new URLSearchParams({ action: "clearAttendance" })
      });
    }
    catch(e){
      console.warn('Failed to clear previous attendance:', e);
    }

    const eventName = document.getElementById("eventName").value.trim();
    const eventDate = document.getElementById("eventDate").value;
    const startTime = document.getElementById("startTime").value;
    const duration = document.getElementById("duration").value;

    // Check all required fields first
    if (!eventName || !eventDate || !startTime || !duration) {
      alert("❌ Please fill all event details first.");
      setButtonLoading('generateQR', false);
      return;
    }

    const loc = readStoredLocation();

    if (!loc) {
      alert("❌ Please set location first (using presets or map).");
      setButtonLoading('generateQR', false);
      return;
    }

    CONFIG.event = {
      name: eventName,
      date: eventDate,
      startTime: startTime,
      durationMinutes: parseInt(duration)
    };

    CONFIG.location = loc;

    console.log("Using location:", loc);

    const url =
      `${window.location.origin}/MeetingQR/attendee/index.html` +
      `?event=${encodeURIComponent(eventName)}` +
      `&lat=${loc.latitude}` +
      `&lng=${loc.longitude}` +
      `&radius=${loc.radius}`;

    console.log("QR URL:", url);

    document.getElementById("qrImage").src =
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
      encodeURIComponent(url);

    document.getElementById("qrSection").style.display = "block";
    
    // Schedule director email for event end time
    scheduleDirectorEmail();
  } finally {
    setButtonLoading('generateQR', false);
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
async function downloadQR() {
  try {
    const qrImage = document.getElementById("qrImage");
    if (!qrImage.src) {
      alert("Generate QR code first");
      return;
    }

    // Fetch the QR image as a blob
    const response = await fetch(qrImage.src);
    if (!response.ok) throw new Error('Failed to fetch QR image');
    const blob = await response.blob();
    
    // Convert blob to base64 data URL (NOT revokable)
    const reader = new FileReader();
    reader.onload = function() {
      const base64DataUrl = reader.result;
      const link = document.createElement('a');
      link.href = base64DataUrl;
      const filename = (CONFIG.event && CONFIG.event.name) ? `${CONFIG.event.name}_QR.png` : 'event_QR.png';
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Trigger download - opens Save As dialog
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error('Failed to download QR image', err);
    alert('Failed to download QR image: ' + err.message);
  }
}

/* Export CSV */
function exportCSV() {
  downloadCSV();
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
  updateLocationFromStorage();
  
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
  
  // Do NOT call scheduleDirectorEmail here - it will be called after QR is generated
});

/* Also check for location updates when page regains focus */
window.addEventListener("focus", () => {

  // reload location from localStorage
  updateLocationFromStorage();

  // update UI
  updateQRButtonState();

});


async function downloadCSV() {
  setButtonLoading("downloadCSVButton", true);
  try {
    const { getAllAttendance } = await import("../firebase.js");
    const records = await getAllAttendance();

    if (!records || records.length === 0) {
      alert("No attendance records found");
      setButtonLoading("downloadCSVButton", false);
      return;
    }

    // Create CSV content
    let csv = "Timestamp,Event,Name,Email,FacultyID,Department,Latitude,Longitude\n";
    records.forEach(record => {
      csv +=
        `${record.timestamp || ""},` +
        `${record.eventName || ""},` +
        `${record.name || ""},` +
        `${record.email || ""},` +
        `${record.facultyId || ""},` +
        `${record.department || ""},` +
        `${record.latitude || ""},` +
        `${record.longitude || ""}\n`;
    });

    // Generate filename
    let filename = "Attendance_Report.csv";
    if(CONFIG.event?.name){
      filename = `${CONFIG.event.name.replace(/\s+/g, '_')}_Attendance.csv`;
    }

    // Create data URL and trigger download
    const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Trigger download - opens Save As dialog
    link.click();
    
    // Cleanup immediately
    document.body.removeChild(link);
    
    setButtonLoading("downloadCSVButton", false);
  }
  catch(err){
    console.error(err);
    alert("Download failed: " + err.message);
    setButtonLoading("downloadCSVButton", false);
  }
}

async function sendCSVToEmail(){
  setButtonLoading('emailCSVButton', true);
  try{

    const email =
      document.getElementById("directorEmail").value.trim();

    if(!email){
      alert("Enter email first");
      setButtonLoading('emailCSVButton', false);
      return;
    }

    const res =
      await fetch(CONFIG.mailerScriptURL,{

        method:"POST",

        body:new URLSearchParams({

          action:"sendAttendanceEmail",
          email:email

        })

      });

    const data =
      await res.json();

    if(data.success){

      alert("Attendance emailed to " + email);

    }
    else{

      alert("Failed: "+data.error);

    }

  }
  catch(err){

    console.error(err);
    alert("Email failed");

  }
  finally{
    setButtonLoading('emailCSVButton', false);
  }

}

function scheduleDirectorEmail(){

  const event = CONFIG.event;

  if(!event || !event.date || !event.startTime){
    console.log("Event not configured, email not scheduled");
    return;
  }

  const endTime =
    new Date(`${event.date}T${event.startTime}`);

  endTime.setMinutes(
    endTime.getMinutes() + event.durationMinutes
  );

  const delay =
    endTime.getTime() - Date.now();

  console.log("Email scheduled in ms:", delay);

  // CRITICAL FIX:
  // NEVER send immediately if delay <= 0
  if(delay <= 0){

    console.log("Event already ended — not sending email automatically");

    return;

  }

  setTimeout(()=>{

    sendDirectorEmailNow();

  }, delay);

}



async function sendDirectorEmailNow(){

  try{

    await fetch(CONFIG.mailerScriptURL,{

      method:"POST",

      body:new URLSearchParams({

        action:"sendDirectorEmail"

      })

    });

    console.log("Director email sent");

  }
  catch(err){

    console.error(err);

  }

}

/* Expose functions to global scope for HTML onclick handlers */
window.saveEvent = saveEvent;
window.openLocationPage = openLocationPage;
window.setPresetLocation = setPresetLocation;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.downloadCSV = downloadCSV;
window.sendCSVToEmail = sendCSVToEmail;
