localStorage.removeItem("eventConfig");
localStorage.removeItem("locationConfig");

const form = document.getElementById("attendanceForm");
const statusText = document.getElementById("status");
const eventTitle = document.getElementById("eventTitle");


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


/* Load config */
function loadEffectiveConfig() {

  const savedEvent = localStorage.getItem("eventConfig");
  const savedLoc = localStorage.getItem("locationConfig");

  if (savedEvent)
    CONFIG.event = JSON.parse(savedEvent);

  if (savedLoc)
    CONFIG.location = JSON.parse(savedLoc);

}


loadEffectiveConfig();

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
function checkEligibility(lat, lon) {

  if (!CONFIG.event)
    return { ok: false, reason: "config_error" };

  function getEventStartTimeIST() {

    const [year, month, day] = CONFIG.event.date.split("-");
    const [hour, minute] = CONFIG.event.startTime.split(":");

    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0
    );
  }


  const dist =
    distanceMeters(
      lat,
      lon,
      CONFIG.location.latitude,
      CONFIG.location.longitude
    );

  if (dist > CONFIG.location.radius)
    return { ok: false, reason: "outside_location" };

  return { ok: true };

}


/* Initial load */
navigator.geolocation.getCurrentPosition(

  function(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const eligibility = checkEligibility(lat, lon);

    if (!eligibility.ok) {

      redirectToDenied(eligibility.reason);
      return;

    }

    form.style.display = "block";
    statusText.innerText = "";

  },

  function() {

    redirectToDenied("geolocation_permission");

  },

  { timeout: 10000 }

);


/* Submit attendance */
form.addEventListener("submit", async e => {

  e.preventDefault();

  statusText.innerText = "Submitting attendance...";

  const deviceId = getDeviceId();

  const payload = new FormData();

  /* IMPORTANT: tell Apps Script what action */
  payload.append("action", "submitAttendance");

  payload.append("eventName", CONFIG.event.name);

  payload.append("name",
    document.getElementById("name").value.trim());

  payload.append("email",
    document.getElementById("email").value.trim());

  payload.append("phone",
    document.getElementById("phone").value.trim());

  payload.append("department",
    document.getElementById("department").value);

  payload.append("deviceId", deviceId);

  payload.append("eventDate", CONFIG.event.date);
  payload.append("startTime", CONFIG.event.startTime);
  payload.append("durationMinutes", CONFIG.event.durationMinutes);



  try {

    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    payload.append("latitude", pos.coords.latitude);
    payload.append("longitude", pos.coords.longitude);

    console.log("Sending payload:",
      Object.fromEntries(payload));

    const res = await fetch(CONFIG.googleScriptURL, {

      method: "POST",

      body: payload

    });

    const result = await res.json();

    console.log("Server response:", result);


    if (result.success) {

      window.location.href = "success.html";

    }
    else if (result.reason === "duplicate_device") {

      redirectToDenied("device_duplicate");

    }
    else {

      redirectToDenied("server_error");

    }

  }
  catch (err) {

    console.error(err);

    redirectToDenied("server_error");

  }

});
