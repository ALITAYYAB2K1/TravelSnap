// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBBwtBnpYYaLeiGEW-IgYfyM8VjGygxNqY",
  authDomain: "travelsnap-f7f72.firebaseapp.com",
  projectId: "travelsnap-f7f72",
  storageBucket: "travelsnap-f7f72.firebasestorage.app",
  messagingSenderId: "160253976930",
  appId: "1:160253976930:web:a12e07c9c398e9586e4c3b",
  measurementId: "G-SB0BP7Z620",
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);
