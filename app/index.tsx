import { APP_ROUTES } from "@/constants/AppRoutes";
import { useAppSelector } from "@/reduxStore/hooks";
import { replaceNavigation } from "@/utils/Navigation";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";

export default function IndexScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      replaceNavigation(APP_ROUTES.HOME as any);
    }
  }, []); 

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return null;
}
