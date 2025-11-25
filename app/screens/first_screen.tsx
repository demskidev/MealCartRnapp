import { CreateAccount, ForwardIcon, SplashIcon } from "@/assets/svg";
import BaseButton from "@/components/BaseButton";
import { APP_ROUTES } from "@/constants/appRoutes";
import { moderateScale } from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FirstScreen = () => {
  // Navigation helper using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
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
    fontWeight: "bold", // Bold title
    fontSize: moderateScale(35),
  },
  description: {
    color: Colors.secondaryText,
    fontSize: moderateScale(16),
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

export default FirstScreen;
