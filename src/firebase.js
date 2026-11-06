// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcwYa6ndSZpHgsZC00myDYuUW0FJyZdsw",
  authDomain: "ai-battle-arena-679e0.firebaseapp.com",
  projectId: "ai-battle-arena-679e0",
  storageBucket: "ai-battle-arena-679e0.firebasestorage.app",
  messagingSenderId: "411023054333",
  appId: "1:411023054333:web:3f19b311e2b723c43fb594",
  measurementId: "G-WDHJE11PJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, analytics, auth, db };
