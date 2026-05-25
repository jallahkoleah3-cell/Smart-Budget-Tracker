import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNc1YtPBvGUH61kFEkJRcdtleYHyzAfUc",
  authDomain: "smart-budget-tracker-a57c2.firebaseapp.com",
  databaseURL: "https://smart-budget-tracker-a57c2-default-rtdb.firebaseio.com",
  projectId: "smart-budget-tracker-a57c2",
  storageBucket: "smart-budget-tracker-a57c2.firebasestorage.app",
  messagingSenderId: "630482213093",
  appId: "1:630482213093:web:4c07c50bacea7837b85c0c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);