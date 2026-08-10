import AppNavigator from "@/navigation/AppNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { useAppSelector } from "@/reduxStore/hooks";
import { auth } from "@/services/firebase";
import { waitForAuthInitialized } from "@/services/waitForAuth";
import { performLogout } from "@/utils/auth";
import { useEffect } from "react";

const RootNavigator = () => {
  const { isAuthenticated, isGuest } = useAppSelector((state) => state.auth);

  // A guest session can die out from under us: Firebase's "Auto clean-up"
  // deletes anonymous accounts older than 30 days, and the token can also be
  // revoked. Redux is persisted, so the app would still boot straight into
  // AppNavigator and then fail every Firestore read with permission-denied —
  // empty screens and no way back to the welcome screen.
  //
  // Only guests need this: a registered user can always sign in again.
  useEffect(() => {
    if (!isAuthenticated || !isGuest) return;

    let cancelled = false;

    (async () => {
      await waitForAuthInitialized();
      if (cancelled) return;

      const current = auth.currentUser;
      if (!current) {
        await performLogout(APP_ROUTES.WelcomeScreen);
        return;
      }

      try {
        // Force a refresh so this is a real server check, not a cached token.
        await current.getIdToken(true);
      } catch {
        if (!cancelled) await performLogout(APP_ROUTES.WelcomeScreen);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isGuest]);

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
