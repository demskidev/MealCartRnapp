import { useAuth } from "@/context/AuthContext";
import AppNavigator from "@/navigation/app_navigator";
import AuthNavigator from "@/navigation/auth_navigator";

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;


