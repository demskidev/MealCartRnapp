

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TourGuideProvider } from 'rn-tourguide';

import TourTooltip from "@/components/TourTooltip";
import { moderateScale } from "@/constants/Constants";
import { AuthContextProvider } from "@/context/AuthContext";
import { FontProvider } from "@/context/FontContext";
import { LoaderProvider } from "@/context/LoaderContext";
import RootNavigator from "@/navigation/RootNavigator";
import { toastConfig } from "@/utils/ToastConfig";
import { useRouter, useSegments } from 'expo-router';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { store } from '../reduxStore/store';

const RootLayout = () => {
  const router = useRouter();
const segments = useSegments();


  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LoaderProvider>
          <TourGuideProvider
            tooltipComponent={TourTooltip}
            androidStatusBarVisible={true}
            backdropColor="rgba(0,0,0,0.7)"
            borderRadius={16}
          >
            <FontProvider>
              <AuthContextProvider>
                <RootNavigator />
                <Toast
                  config={toastConfig}
                  topOffset={moderateScale(200)}
                />
              </AuthContextProvider>
            </FontProvider>
          </TourGuideProvider>
        </LoaderProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default RootLayout;



