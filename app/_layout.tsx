import Loader from "@/components/Loader";
import TourTooltip from "@/components/TourTooltip";
import { moderateScale } from "@/constants/Constants";
import { FontProvider } from "@/context/FontContext";
import { TourStepProvider } from "@/context/TourStepContext";
import RootNavigator from "@/navigation/RootNavigator";
import { toastConfig } from "@/utils/ToastConfig";
import { useRouter, useSegments } from "expo-router";
import { Platform, StatusBar } from "react-native";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { TourGuideProvider } from "rn-tourguide";
import { store } from "../reduxStore/store";

const RootLayout = () => {
  const router = useRouter();
  const segments = useSegments();
  const keyboardProviderProps =
    Platform.OS === "android"
      ? {
          statusBarTranslucent: true,
          navigationBarTranslucent: true,
          preserveEdgeToEdge: true,
        }
      : {};

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <TourStepProvider>
          <TourGuideProvider
            tooltipComponent={TourTooltip}
            androidStatusBarVisible={true}
            backdropColor="rgba(0,0,0,0.7)"
            borderRadius={16}
            preventOutsideInteraction={true}
            animationDuration={400}
          >
            <KeyboardProvider {...keyboardProviderProps}>
              {Platform.OS === "android" && (
                <StatusBar translucent backgroundColor="transparent" />
              )}
              <FontProvider>
                {/* <AuthContextProvider> */}
                <RootNavigator />
                <Toast config={toastConfig} topOffset={moderateScale(200)} />
                <Loader /> {/* </AuthContextProvider> */}
              </FontProvider>
            </KeyboardProvider>
          </TourGuideProvider>
        </TourStepProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
