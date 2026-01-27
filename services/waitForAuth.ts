import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export const waitForAuthReady = (): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
      }
    });
  });
};
