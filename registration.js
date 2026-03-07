import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi_IwTYTpTGZW4IOLdP_7_M8Il0bwScUU",
  authDomain: "touch-8fd12.firebaseapp.com",
  projectId: "touch-8fd12",
  storageBucket: "touch-8fd12.appspot.com",
  messagingSenderId: "912867048557",
  appId: "1:912867048557:web:51499df054754298dd5364",
  measurementId: "G-2T4DF6PLQX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UNIQUE_USER_ID = "12319278";
window.UNIQUE_USER_ID = UNIQUE_USER_ID;