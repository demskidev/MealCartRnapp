import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLGQsd7Kr3nA1DwOkzZZI941azqXp7OLg",
  authDomain: "mealcart-5d62b.firebaseapp.com",
  projectId: "mealcart-5d62b",
  storageBucket: "mealcart-5d62b.firebasestorage.app",
  messagingSenderId: "107165390600",
  appId: "1:107165390600:web:160beded7536e8c905febd",
  measurementId: "G-66Z0ZR7B5M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
export const db = getFirestore(app);
// Export auth to use in signup/login screens
export { auth };
