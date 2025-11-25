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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleIcon, GoogleIcon } from "@/assets/svg";
import { router } from "expo-router";
import { APP_ROUTES } from "@/constants/appRoutes";
import React from "react";

const SignInScreen = () => {
  // Local state to store email and password input values
  const [email, setEmail] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState<string | null>(null);

  // Navigation helper function using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView adjusts UI when keyboard is visible */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* ScrollView allows content to scroll when keyboard is open or screen is small */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header component with screen title and description */}
            <Header
              title={Strings.welcomeBack}
              description="Log in to continue your meal planning."
            />

            {/* Form container with email and password inputs */}
            <View style={styles.form}>
              <BaseTextInput
                value={email}
                onChangeText={setEmail}
                placeholder={Strings.email}
                keyboardType="email-address"
              />
              <BaseTextInput
                value={password}
                onChangeText={setPassword}
                placeholder={Strings.password}
                secureTextEntry={true}
              />
            </View>

            {/* Container for "Forgot Password" and login button */}
            <View style={styles.middleContainer}>
              <TouchableOpacity
                onPress={() => navigate(APP_ROUTES.RESET_PASSWORD)}
              >
                <Text style={styles.forgotPassword}>
                  {Strings.forgotPassword}
                </Text>
              </TouchableOpacity>

              {/* Login button */}
              <BaseButton
                title={Strings.logIn}
                gradientButton={true}
                textColor={Colors.white}
              />
            </View>

            {/* Divider between login and social login buttons */}
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

        {/* Footer with navigation to Sign Up screen for new users */}
        <AuthFooter
          title={Strings.newUser}
          buttonText={Strings.signup}
          onPressButton={() => navigate(APP_ROUTES.SIGNUP)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    paddingHorizontal: moderateScale(25),
    justifyContent: "center",
  },
  forgotPassword: {
    textAlign: "right",
    color: Colors.secondaryText,
    fontSize: moderateScale(14),
  },
  form: {
    gap: moderateScale(12),
  },
  container: {
    gap: moderateScale(35),
  },
  middleContainer: {
    gap: moderateScale(12),
  },
  text: {
    textAlign: "center",
  },
  buttonContainer: {
    gap: verticalScale(10),
  },
});

export default SignInScreen;
