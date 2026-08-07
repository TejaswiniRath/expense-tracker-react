import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzE265sUAqwGyRlMill18MDrcpkuhAqLQ",
  authDomain: "expense-tracker-ai-c3f8d.firebaseapp.com",
  projectId: "expense-tracker-ai-c3f8d",
  storageBucket: "expense-tracker-ai-c3f8d.firebasestorage.app",
  messagingSenderId: "752865115103",
  appId: "1:752865115103:web:91a4b290881c5c8e0b626a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);