// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLZWE9ymi59sVFU-gz8_Pny7aonabqjCU",
  authDomain: "ajo-savings-tracker.firebaseapp.com",
  projectId: "ajo-savings-tracker",
  storageBucket: "ajo-savings-tracker.firebasestorage.app",
  messagingSenderId: "357252979003",
  appId: "1:357252979003:web:c8b67ae97668fa6858bf1e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);