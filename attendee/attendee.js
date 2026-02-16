console.log("CONFIG LOADED:", CONFIG);

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

  if(lat && lng && radius){

    CONFIG.location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      radius: parseFloat(radius)
    };

  }

  if(event){

    CONFIG.event.name = event;

  }

}

loadConfigFromURL();

console.log("FINAL CONFIG:", CONFIG);

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
  console.log("Using location:", CONFIG.location);
  try{

    const deviceId = getDeviceId();

    const pos = await new Promise((resolve,reject)=>
      navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:10000})
    );

    const distance = distanceMeters(
      pos.coords.latitude,
      pos.coords.longitude,
      CONFIG.location.latitude,
      CONFIG.location.longitude
    );

    console.log("Distance from event:", distance);

    // Allow 30 meter GPS tolerance
    if(distance > CONFIG.location.radius + 30){
      redirectToDenied("outside_location");
      return;
    }


    form.style.display="block";
    statusText.style.display="none";
    console.log("Form initialized");

  }
  catch(err){
    console.error("ERROR:", err);
    redirectToDenied("server_error");
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

  statusText.innerText = "Submitting attendance...";

  const deviceId = getDeviceId();

  const payload = new FormData();

  /* IMPORTANT: tell Apps Script what action */
  payload.append("action", "submitAttendance");

  payload.append("eventName", CONFIG.event.name);

  payload.append("name", name);

  payload.append("email", email);

  payload.append("facultyId", facultyId);


  payload.append("department",
    department === "other" ? otherDepartment : department);

  payload.append("deviceId", deviceId);

  


  try {

    const pos = await new Promise((resolve,reject)=>
      navigator.geolocation.getCurrentPosition(resolve,reject)
    );

    const attendanceData = {

      eventName: CONFIG.event.name,
      name: name,
      email: email,
      facultyId: facultyId,
      department: department === "other" ? otherDepartment : department,

      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,

      deviceId: deviceId,

      timestamp: new Date().toISOString()

    };

    const { saveAttendanceFirebase } = await import("../firebase.js");

    await saveAttendanceFirebase(attendanceData);

    window.location.href = "success.html";

  }
  catch(err){

    console.error(err);

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
