

import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TourGuideProvider } from 'rn-tourguide';

import TourTooltip from "@/components/TourTooltip";
import { moderateScale } from "@/constants/Constants";
import { AuthContextProvider } from "@/context/AuthContext";
import { FontProvider } from "@/context/FontContext";
import { LoaderProvider } from "@/context/LoaderContext";
import { TourStepProvider } from '@/context/TourStepContext';
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LoaderProvider>
        <TourStepProvider>
          <TourGuideProvider
            tooltipComponent={TourTooltip}
            androidStatusBarVisible={true}
            backdropColor="rgba(0,0,0,0.7)"
            borderRadius={16}
          >
            <FontProvider>
              <AuthContextProvider>
                <Provider store={store}>
                <RootNavigator />
                </Provider>
                <Toast
                  config={toastConfig}
                  topOffset={moderateScale(200)}
                />
              </AuthContextProvider>
            </FontProvider>
          </TourGuideProvider>
        </TourStepProvider>
      </LoaderProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;



