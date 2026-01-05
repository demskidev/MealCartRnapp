import { APP_ROUTES } from "@/constants/AppRoutes";
import { useAppSelector } from "@/reduxStore/hooks";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";

export default function IndexScreen() {
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace(APP_ROUTES.HOME as any);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <WelcomeScreen />;
    }
    // Optionally show a loading spinner while redirecting
    return null;
}