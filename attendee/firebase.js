import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

  apiKey:"AIzaSyDNMpnH45HRnqv5tqR-S-7eJjWpReTPGCg",

  authDomain:"meetingqr-e4807.firebaseapp.com",

  projectId:"meetingqr-e4807"

};


const app =
  initializeApp(firebaseConfig);


window.db =
  getFirestore(app);


window.saveAttendanceFirebase =
  async data =>

    await addDoc(
      collection(db,"attendance"),
      data
    );
