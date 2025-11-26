import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can also use environment variables: import.meta.env.VITE_FIREBASE_API_KEY, etc.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enable authentication persistence (CRITICAL for staying logged in)
import { setPersistence, browserLocalPersistence } from "firebase/auth";
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Failed to set auth persistence:", error);
});

// Expose Firebase to window for debugging
if (typeof window !== 'undefined') {
    window.firebase = { auth: () => auth };
}
