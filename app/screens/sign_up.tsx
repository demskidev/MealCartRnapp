import AuthFooter from "@/components/AuthFooter";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Divider from "@/components/Divider";
import Header from "@/components/Header";
import { moderateScale, verticalScale } from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleIcon, GoogleIcon } from "@/assets/svg";
import { router } from "expo-router";
import { APP_ROUTES } from "@/constants/appRoutes";
import React from "react";

const SignupScreen = () => {
  // Local state to store form input values
  const [name, setName] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = React.useState<string | null>(
    null
  );

  // Navigation helper function using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Adjust UI when keyboard is open */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ScrollView ensures content is scrollable, especially with keyboard open */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header component with screen title and description */}
            <Header
              title={Strings.createYourAccount}
              description="Start your journey to organized meals "
            />

            {/* Form container with input fields for name, email, password, confirm password */}
            <View style={styles.form}>
              <BaseTextInput
                value={name}
                onChangeText={setName}
                placeholder={Strings.name}
              />
              <BaseTextInput
                value={email}
                onChangeText={setEmail}
                placeholder={Strings.email}
              />
              <BaseTextInput
                value={password}
                onChangeText={setPassword}
                placeholder={Strings.password}
                secureTextEntry={true}
              />
              <BaseTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={Strings.confirmPassword}
                secureTextEntry={true}
              />
            </View>

            {/* Sign Up button */}
            <View>
              <BaseButton
                title={Strings.signUp}
                gradientButton={true}
                textColor={Colors.white}
                description="Your meal plans and recipes will be securely synced to your account."
              />
            </View>

            {/* Divider between sign up and social login */}
            <Divider />

            {/* Social login buttons */}
            <View style={styles.buttonContainer}>
              <BaseButton
                title={Strings.continueWithGoogle}
                rightChild={<GoogleIcon />}
              />
              <BaseButton
                title={Strings.continueWithApple}
                backgroundColor={Colors.black}
                textColor={Colors.white}
                rightChild={<AppleIcon />}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer with navigation to Sign In screen for existing users */}
        <AuthFooter
          title={Strings.alreadyHaveAccount}
          buttonText={Strings.logIn}
          onPressButton={() => navigate(APP_ROUTES.SIGNIN)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for the screen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    justifyContent: "center",
  },
  form: {
    gap: moderateScale(12),
  },
  container: {
    gap: moderateScale(35),
    justifyContent: "center",
  },
  buttonContainer: {
    gap: verticalScale(10),
  },
});

export default SignupScreen;
