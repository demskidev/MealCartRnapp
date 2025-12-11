import { moderateScale } from "@/constants/Constants";
import { AuthContextProvider } from "@/context/AuthContext";
import { FontProvider } from "@/context/FontContext";
import RootNavigator from "@/navigation/RootNavigator";
import { toastConfig } from "@/utils/ToastConfig";
import Toast from "react-native-toast-message";

const RootLayout = () => {
  return (
    <FontProvider>
      <AuthContextProvider>
        <RootNavigator />
        <Toast config={toastConfig} topOffset={moderateScale(200)} />
      </AuthContextProvider>
    </FontProvider>
  );
};

export default RootLayout;