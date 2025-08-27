// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Zn5pDzPM5ylSUeYdgrRVAKzh6hwO0EU",
  authDomain: "testproject-chat-d65ab.firebaseapp.com",
  projectId: "testproject-chat-d65ab",
  storageBucket: "testproject-chat-d65ab.firebasestorage.app",
  messagingSenderId: "204481768258",
  appId: "1:204481768258:web:3ea8b0914e1bca2547f6db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize the Google Auth provider
export const googleProvider = new GoogleAuthProvider();