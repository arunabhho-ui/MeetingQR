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
  const nameEl = document.getElementById("eventName");
  const dateEl = document.getElementById("eventDate");
  const timeEl = document.getElementById("startTime");
  const durEl = document.getElementById("duration");
  if(nameEl) nameEl.value = "";
  if(dateEl) dateEl.value = "";
  if(timeEl) timeEl.value = "";
  if(durEl) durEl.value = "";
  localStorage.removeItem("locationConfig");
  const presetEl = document.getElementById("presetSelected");
  if (presetEl) presetEl.innerText = "";
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

function readStoredLocation() {
  const saved = localStorage.getItem("locationConfig");
  if (!saved) return null;
  try {
    const cfg = JSON.parse(saved);
    if (cfg && typeof cfg.latitude === "number" && typeof cfg.longitude === "number" && typeof cfg.radius === "number") {
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
    if(generateBtn) generateBtn.disabled = false;
    if(statusHint) statusHint.style.display = "none";
  } else {
    if(generateBtn) generateBtn.disabled = true;
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
    if(statusHint) {
      statusHint.innerHTML = `⚠️ Please set: ${missing.join(" and ")}`;
      statusHint.style.display = "block";
    }
  }
}

/* Initialize date picker */
function initializeDatePicker() {
  flatpickr("#eventDate", { enableTime: false, dateFormat: "Y-m-d", minDate: "today" });
}

/* Initialize time input */
function initializeTimePicker() {
  const timeInput = document.getElementById("startTime");
  if(timeInput){
    timeInput.placeholder = "HH:MM (24-hour format)";
    timeInput.addEventListener("change", updateQRButtonState);
  }
}

/* Open location selection page */
function openLocationPage() { window.open("map.html", "_blank", "width=1200,height=800"); }

/* Preset locations */
function setPresetLocation(name) {
  const presets = {
    AB5: { latitude: 13.125128055616079, longitude: 77.58987820483807, radius: 50 },
    AB4: { latitude: 13.12528478397818, longitude: 77.59058362580247, radius: 50 }
  };
  const p = presets[name];
  if (!p) return;
  try{
    localStorage.setItem('locationConfig', JSON.stringify(p));
    CONFIG.location = p;
    const el = document.getElementById('presetSelected'); if (el) el.innerText = `${name} Selected`;
    updateQRButtonState();
    alert(`Location set to ${name}`);
  } catch(err){ console.error('Failed to set preset location', err); alert('Failed to set preset location'); }
}

/* Generate QR code */
async function generateQR() {
  setButtonLoading('generateQR', true);
  try {
    try{
      await fetch(CONFIG.mailerScriptURL,{ method: "POST", body: new URLSearchParams({ action: "clearAttendance" }) });
    } catch(e){ console.warn('Failed to clear previous attendance:', e); }

    const eventName = document.getElementById("eventName").value.trim();
    const eventDate = document.getElementById("eventDate").value;
    const startTime = document.getElementById("startTime").value;
    const duration = document.getElementById("duration").value;

    if (!eventName || !eventDate || !startTime || !duration) {
      alert("❌ Please fill all event details first.");
      setButtonLoading('generateQR', false);
      return;
    }

    const loc = readStoredLocation();
    if (!loc) { alert("❌ Please set location first (using presets or map)."); setButtonLoading('generateQR', false); return; }

    CONFIG.event = { name: eventName, date: eventDate, startTime: startTime, durationMinutes: parseInt(duration) };
    CONFIG.location = loc;

    const url = `${window.location.origin}/MeetingQR/attendee/index.html` +
      `?event=${encodeURIComponent(eventName)}` + `&lat=${loc.latitude}` + `&lng=${loc.longitude}` + `&radius=${loc.radius}`;

    document.getElementById("qrImage").src = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(url);
    document.getElementById("qrSection").style.display = "block";

    try { startQRTimer(); } catch(e) { /* ignore */ }
    scheduleDirectorEmail();

  } finally {
    setButtonLoading('generateQR', false);
  }
}

/* Start countdown timer for QR validity */
function startQRTimer() {
  const event = CONFIG.event;
  if(!event) return;
  const start = new Date(`${event.date}T${event.startTime}`);
  const end = new Date(start.getTime() + event.durationMinutes * 60000);
  const updateTimer = () => {
    const now = new Date();
    const timerEl = document.getElementById("qrTimer");
    if(!timerEl) return;
    if (now < start) timerEl.innerHTML = `⏳ Starts in ${formatTimeUntil(start)}`;
    else if (now > end) timerEl.innerHTML = `⏹️ Event ended`;
    else timerEl.innerHTML = `✅ Active (${formatTimeUntil(end)} remaining)`;
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
    if (!qrImage || !qrImage.src) { alert("Generate QR code first"); return; }
    const response = await fetch(qrImage.src);
    if (!response.ok) throw new Error('Failed to fetch QR image');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    const filename = (CONFIG.event && CONFIG.event.name) ? `${CONFIG.event.name}_QR.png` : 'event_QR.png';
    link.download = filename; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  } catch (err) { console.error('Failed to download QR image', err); alert('Failed to download QR image: ' + err.message); }
}

/* Email CSV (manual) */
async function sendCSVToEmail(){
  setButtonLoading('emailCSVButton', true);
  try{
    const email = document.getElementById("directorEmail").value.trim();
    if(!email){ alert("Enter email first"); setButtonLoading('emailCSVButton', false); return; }
    // Request filtered CSV (latitude/longitude removed)
    const res = await fetch(CONFIG.mailerScriptURL,{ method:"POST", body:new URLSearchParams({ action:"sendFilteredAttendanceEmail", email:email }) });
    const data = await res.json();
    if(data.success) alert("Attendance emailed to " + email);
    else alert("Failed: "+data.error);
  }
  catch(err){ console.error(err); alert("Email failed"); }
  finally{ setButtonLoading('emailCSVButton', false); }
}

/* START: UI lifecycle */
document.addEventListener("DOMContentLoaded", () => {
  loadEventState(); updateLocationFromStorage();
  const startTimeInput = document.getElementById("startTime"); if (startTimeInput && !startTimeInput.value) startTimeInput.value = getCurrentTime();
  const qrSection = document.getElementById("qrSection"); if(qrSection) qrSection.style.display = "none";
  const directorEmailInput = document.getElementById("directorEmail"); if (directorEmailInput) directorEmailInput.value = "";
  initializeDatePicker(); initializeTimePicker();
  const en = document.getElementById("eventName"); if(en) en.addEventListener("input", updateQRButtonState);
  const ed = document.getElementById("eventDate"); if(ed) ed.addEventListener("change", updateQRButtonState);
  const st = document.getElementById("startTime"); if(st) st.addEventListener("input", updateQRButtonState);
  const du = document.getElementById("duration"); if(du) du.addEventListener("input", updateQRButtonState);
  updateQRButtonState();
  window.addEventListener("storage", (e) => { if (e.key === "locationConfig") { updateLocationFromStorage(); updateQRButtonState(); } });
});

window.addEventListener("focus", () => { updateLocationFromStorage(); updateQRButtonState(); });

/* Export CSV (download) */
async function downloadCSV() {
  setButtonLoading("downloadCSVButton", true);
  try {
    const { getAllAttendance } = await import("../firebase.js");
    const records = await getAllAttendance();
    if (!records || records.length === 0) { alert("No attendance records found"); setButtonLoading("downloadCSVButton", false); return; }
    // Build CSV without latitude/longitude
    let csv = "Timestamp,Event,Name,Email,FacultyID,Department\n";
    records.forEach(record => { csv += `${record.timestamp || ""},${record.eventName || ""},${record.name || ""},${record.email || ""},${record.facultyId || ""},${record.department || ""}\n`; });
    let filename = "Attendance_Report.csv"; if(CONFIG.event?.name) filename = `${CONFIG.event.name.replace(/\s+/g, '_')}_Attendance.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  } catch(err){ console.error(err); alert("Download failed: " + err.message); }
  finally { setButtonLoading("downloadCSVButton", false); }
}

/* SCHEDULE + SEND FLOW */
function scheduleDirectorEmail(){
  const event = CONFIG.event;
  if(!event || !event.date || !event.startTime){ console.log("Event not configured, email not scheduled"); return; }
  const endTime = new Date(`${event.date}T${event.startTime}`);
  endTime.setMinutes(endTime.getMinutes() + event.durationMinutes);
  const delay = endTime.getTime() - Date.now();
  console.log("Email scheduled in ms:", delay);
  if (delay <= 0) { console.log("Event already ended — not sending email automatically"); return; }
  setTimeout(() => { sendDirectorEmailWithUI(); }, delay);
}

/* Performs the POST and returns a status object */
async function sendDirectorEmailNow(){
  try{
    // Send filtered CSV to director (omit lat/lon). Use directorEmail input if set, otherwise fallback.
    const directorEmailInput = document.getElementById('directorEmail');
    const directorEmail = (directorEmailInput && directorEmailInput.value && directorEmailInput.value.trim()) ? directorEmailInput.value.trim() : 'arunabhho.das@gmail.com';
    const res = await fetch(CONFIG.mailerScriptURL, { method: "POST", body: new URLSearchParams({ action: "sendFilteredAttendanceEmail", email: directorEmail }) });
    let body = null; try { body = await res.json(); } catch(e) { }
    if (res.ok) return { success: true, data: body };
    return { success: false, error: (body && body.error) ? body.error : 'Request failed' };
  } catch(err){ return { success: false, error: err.message }; }
}

/* UI helpers for email sending status shown under the QR */
function showEmailStatus(message, showSpinner = true){
  const container = document.getElementById('emailStatus');
  const msg = document.getElementById('emailMessage');
  const spinnerWrap = document.getElementById('emailSpinner');
  if(!container || !msg) return;
  msg.innerText = message;
  if(spinnerWrap) spinnerWrap.style.display = showSpinner ? 'inline-block' : 'none';
  container.style.display = 'flex';
}
function hideEmailStatus(){ const container = document.getElementById('emailStatus'); if(container) container.style.display = 'none'; }

/* Wrapper that shows spinner/message in UI while sending */
async function sendDirectorEmailWithUI(){
  try{
    showEmailStatus('Sending mail to director...', true);
    const result = await sendDirectorEmailNow();
    if(result.success){ showEmailStatus('Mail sent to director', false); setTimeout(hideEmailStatus, 5000); }
    else { showEmailStatus('Failed to send mail: ' + (result.error || 'unknown'), false); }
    return result;
  } catch(err){ console.error(err); showEmailStatus('Failed to send mail: ' + err.message, false); return { success: false, error: err.message }; }
}

/* Expose functions to global scope for HTML onclick handlers */
window.saveEvent = saveEvent;
window.openLocationPage = openLocationPage;
window.setPresetLocation = setPresetLocation;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
window.downloadCSV = downloadCSV;
window.sendCSVToEmail = sendCSVToEmail;
