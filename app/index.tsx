import { APP_ROUTES } from "@/constants/AppRoutes";
import { useAppSelector } from "@/reduxStore/hooks";
import { replaceNavigation } from "@/utils/Navigation";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";

export default function IndexScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // This is the first route of the root stack, so a mishandled history reset can
  // land a signed-in user back here — where the render below would show nothing
  // at all and look like a logout. `useFocusEffect` (not `useEffect`) so it
  // recovers every time the route is focused, not just on mount.
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        replaceNavigation(APP_ROUTES.HOME);
      }
    }, [isAuthenticated]),
  );

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return null;
}
