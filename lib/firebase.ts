// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwS2KNGOWqBgUjklCvLR6UumJ_fXbQu2g",
  authDomain: "beiizetu-stream.firebaseapp.com",
  projectId: "beiizetu-stream",
  storageBucket: "beiizetu-stream.firebasestorage.app",
  messagingSenderId: "894861078769",
  appId: "1:894861078769:web:796cd30a9162a4f9187950",
  measurementId: "G-STF3MX8TGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase Analytics is not supported in this environment:', error);
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
export { analytics };