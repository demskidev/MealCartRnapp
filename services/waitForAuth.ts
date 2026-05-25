import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export const waitForAuthReady = (): Promise<void> => {
  if (auth.currentUser) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
      }
    });
  });
};

export const waitForAuthInitialized = (timeoutMs = 4000): Promise<void> => {
  if (auth.currentUser) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve();
      }
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      }
    });
  });
};
