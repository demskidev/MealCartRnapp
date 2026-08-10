/**
 * Listen for Firebase Auth state changes
 * @param callback - Function to call with the user object or null
 * @returns Unsubscribe function
 */

// import { persistor, store } from "@/store/persistor";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { LOGOUT } from "@/reduxStore/actionTypes";
import { persistor, store } from "@/reduxStore/store";
import { auth } from "@/services/firebase";
import { revokeAccess as googleSignOut } from "@/services/googleSignIn";
import { router } from "expo-router";
import { replaceNavigation } from "./Navigation";

// Redux action to clear all state
const logoutAction = () => ({ type: LOGOUT });

/**
 * Common logout utility function
 * Clears Redux state, purges persistor, and navigates to signin screen
 * @param dispatch - Redux dispatch function
 * @param onSuccess - Optional callback to execute after successful logout
 */
export const performLogout = async (
  // Where to land afterwards. Sign In is right for a normal logout, but a guest
  // exiting needs the welcome screen — it is the only place that offers
  // "Continue as Guest", so Sign In would strand them with no way back in
  // without reinstalling.
  destination: (typeof APP_ROUTES)[keyof typeof APP_ROUTES] = APP_ROUTES.SIGNIN,
) => {
  try {
    // Clear Redux state
    // const { persistor, store } = await import("@/reduxStore/store");
    try {
      await googleSignOut();
    } catch (googleError) {
      // If not signed in with Google, sign out from Firebase directly
      await auth.signOut();
    }
    store.dispatch(logoutAction());
    await persistor.purge();

    // await new Promise((resolve) => setTimeout(resolve, 200));

    // Navigate to signin screen
    router.dismissAll();
    replaceNavigation(destination);

    //  }
  } catch (error) {
    // Still try to navigate to signin even if purge fails
    replaceNavigation(destination);
  }
};

export { logoutAction };
