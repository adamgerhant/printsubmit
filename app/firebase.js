// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjKzgSaNl5FSDSsTpPiVbCVW9JSciikow",
  authDomain: "print-submit.firebaseapp.com",
  projectId: "print-submit",
  storageBucket: "print-submit.appspot.com",
  messagingSenderId: "240473695577",
  appId: "1:240473695577:web:e64c91c6714e54bd2a1848",
  measurementId: "G-367MFEJ3RH"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
export default auth;
export const storage = getStorage();
export const db = getFirestore(app);