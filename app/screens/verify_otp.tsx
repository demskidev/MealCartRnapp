import AuthFooter from "@/components/AuthFooter";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import BaseOTPField from "@/components/BaseOTPField";
import Header from "@/components/Header";
import { APP_ROUTES } from "@/constants/appRoutes";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VerifyOTPScreen = () => {
  // Local state to store the OTP input value
  // In VerifyOTPScreen
const { email } = useLocalSearchParams<{ email: string }>();
console.log("Email from previous screen:", email);

  const [otp, setOtp] = React.useState<string>("");

  // Navigation helper using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to navigate to the previous screen */}
      <BackButton onPress={() => router.back()}/>

      {/* Adjust UI when the keyboard is visible */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ScrollView allows content to scroll on smaller screens */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentView}>
            {/* Header with title and description */}
            <Header
              title={Strings.checkEmail}
              description={`We sent a 6-digit code 
  to ${email}`}
            />

            {/* OTP input field */}
            <BaseOTPField onChange={setOtp} errorMsg="fdghsff"/>

            {/* Container for form actions */}
            <View style={styles.form}>
              {/* Verify button */}
              <BaseButton
                title={Strings.verify}
                gradientButton={true}
                textColor={Colors.white}
                onPress={() => navigate(APP_ROUTES.NEW_PASSWORD)}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer for navigation back to login if user remembers password */}
        <AuthFooter
          title={Strings.rememberPassword}
          buttonText={Strings.logIn}
          onPressButton={() => navigate(APP_ROUTES.SIGNIN)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for the Verify OTP screen
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

export default VerifyOTPScreen;
