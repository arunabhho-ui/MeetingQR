import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../firebase.js";


/* ============================= */
/* CURRENT TIME */
/* ============================= */

function getCurrentTime(){

  const now = new Date();

  return now.toTimeString().slice(0,5);

}


/* ============================= */
/* DATE PICKER */
/* ============================= */

function initializeDatePicker(){

  if(typeof flatpickr === "undefined"){

    console.error("Flatpickr not loaded");

    return;

  }

  flatpickr("#eventDate", {

    enableTime:false,

    dateFormat:"Y-m-d",

    minDate:"today",

    defaultDate:"today"

  });

}


/* ============================= */
/* TIME PICKER */
/* ============================= */

function initializeTimePicker(){

  const input = document.getElementById("startTime");

  input.type = "time";

}


/* ============================= */
/* LOAD EVENT STATE */
/* ============================= */

function loadEventState(){

  document.getElementById("eventName").value="";

  document.getElementById("eventDate").value="";

  document.getElementById("startTime").value="";

  document.getElementById("duration").value="";

  localStorage.removeItem("locationConfig");

}


/* ============================= */
/* READ LOCATION */
/* ============================= */

function readStoredLocation(){

  const saved = localStorage.getItem("locationConfig");

  if(!saved) return null;

  try{

    return JSON.parse(saved);

  }
  catch{

    return null;

  }

}


/* ============================= */
/* PRESET LOCATION */
/* ============================= */

window.setPresetLocation = function(name){

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

};


/* ============================= */
/* BUTTON STATE */
/* ============================= */

function updateQRButtonState(){

  const ready =

    document.getElementById("eventName").value &&
    document.getElementById("eventDate").value &&
    document.getElementById("startTime").value &&
    document.getElementById("duration").value &&
    readStoredLocation();

  document.getElementById("generateQR").disabled = !ready;

}


/* ============================= */
/* GENERATE QR */
/* ============================= */

window.generateQR = function(){

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

  if(!eventName || !eventDate || !startTime || !duration || !loc){

    alert("Fill event and location");

    return;

  }

  const url =

    `${window.location.origin}/MeetingQR/attendee/index.html` +

    `?event=${encodeURIComponent(eventName)}` +

    `&lat=${loc.latitude}` +

    `&lng=${loc.longitude}` +

    `&radius=${loc.radius}`;


  document.getElementById("qrImage").src =

    "https://api.qrserver.com/v1/create-qr-code/"

    + "?size=300x300&data="

    + encodeURIComponent(url);


  document.getElementById("qrSection").style.display="block";

};


/* ============================= */
/* DOWNLOAD QR */
/* ============================= */

window.downloadQR = function(){

  const img =
    document.getElementById("qrImage");

  const link =
    document.createElement("a");

  link.href = img.src;

  link.download = "eventQR.png";

  link.click();

};


/* ============================= */
/* DOWNLOAD CSV */
/* ============================= */

window.downloadCSV = async function(){

  const snapshot =
    await getDocs(collection(db,"attendance"));

  let csv =
    "Timestamp,Event,Name,Email,FacultyID,Department,Latitude,Longitude\n";

  snapshot.forEach(doc=>{

    const d = doc.data();

    csv +=

      `${d.timestamp},`+
      `${d.eventName},`+
      `${d.name},`+
      `${d.email},`+
      `${d.facultyId},`+
      `${d.department},`+
      `${d.latitude},`+
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

};


/* ============================= */
/* INIT */
/* ============================= */

document.addEventListener(

  "DOMContentLoaded",

  ()=>{

    loadEventState();

    document.getElementById("startTime").value =
      getCurrentTime();

    document.getElementById("qrSection").style.display="none";

    initializeDatePicker();

    initializeTimePicker();

    document.getElementById("eventName")
      .addEventListener("input",updateQRButtonState);

    document.getElementById("eventDate")
      .addEventListener("change",updateQRButtonState);

    document.getElementById("startTime")
      .addEventListener("input",updateQRButtonState);

    document.getElementById("duration")
      .addEventListener("input",updateQRButtonState);

    updateQRButtonState();

  }

);
