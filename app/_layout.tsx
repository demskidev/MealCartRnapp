// import { moderateScale } from "@/constants/Constants";
// import { AuthContextProvider } from "@/context/AuthContext";
// import { FontProvider } from "@/context/FontContext";
// import RootNavigator from "@/navigation/RootNavigator";
// import { toastConfig } from "@/utils/ToastConfig";
// import Toast from "react-native-toast-message";

// const RootLayout = () => {
//   return (
//     <FontProvider>
//       <AuthContextProvider>
//         <RootNavigator />
//         <Toast config={toastConfig} topOffset={moderateScale(200)} />
//       </AuthContextProvider>
//     </FontProvider>
//   );
// };

// export default RootLayout;
// import 'react-native-gesture-handler';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// import { moderateScale } from "@/constants/Constants";
// import { AuthContextProvider } from "@/context/AuthContext";
// import { FontProvider } from "@/context/FontContext";
// import RootNavigator from "@/navigation/RootNavigator";
// import { toastConfig } from "@/utils/ToastConfig";
// import Toast from "react-native-toast-message";

// const RootLayout = () => {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <FontProvider>
//         <AuthContextProvider>
//           <RootNavigator />
//           <Toast config={toastConfig} topOffset={moderateScale(200)} />
//         </AuthContextProvider>
//       </FontProvider>
//     </GestureHandlerRootView>
//   );
// };

// export default RootLayout;




import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TourGuideProvider } from 'rn-tourguide';

import TourTooltip from "@/components/TourTooltip"; // 👈 your custom tooltip
import { moderateScale } from "@/constants/Constants";
import { AuthContextProvider } from "@/context/AuthContext";
import { FontProvider } from "@/context/FontContext";
import RootNavigator from "@/navigation/RootNavigator";
import { toastConfig } from "@/utils/ToastConfig";
import Toast from "react-native-toast-message";

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  )
}

export default RootLayout

