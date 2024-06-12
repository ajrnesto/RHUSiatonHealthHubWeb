// imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

export const app = initializeApp({
  apiKey: "AIzaSyCTa_md7FJPXv4QArAXkxTjivPj5fwVMII",
  authDomain: "healthhub-siaton.firebaseapp.com",
  projectId: "healthhub-siaton",
  storageBucket: "healthhub-siaton.appspot.com",
  messagingSenderId: "862008777831",
  appId: "1:862008777831:web:cf22aaa48a9b48794f88c2",
  measurementId: "G-63FW62WRP6"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);