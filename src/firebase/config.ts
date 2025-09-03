import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDXG4vrEosSJ7PBKEro7axBpFbt9JPNHbQ",
  authDomain: "thestreamerz.firebaseapp.com",
  projectId: "thestreamerz",
  storageBucket: "thestreamerz.firebasestorage.app",
  messagingSenderId: "548105710761",
  appId: "1:548105710761:web:ff3d4b592aaeb59f340db8",
  measurementId: "G-FNST998B6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
