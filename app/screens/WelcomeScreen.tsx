import { CreateAccount, ForwardIcon, SplashIcon } from "@/assets/svg";
import BaseButton from "@/components/BaseButton";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { moderateScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize, scaleFontSize } from "@/utils/fonts";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  // Navigation helper using expo-router
  const navigate = (screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]) => {
    router.push(screen as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Splash image/logo */}
      <SplashIcon width={moderateScale(145)} height={moderateScale(196)} />

      {/* Middle section with title and description */}
      <View style={styles.middleContainer}>
        <Text style={[styles.title, styles.text]}>{Strings.mealCart}</Text>
        <Text style={[styles.description, styles.text]}>
          {Strings.description}
        </Text>
      </View>

      {/* Bottom section with action buttons */}
      <View style={styles.bottomContainer}>
        {/* Button to create a new account */}
        <BaseButton
          title={Strings.createAccount}
          gradientButton={true}
          rightChild={<CreateAccount />} // Icon on the right
          textColor={Colors.white}
          onPress={() => navigate(APP_ROUTES.SIGNUP)} // Navigate to signup screen
        />

        {/* Button to log in */}
        <BaseButton
          title={Strings.logIn}
          rightChild={<ForwardIcon />} // Icon on the right
          backgroundColor={Colors.buttonBackground}
          onPress={() => navigate(APP_ROUTES.SIGNIN)} // Navigate to signin screen
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: moderateScale(35),
    padding: moderateScale(20),
  },

  title: {
    color: Colors.primary,
    fontFamily:FontFamilies.ROBOTO_BLACK,
    fontSize: fontSize(35),
  },
  description: {
    color: Colors.tertiary,
    lineHeight: moderateScale(20),
    fontFamily:FontFamilies.ROBOTO_REGULAR,
    fontSize: fontSize(14),
  },

  middleContainer: {
    gap: moderateScale(12),
  },
  text: {
    textAlign: "center",
  },

  bottomContainer: {
    width: "100%",
    gap: moderateScale(10),
  },
});

export default WelcomeScreen;
