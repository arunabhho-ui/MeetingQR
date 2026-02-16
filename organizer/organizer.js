/* ============================= */
/* CURRENT TIME */
/* ============================= */

function getCurrentTime(){

  const now = new Date();

  const hours =
    String(now.getHours()).padStart(2,'0');

  const minutes =
    String(now.getMinutes()).padStart(2,'0');

  return `${hours}:${minutes}`;

}


/* ============================= */
/* INITIALIZE DATE PICKER */
/* ============================= */

function initializeDatePicker(){

  flatpickr("#eventDate", {

    mode: "single",

    dateFormat: "Y-m-d",

    minDate: "today",

    placeholder: "Select a date"

  });

}


/* ============================= */
/* LOAD EVENT STATE */
/* ============================= */

function loadEventState(){

  document.getElementById("eventName").value = "";

  document.getElementById("eventDate").value = "";

  document.getElementById("startTime").value =
    getCurrentTime();

  document.getElementById("duration").value = "";

  localStorage.removeItem("locationConfig");

  initializeDatePicker();

}


/* ============================= */
/* READ LOCATION */
/* ============================= */

function readStoredLocation(){

  const saved =
    localStorage.getItem("locationConfig");

  if(!saved) return null;

  try{

    return JSON.parse(saved);

  }
  catch{

    return null;

  }

}


/* ============================= */
/* PRESET LOCATIONS */
/* ============================= */

function setPresetLocation(name){

  const presets = {

    AB5:{
      latitude:13.12521377401022,
      longitude:77.58983194828035,
      radius:50
    },

    AB4:{
      latitude:13.125328708114353,
      longitude:77.59047567844392,
      radius:50
    }

  };

  const loc = presets[name];

  if(!loc) return;

  localStorage.setItem(
    "locationConfig",
    JSON.stringify(loc)
  );

  alert("Location set to " + name);

  updateQRButtonState();

}


/* ============================= */
/* BUTTON STATE */
/* ============================= */

function updateQRButtonState(){

  const eventName =
    document.getElementById("eventName").value;

  const eventDate =
    document.getElementById("eventDate").value;

  const startTime =
    document.getElementById("startTime").value;

  const duration =
    document.getElementById("duration").value;

  const loc =
    readStoredLocation();

  const ready =
    eventName &&
    eventDate &&
    startTime &&
    duration &&
    loc;

  document.getElementById(
    "generateQR"
  ).disabled = !ready;

}


/* ============================= */
/* GENERATE QR */
/* ============================= */

function generateQR(){

  const eventName =
    document.getElementById("eventName").value;

  const eventDate =
    document.getElementById("eventDate").value;

  const startTime =
    document.getElementById("startTime").value;

  const duration =
    document.getElementById("duration").value;

  const loc =
    readStoredLocation();

  if(
    !eventName ||
    !eventDate ||
    !startTime ||
    !duration ||
    !loc
  ){

    alert("Fill event and location");

    return;

  }


  CONFIG.event = {

    name:eventName,
    date:eventDate,
    startTime:startTime,
    durationMinutes:
      parseInt(duration)

  };


  const url =

    `${window.location.origin}` +
    `/MeetingQR/attendee/index.html` +

    `?event=${encodeURIComponent(eventName)}` +
    `&lat=${loc.latitude}` +
    `&lng=${loc.longitude}` +
    `&radius=${loc.radius}`;


  document.getElementById("qrImage").src =

    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=300x300&data=" +
    encodeURIComponent(url);


  document.getElementById(
    "qrSection"
  ).style.display = "block";

}


/* ============================= */
/* DOWNLOAD QR */
/* ============================= */

function downloadQR(){

  const img =
    document.getElementById("qrImage");

  const link =
    document.createElement("a");

  link.href = img.src;

  link.download =

    CONFIG.event.name + "-QR.png";

  link.click();

}


/* ============================= */
/* DOWNLOAD CSV FROM FIREBASE */
/* ============================= */

async function downloadCSV(){

  const snapshot =
    await getDocs(
      collection(db,"attendance")
    );

  let csv =
    "Timestamp,Event,Name,Email,FacultyID,Department,Latitude,Longitude\n";


  snapshot.forEach(doc=>{

    const d = doc.data();

    csv +=

      `${d.timestamp},` +
      `${d.eventName},` +
      `${d.name},` +
      `${d.email},` +
      `${d.facultyId},` +
      `${d.department},` +
      `${d.latitude},` +
      `${d.longitude}\n`;

  });


  const blob =
    new Blob([csv]);

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    "attendance.csv";

  link.click();

}


/* ============================= */
/* INIT */
/* ============================= */

document.addEventListener(

  "DOMContentLoaded",

  ()=>{

    loadEventState();

    updateQRButtonState();

  }

);
