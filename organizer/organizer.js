import { CONFIG } from "../config.js";

/* ---------- BASIC HELPERS ---------- */

function getCurrentTime() {

  const now = new Date();

  return now.toTimeString().slice(0,5);

}

function loadEventState(){

  document.getElementById("eventName").value="";
  document.getElementById("eventDate").value="";
  document.getElementById("startTime").value="";
  document.getElementById("duration").value="";

  localStorage.removeItem("locationConfig");

}

function updateLocationFromStorage(){

  const saved = localStorage.getItem("locationConfig");

  if(saved){

    CONFIG.location = JSON.parse(saved);

  }

}

function readStoredLocation(){

  const saved = localStorage.getItem("locationConfig");

  return saved ? JSON.parse(saved) : null;

}

/* ---------- EVENT SAVE ---------- */

function saveEvent(){

  const name =
    document.getElementById("eventName").value.trim();

  const date =
    document.getElementById("eventDate").value;

  const time =
    document.getElementById("startTime").value;

  const duration =
    document.getElementById("duration").value;

  if(!name || !date || !time || !duration){

    alert("Fill all event details");

    return;

  }

  CONFIG.event = {

    name,
    date,
    startTime: time,
    durationMinutes: parseInt(duration)

  };

  alert("Event saved");

}

/* ---------- LOCATION ---------- */

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

  localStorage.setItem("locationConfig",JSON.stringify(loc));

  CONFIG.location = loc;

  document.getElementById("presetSelected").innerText =
    name + " selected";

}

/* ---------- QR GENERATE ---------- */

async function generateQR(){

  await fetch(CONFIG.mailerScriptURL,{
    method:"POST",
    body:new URLSearchParams({action:"clearAttendance"})
  });

  const name =
    document.getElementById("eventName").value.trim();

  const date =
    document.getElementById("eventDate").value;

  const time =
    document.getElementById("startTime").value;

  const duration =
    document.getElementById("duration").value;

  const loc = readStoredLocation();

  if(!name || !date || !time || !duration || !loc){

    alert("Complete event + location");

    return;

  }

  CONFIG.event={
    name,date,startTime:time,durationMinutes:parseInt(duration)
  };

  CONFIG.location=loc;

  const url =
    window.location.origin +
    "/MeetingQR/attendee/index.html"+
    `?event=${encodeURIComponent(name)}`+
    `&lat=${loc.latitude}`+
    `&lng=${loc.longitude}`+
    `&radius=${loc.radius}`;

  document.getElementById("qrImage").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="+
    encodeURIComponent(url);

  document.getElementById("qrSection").style.display="block";

  document.getElementById("eventTitle").innerText=name;

  scheduleDirectorEmail();

}

/* ---------- DOWNLOAD QR ---------- */

function downloadQR(){

  const img =
    document.getElementById("qrImage");

  if(!img.src){

    alert("Generate QR first");

    return;

  }

  const link=document.createElement("a");

  link.href=img.src;

  link.download =
    CONFIG.event.name.replace(/\s+/g,"_")+"_QR.png";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

}

/* ---------- DOWNLOAD CSV (FIXED FOREVER) ---------- */

async function downloadCSV(){

  const { getAllAttendance } =
    await import("../firebase.js");

  const records =
    await getAllAttendance();

  if(!records.length){

    alert("No records");

    return;

  }

  let csv =
    "Timestamp,Event,Name,Email,FacultyID,Department,Latitude,Longitude\n";

  records.forEach(r=>{

    csv+=
      `${r.timestamp||""},`+
      `${r.eventName||""},`+
      `${r.name||""},`+
      `${r.email||""},`+
      `${r.facultyId||""},`+
      `${r.department||""},`+
      `${r.latitude||""},`+
      `${r.longitude||""}\n`;

  });

  const filename =
    CONFIG.event.name.replace(/\s+/g,"_")+"_Attendance.csv";

  const link=document.createElement("a");

  link.href=
    "data:text/csv;charset=utf-8,"+
    encodeURIComponent(csv);

  link.download=filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

}

/* ---------- EMAIL ---------- */

async function sendCSVToEmail(){

  const email=
    document.getElementById("directorEmail").value;

  await fetch(CONFIG.mailerScriptURL,{

    method:"POST",

    body:new URLSearchParams({

      action:"sendAttendanceEmail",
      email

    })

  });

  alert("Email sent");

}

/* ---------- EMAIL SCHEDULER ---------- */

function scheduleDirectorEmail(){

  const event=CONFIG.event;

  const end =
    new Date(`${event.date}T${event.startTime}`);

  end.setMinutes(
    end.getMinutes()+event.durationMinutes
  );

  const delay =
    end.getTime()-Date.now();

  if(delay<=0) return;

  setTimeout(sendDirectorEmailNow,delay);

}

async function sendDirectorEmailNow(){

  await fetch(CONFIG.mailerScriptURL,{

    method:"POST",

    body:new URLSearchParams({

      action:"sendDirectorEmail"

    })

  });

}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded",()=>{

  loadEventState();

  updateLocationFromStorage();

  document.getElementById("startTime").value =
    getCurrentTime();

});

/* ---------- EXPORT GLOBAL ---------- */

window.saveEvent=saveEvent;
window.setPresetLocation=setPresetLocation;
window.generateQR=generateQR;
window.downloadQR=downloadQR;
window.downloadCSV=downloadCSV;
window.sendCSVToEmail=sendCSVToEmail;
