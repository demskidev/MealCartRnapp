import { AuthContextProvider } from "@/context/AuthContext";
import RootNavigator from "@/navigation/root_navigator";
import Toast from "react-native-toast-message";

const RootLayout = () => {
  return (
    <AuthContextProvider>
      <RootNavigator />
      <Toast />
    </AuthContextProvider>
  );
};

export default RootLayout;