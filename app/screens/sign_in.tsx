import AuthFooter from "@/components/AuthFooter";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Divider from "@/components/Divider";
import Header from "@/components/Header";
import { moderateScale, verticalScale } from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleIcon, GoogleIcon } from "@/assets/svg";
import { APP_ROUTES } from "@/constants/appRoutes";
import { SigninFormValues, SigninViewModel } from "@/viewmodels/SigninViewModel";
import { router } from "expo-router";
import { Formik } from "formik";
import React from "react";

const SignInScreen = () => {
  const signinViewModel = new SigninViewModel();
  const [isLoading, setIsLoading] = React.useState(false);

  // Navigation helper function using expo-router
  const navigate = (screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]) => {
    router.replace(screen as any);
  };

  const handleSignin = async (values: SigninFormValues) => {
    setIsLoading(true);
    try {
      const result = await signinViewModel.handleSignin(values);
      if (result.success) {
        showSuccessToast("Signed in successfully!");
        // Navigate to home screen
        navigate(APP_ROUTES.HOME);
      } else {
        showErrorToast("Sign In Failed", result.message);
      }
    } catch (error) {
      showErrorToast("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

            {/* Form with Formik */}
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={signinViewModel.validationSchema}
              onSubmit={handleSignin}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ handleChange, handleBlur, values, errors, touched, validateForm, setTouched }) => (
                <View>
                  <View style={styles.form}>
                    <BaseTextInput
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={() => {
                        handleBlur("email");
                        setTouched({ ...touched, email: true });
                      }}
                      placeholder={Strings.email}
                      keyboardType="email-address"
                      error={touched.email && errors.email ? errors.email : undefined}
                    />
                    <BaseTextInput
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={() => {
                        handleBlur("password");
                        setTouched({ ...touched, password: true });
                      }}
                      placeholder={Strings.password}
                      secureTextEntry={true}
                      error={touched.password && errors.password ? errors.password : undefined}
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
                      onPress={async () => {
                        const formErrors = await validateForm();
                        if (Object.keys(formErrors).length > 0) {
                          setTouched({
                            email: true,
                            password: true,
                          });
                          // Don't show toast, only show errors under fields
                          return;
                        }
                        handleSignin(values);
                      }}
                      disabled={isLoading}
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
              )}
            </Formik>
          </View>
        </ScrollView>

        {/* Footer with navigation to Sign Up screen - positioned above bottom nav */}
        <View style={styles.footerContainer}>
          <AuthFooter
            title={Strings.newUser}
            buttonText={Strings.signup}
            onPressButton={() => navigate(APP_ROUTES.SIGNUP)}
          />
        </View>
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
    justifyContent: 'space-between',
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
    marginBottom: verticalScale(12),
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
  footerContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(10),
    backgroundColor: Colors.background,
  },
});

export default SignInScreen;