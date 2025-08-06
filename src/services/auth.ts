import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIwFCQX0uIa6xYBd9nrvQ8D4x2ck4iqCg",
  authDomain: "the-streamerz.firebaseapp.com",
  projectId: "the-streamerz",
  storageBucket: "the-streamerz.firebasestorage.app",
  messagingSenderId: "11710633368",
  appId: "1:11710633368:web:14d84057f3013b8991c7ed",
  measurementId: "G-NCMYGLQ8VP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if this is a new user and create profile
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        // Update last login time
        await setDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (firestoreError) {
      console.warn('Firestore operation failed, but auth succeeded:', firestoreError);
      // Don't throw error here as auth was successful
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Create user profile in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: null,
        provider: 'email',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } catch (firestoreError) {
      console.warn('Firestore operation failed, but auth succeeded:', firestoreError);
      // Don't throw error here as auth was successful
    }
    
    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update last login time
    try {
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    } catch (firestoreError) {
      console.warn('Firestore operation failed, but auth succeeded:', firestoreError);
      // Don't throw error here as auth was successful
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};