import { useAuth } from "@/context/AuthContext";
import AppNavigator from "@/navigation/AppNavigator";
import AuthNavigator from "@/navigation/AuthNavigator";
import { useAppSelector } from "@/reduxStore/hooks";

const RootNavigator = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
