import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

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

// Persist Firebase Auth across cold app launches so server-backed flows like
// Kroger status checks can rely on auth.currentUser after restart.
let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

const functions = getFunctions(app, "us-central1");

// Initialize Firebase Storage
const storage = getStorage(app);

export const db = getFirestore(app);
export { auth, functions, storage };
