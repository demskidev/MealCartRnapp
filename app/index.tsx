import { APP_ROUTES } from "@/constants/AppRoutes";
import { useAppSelector } from "@/reduxStore/hooks";
import { replaceNavigation } from "@/utils/Navigation";
import { useEffect } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";

export default function IndexScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Wait for tour check to complete before navigating
    if (isAuthenticated) {
      replaceNavigation(APP_ROUTES.HOME as any);
    }
  }, [isAuthenticated]); // Add dependencies

  // Show loader while checking tour status

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return null;
}
