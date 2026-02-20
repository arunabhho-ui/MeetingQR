import { CONFIG } from "../config.js";

/* Helper function to set loading state on button */
function setButtonLoading(button, isLoading, loadingText = "Loading...") {
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }
}

const form = document.getElementById("attendanceForm");
const statusText = document.getElementById("status");
const eventTitle = document.getElementById("eventTitle");

function loadEffectiveConfig() {

  const savedEvent = localStorage.getItem("eventConfig");
  const savedLoc = localStorage.getItem("locationConfig");

  if (savedEvent && !CONFIG.event.name)
    CONFIG.event = JSON.parse(savedEvent);

  if (savedLoc && !CONFIG.location.latitude)
    CONFIG.location = JSON.parse(savedLoc);

}


loadEffectiveConfig();

function loadConfigFromURL(){

  const params = new URLSearchParams(window.location.search);

  const lat = params.get("lat");
  const lng = params.get("lng");
  const radius = params.get("radius");
  const event = params.get("event");
  const date = params.get("date");
  const startTime = params.get("startTime");
  const duration = params.get("duration");

  if(lat && lng && radius){
    CONFIG.location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: parseFloat(radius)
    };
  }

  if(!CONFIG.event){
    CONFIG.event = {};
  }

  if(event) CONFIG.event.name = event;
  if(date) CONFIG.event.date = date;
  if(startTime) CONFIG.event.startTime = startTime;
  if(duration) CONFIG.event.durationMinutes = parseInt(duration);

  // NOW validate config
  if(!CONFIG.event.name || !CONFIG.location.latitude){
    redirectToDenied("config_error");
  }

}

loadConfigFromURL();

/* Redirect to denied page */
function redirectToDenied(reason) {

  const reasonMap = {
    config_error: "Event not configured properly",
    time_closed: "Attendance window closed",
    outside_location: "You are outside allowed location",
    device_duplicate: "Attendance already marked from this device",
    incomplete_submission: "Please fill all required fields",
    invalid_location: "Invalid location data",
    geolocation_permission: "Location permission denied",
    geolocation_unavailable: "Location unavailable",
    geolocation_timeout: "Location timeout",
    geolocation_error: "Location error",
    server_error: "Server error. Try again later"
  };

  const message = reasonMap[reason] || "Attendance denied";

  window.location.href =
    `denied.html?reason=${encodeURIComponent(reason)}&message=${encodeURIComponent(message)}`;
}



eventTitle.innerText =
  CONFIG?.event?.name || "Event Attendance";


/* Device ID */
function getDeviceId() {

  let id = localStorage.getItem("deviceId");

  if (!id) {

    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);

  }

  return id;

}


/* Distance calculation */
function distanceMeters(lat1, lon1, lat2, lon2) {

  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;

}


/* Check eligibility */



/* Initial load */
async function initializeAttendance(){
  try{

    const deviceId = getDeviceId();

    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0   // never use a cached position
      })
    );

    const distance = distanceMeters(
      pos.coords.latitude,
      pos.coords.longitude,
      CONFIG.location.latitude,
      CONFIG.location.longitude
    );

    // Allow 30 meter GPS tolerance
    if(distance > CONFIG.location.radius + 30){
      redirectToDenied("outside_location");
      return;
    }

    // Time window check
    try{
      if(CONFIG.event && CONFIG.event.date && CONFIG.event.startTime){
        const start = new Date(`${CONFIG.event.date}T${CONFIG.event.startTime}`);
        const end = new Date(start.getTime() + (CONFIG.event.durationMinutes||0) * 60000);
        const now = new Date();
        if(now < start || now > end){
          redirectToDenied("time_closed");
          return;
        }
      }
    }
    catch(e){
      console.warn('Time check failed', e);
    }

    // Duplicate device check via Firebase
    try{
      const { getAllAttendance } = await import("../firebase.js");
      const records = await getAllAttendance();
      const prev = records.find(r => r.deviceId === deviceId && r.eventName === CONFIG.event.name);
      if(prev){
        redirectToDenied("device_duplicate");
        return;
      }
    }
    catch(e){
      console.error('Duplicate check failed:', e);
      redirectToDenied("server_error");
      return;
    }

    form.style.display="block";
    statusText.style.display="none";

  }
  catch(err){
    console.error("ERROR:", err);
    // Handle geolocation-specific errors properly
    if (err && err.code) {
      const geoErrors = {
        1: "geolocation_permission",   // PERMISSION_DENIED
        2: "geolocation_unavailable",  // POSITION_UNAVAILABLE
        3: "geolocation_timeout",      // TIMEOUT
      };
      redirectToDenied(geoErrors[err.code] || "geolocation_error");
    } else {
      redirectToDenied("server_error");
    }
  }


}

initializeAttendance();



/* Submit attendance */
form.addEventListener("submit", async e => {

  e.preventDefault();

  // Validate required fields
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const facultyId = document.getElementById("facultyId").value.trim();
  const department = document.getElementById("department").value;
  const otherDepartment = document.getElementById("otherDepartment").value.trim();

  if (!name || !email || !facultyId || !department) {
    statusText.innerText = "Please fill all required fields";
    return;
  }

  if (department === "other" && !otherDepartment) {
    statusText.innerText = "Please specify your department";
    return;
  }

  const submitButton = document.getElementById('submitBtn');
  setButtonLoading(submitButton, true, "Submitting...");

  const deviceId = getDeviceId();

  try {

    const pos = await new Promise((resolve,reject)=>
      navigator.geolocation.getCurrentPosition(resolve,reject)
    );

    const payload = new URLSearchParams();

    payload.append("action", "submitAttendance");

    payload.append("eventName", CONFIG.event.name);

    payload.append("name", name);

    payload.append("email", email);

    payload.append("facultyId", facultyId);

    payload.append(
      "department",
      department === "other" ? otherDepartment : department
    );

    payload.append("deviceId", deviceId);

    payload.append("latitude", pos.coords.latitude);

    payload.append("longitude", pos.coords.longitude);

    // Calculate start and end times
    if(!CONFIG.event?.date || !CONFIG.event?.startTime){
      statusText.innerText = "Event configuration error";
      setButtonLoading(submitButton, false);
      return;
    }

    const startDateTime = new Date(CONFIG.event.date + "T" + CONFIG.event.startTime);
    const endDateTime = new Date(startDateTime.getTime() + (CONFIG.event.durationMinutes || 0) * 60000);

    if(isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())){
      statusText.innerText = "Invalid event time";
      setButtonLoading(submitButton, false);
      return;
    }

    payload.append("startTime", startDateTime.toISOString());
    payload.append("endTime", endDateTime.toISOString());

    payload.append("eventLat", CONFIG.location.latitude);

    payload.append("eventLng", CONFIG.location.longitude);

    payload.append("radius", CONFIG.location.radius);

    console.log("Submitting payload:", payload.toString());

    const response = await fetch(CONFIG.mailerScriptURL, {

      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body: payload.toString()

    });

    const result = await response.json();

    if(result.success){

      window.location.assign("success.html");

    }
    else{

      statusText.innerText = result.error || "Server error";
      setButtonLoading(submitButton, false);

    }

  }
  catch(err){

    console.error(err);

    setButtonLoading(submitButton, false);
    redirectToDenied("server_error");

  }

});

/* Handle "other" department selection */
document.getElementById("department").addEventListener("change", e => {
  const otherGroup = document.getElementById("otherDepartmentGroup");
  if (e.target.value === "other") {
    otherGroup.style.display = "block";
  } else {
    otherGroup.style.display = "none";
  }
});
