import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNMpnH45HRnqv5tqR-S-7eJjWpReTPGCg",
  authDomain: "meetingqr-e4807.firebaseapp.com",
  projectId: "meetingqr-e4807",
  storageBucket: "meetingqr-e4807.firebasestorage.app",
  messagingSenderId: "107400922668",
  appId: "1:107400922668:web:971967d0773627a202b389"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getAllAttendance(){

  try{

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
        deviceId: data.deviceId || "",
        timestamp,
        eventName: data.eventName || "",
        name: data.name || "",
        email: data.email || "",
        facultyId: data.facultyId || "",
        department: data.department || ""
      });

    });

    return records;

  }
  catch(err){

    console.error("Firebase read error:", err);
    return [];

  }

}
