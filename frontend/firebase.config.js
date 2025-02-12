// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import * as Analytics from "expo-firebase-analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWb7seutdIpO66FoIASiugrkdYb0EEpU0",
  authDomain: "soen390-c556e.firebaseapp.com",
  projectId: "soen390-c556e",
  storageBucket: "soen390-c556e.firebasestorage.app",
  messagingSenderId: "775084324384",
  appId: "1:775084324384:web:722a31db2dac62fdd7ee45",
  measurementId: "G-HWSTP3FLRS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app, Analytics };