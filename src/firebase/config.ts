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

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Create fallback exports to prevent crashes
  app = null as any;
  auth = null as any;
  db = null as any;
}

export { app, auth, db };
