import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu4dhV0PFYJwyvzbI3tzpeRpCB4UZaIuY",
  authDomain: "diledin-7c438.firebaseapp.com",
  projectId: "diledin-7c438",
  storageBucket: "diledin-7c438.firebasestorage.app",
  messagingSenderId: "60185863350",
  appId: "1:60185863350:web:1e5b0da2fe45fe5161b217",
  measurementId: "G-SKYN08XM29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
