/**
 * Listen for Firebase Auth state changes
 * @param callback - Function to call with the user object or null
 * @returns Unsubscribe function
 */


// import { persistor, store } from "@/store/persistor";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { LOGOUT } from "@/reduxStore/actionTypes";
import { persistor, store } from '@/reduxStore/store';
import { auth } from "@/services/firebase";
import { router } from "expo-router";

// Redux action to clear all state
const logoutAction = () => ({ type: LOGOUT });

/**
 * Common logout utility function
 * Clears Redux state, purges persistor, and navigates to signin screen
 * @param dispatch - Redux dispatch function
 * @param onSuccess - Optional callback to execute after successful logout
 */
export const performLogout = async () => {
  try {
    // Clear Redux state
    // const { persistor, store } = await import("@/reduxStore/store");
    await auth.signOut();
    store.dispatch(logoutAction());

    // Clear persisted storage
    await persistor.purge();

    // Navigate to signin screen
    router.dismissAll();
    router.replace(APP_ROUTES.SIGNIN as any);

  
  //  }
  } catch (error) {
    console.error("Logout error:", error);
    // Still try to navigate to signin even if purge fails
    router.replace(APP_ROUTES.SIGNIN as any);
  }
};

export { logoutAction };
