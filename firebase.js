import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVkxgCpkm-yBw1XSphCwUUaL5sk5gEa8s",
    authDomain: "controle-de-atestados-toex.firebaseapp.com",
    projectId: "controle-de-atestados-toex",
    storageBucket: "controle-de-atestados-toex.firebasestorage.app",
    messagingSenderId: "79863751982",
    appId: "1:79863751982:web:bb213729c36c6dd43046bf"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };