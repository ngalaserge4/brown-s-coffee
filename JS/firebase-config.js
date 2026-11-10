
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCbYP9iDFXjc786FnCGNawYRDQ8ORCnVI",
  authDomain: "brown-coffee-c603b.firebaseapp.com",
  projectId: "brown-coffee-c603b",
  storageBucket: "brown-coffee-c603b.firebasestorage.app",
  messagingSenderId: "695557198063",
  appId: "1:695557198063:web:153f7a2e881e9c43f28b1a",
  measurementId: "G-M5F58X1JTZ",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);

export { app, auth, database };