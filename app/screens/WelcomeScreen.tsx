import { CreateAccount, ForwardIcon, SplashIcon } from "@/assets/svg";
import { hideLoader, showLoader } from "@/components/Loader";
import ThemeGradientButton from "@/components/ThemeGradientButton";
import ThemeNormalButton from "@/components/ThemeNormalButton";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { moderateScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useAppDispatch } from "@/reduxStore/hooks";
import { continueAsGuestAsync } from "@/reduxStore/slices/authSlice";
import { fontSize } from "@/utils/Fonts";
import { resetAndNavigate } from "@/utils/Navigation";
import { showErrorToast } from "@/utils/Toast";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WelcomeScreen = () => {
  const dispatch = useAppDispatch();

  const navigate = (screen: (typeof APP_ROUTES)[keyof typeof APP_ROUTES]) => {
    router.push(screen as any);
  };

  // Apple guideline 5.1.1(v): meals, plans and lists aren't account based, so
  // they have to be reachable without registering. This starts an anonymous
  // Firebase session and drops straight into the app.
  const handleContinueAsGuest = async () => {
    showLoader();
    const resultAction = await dispatch(continueAsGuestAsync());
    hideLoader();

    if (continueAsGuestAsync.fulfilled.match(resultAction)) {
      resetAndNavigate(APP_ROUTES.HOME);
    } else {
      showErrorToast((resultAction.payload as string) || Strings.guest_failed);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <SplashIcon width={moderateScale(145)} height={moderateScale(196)} />

      <View style={styles.middleContainer}>
        <Text style={[styles.title, styles.text]}>{Strings.mealCart}</Text>
        <Text style={[styles.description, styles.text]}>
          {Strings.description}
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <ThemeGradientButton
          title={Strings.createAccount}
          rightChild={<CreateAccount />}
          textStyle={{ color: Colors.white }}
          onPress={() => navigate(APP_ROUTES.SIGNUP)}
        />

        <ThemeNormalButton
          title={Strings.logIn}
          rightChild={<ForwardIcon />}
          backgroundColor={Colors.buttonBackground}
          onPress={() => navigate(APP_ROUTES.SIGNIN)}
          textStyle={styles.loginButton}
        />

        <TouchableOpacity
          onPress={handleContinueAsGuest}
          hitSlop={moderateScale(10)}
          style={styles.guestButton}
        >
          <Text style={styles.guestButtonText}>
            {Strings.guest_continueAsGuest}
          </Text>
        </TouchableOpacity>
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
    fontFamily: FontFamilies.ROBOTO_BLACK,
    fontSize: fontSize(35),
  },
  description: {
    color: Colors.tertiary,
    lineHeight: moderateScale(20),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
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
  loginButton: {
    paddingVertical: moderateScale(0),

  },
  guestButton: {
    alignSelf: "center",
    paddingVertical: moderateScale(12),
  },
  guestButtonText: {
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: fontSize(15),
    textDecorationLine: "underline",
  },
});

export default WelcomeScreen;
