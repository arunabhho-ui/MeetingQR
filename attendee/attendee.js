console.log("CONFIG LOADED:", CONFIG);

const form = document.getElementById("attendanceForm");
const statusText = document.getElementById("status");
const eventTitle = document.getElementById("eventTitle");


/* ============================= */
/* LOAD CONFIG */
/* ============================= */

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


/* ============================= */
/* REDIRECT TO DENIED */
/* ============================= */

function redirectToDenied(reason){

  const reasonMap = {
    outside_location: "You are outside allowed location",
    device_duplicate: "Attendance already marked from this device",
    server_error: "Server error. Try again later"
  };

  const message = reasonMap[reason] || "Attendance denied";

  window.location.href =
    `denied.html?reason=${encodeURIComponent(reason)}&message=${encodeURIComponent(message)}`;

}


eventTitle.innerText =
  CONFIG?.event?.name || "Event Attendance";


/* ============================= */
/* DEVICE ID */
/* ============================= */

function getDeviceId(){

  let id = localStorage.getItem("deviceId");

  if(!id){
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }

  return id;

}


/* ============================= */
/* DISTANCE */
/* ============================= */

function distanceMeters(lat1, lon1, lat2, lon2){

  const R = 6371000;

  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;

  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R*c;

}


/* ============================= */
/* INITIAL CHECK */
/* ============================= */

async function initializeAttendance(){

  try{

    statusText.innerText = "Checking eligibility...";
    statusText.style.display = "block";

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

    console.log("Distance:", distance);

    if(distance > CONFIG.location.radius + 30){

      redirectToDenied("outside_location");
      return;

    }

    /* FIREBASE DUPLICATE CHECK */

    const existing =
      localStorage.getItem(
        "attendance_" + CONFIG.event.name
      );

    if(existing){

      redirectToDenied("device_duplicate");
      return;

    }

    statusText.style.display = "none";

    form.style.display = "block";

  }
  catch(err){

    console.error(err);

    redirectToDenied("server_error");

  }

}

initializeAttendance();



/* ============================= */
/* SUBMIT */
/* ============================= */

form.addEventListener("submit", async e => {

  e.preventDefault();

  const name =
    document.getElementById("name").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const facultyId =
    document.getElementById("facultyId").value.trim();

  const department =
    document.getElementById("department").value;

  const otherDepartment =
    document.getElementById("otherDepartment").value.trim();


  if(!name || !email || !facultyId || !department){

    statusText.innerText =
      "Please fill all required fields";

    return;

  }


  const submitBtn =
    form.querySelector('button[type="submit"]');

  submitBtn.disabled = true;

  submitBtn.innerText = "Submitting...";


  try{

    const deviceId = getDeviceId();

    const pos = await new Promise((resolve,reject)=>
      navigator.geolocation.getCurrentPosition(resolve,reject)
    );


    /* SAVE TO FIREBASE */

    await saveAttendanceFirebase({

      timestamp: new Date().toISOString(),

      eventName: CONFIG.event.name,

      name,
      email,
      facultyId,

      department:
        department==="other"
        ? otherDepartment
        : department,

      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,

      deviceId

    });


    /* SAVE LOCAL FLAG */

    localStorage.setItem(
      "attendance_" + CONFIG.event.name,
      "true"
    );


    window.location.href =
      "success.html";


  }
  catch(err){

    console.error(err);

    submitBtn.disabled = false;

    submitBtn.innerText = "Mark Attendance";

    statusText.innerText =
      "Error saving attendance";

  }

});


/* ============================= */
/* OTHER DEPARTMENT */
/* ============================= */

document
.getElementById("department")
.addEventListener("change", e => {

  const otherGroup =
    document.getElementById(
      "otherDepartmentGroup"
    );

  otherGroup.style.display =
    e.target.value==="other"
    ? "block"
    : "none";

});
