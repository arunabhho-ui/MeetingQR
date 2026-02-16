/* ============================= */
/* FIREBASE IMPORTS */
/* ============================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ============================= */
/* FIREBASE CONFIG */
/* ============================= */

const firebaseConfig = {

  apiKey: "AIzaSyDNMpnH45HRnqv5tqR-S-7eJjWpReTPGCg",

  authDomain: "meetingqr-e4807.firebaseapp.com",

  projectId: "meetingqr-e4807",

  storageBucket: "meetingqr-e4807.firebasestorage.app",

  messagingSenderId: "107400922668",

  appId: "1:107400922668:web:971967d0773627a202b389",

  measurementId: "G-LY8XGJXNY3"

};


/* ============================= */
/* INITIALIZE FIREBASE */
/* ============================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* ============================= */
/* SAVE ATTENDANCE */
/* ============================= */

export async function saveAttendanceFirebase(data){

  try{

    await addDoc(
      collection(db,"attendance"),
      {
        eventName: data.eventName,
        name: data.name,
        email: data.email,
        facultyId: data.facultyId,
        department: data.department,
        latitude: data.latitude,
        longitude: data.longitude,
        deviceId: data.deviceId,
        timestamp: serverTimestamp()
      }
    );

    console.log("Attendance saved");

  }
  catch(err){

    console.error("Firebase save error:", err);
    throw err;

  }

}



/* ============================= */
/* DOWNLOAD CSV SUPPORT */
/* ============================= */

export async function getAllAttendance(){

  const snapshot =
    await getDocs(collection(db,"attendance"));

  const records = [];

  snapshot.forEach(doc=>{

    const data = doc.data();

    let timestamp = "";

    if(data.timestamp?.seconds){

      timestamp =
        new Date(data.timestamp.seconds * 1000)
        .toISOString();

    }

    records.push({

      timestamp,
      eventName: data.eventName || "",
      name: data.name || "",
      email: data.email || "",
      facultyId: data.facultyId || "",
      department: data.department || "",
      latitude: data.latitude || "",
      longitude: data.longitude || ""

    });

  });

  return records;

}
