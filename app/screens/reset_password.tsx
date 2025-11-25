import AuthFooter from "@/components/AuthFooter";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Header from "@/components/Header";
import { APP_ROUTES } from "@/constants/appRoutes";
import { horizontalScale, verticalScale } from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ResetPasswordScreen = () => {
  // Local state to store the email input
  const [email, setEmail] = React.useState<string | null>(null);

  // Navigation helper function using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to navigate to the previous screen */}
      <BackButton onPress={() => router.back()} />

      {/* KeyboardAvoidingView adjusts the UI when keyboard is visible */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ScrollView allows content to scroll if screen is small or keyboard open */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentView}>
            {/* Header with title and description */}
            <Header
              title={Strings.resetPassword}
              description="Enter your email and we'll send you a code to get back into your account."
            />

            {/* Form container with email input and send code button */}
            <View style={styles.form}>
              <BaseTextInput
                value={email}
                placeholder={Strings.email}
                onChangeText={setEmail} // Update state on input change
              />

              {/* Button to send the reset code and navigate to OTP verification screen */}
              <BaseButton
                title={Strings.sendCode}
                gradientButton={true}
                textColor={Colors.white}
                onPress={() =>
                  navigate(
                    `${APP_ROUTES.VERIFY_OTP}?email=${encodeURIComponent(
                      email
                    )}`
                  )
                }
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer allowing navigation back to login if user remembers password */}
        <AuthFooter
          title={Strings.rememberPassword}
          buttonText={Strings.logIn}
          onPressButton={() => navigate(APP_ROUTES.SIGNIN)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for ResetPasswordScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20), 
  },
  keyboardAvoidingView: {
    flex: 1, 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center", 
  },
  contentView: {
    gap: verticalScale(34),
  },
  form: {
    gap: verticalScale(12), 
  },
});

export default ResetPasswordScreen;
