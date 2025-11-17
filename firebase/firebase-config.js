// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js';

// Import Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = 
{
  apiKey: "AIzaSyA-KX6voyDgy_gUcNFCGBIwGJDIzlNbq7A",
  authDomain: "halwa-heritage.firebaseapp.com",
  projectId: "halwa-heritage",
  storageBucket: "halwa-heritage.firebasestorage.app",
  messagingSenderId: "516107640000",
  appId: "1:516107640000:web:a5035e5cf6fe90e6082125",
  measurementId: "G-K8YWZWL1G0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Export app
export { app };