import { useAuth } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;


