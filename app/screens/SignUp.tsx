import AuthFooter from "@/components/AuthFooter";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Divider from "@/components/Divider";
import Header from "@/components/Header";
import { moderateScale, verticalScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleIcon, GoogleIcon } from "@/assets/svg";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { fontSize } from "@/utils/Fonts";
import { pushNavigation, replaceNavigation } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import {
  SignupFormValues,
  SignupViewModel,
} from "@/viewmodels/SignupViewModel";
import { Formik } from "formik";
import React from "react";

const SignupScreen = () => {
  const signupViewModel = new SignupViewModel();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const result = await signupViewModel.handleSignup(values);
      if (result.success) {
        showSuccessToast("Account created successfully!");
        // Navigate to OTP verification
        // resetAndNavigate(APP_ROUTES.HOME);
        pushNavigation(APP_ROUTES.WELCOME_MEAL_CART);

      } else {
        showErrorToast("Signup Failed", result.message);
      }
    } catch (error) {
      showErrorToast("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
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
              description={Strings.startJourney}
            />

            {/* Form with Formik */}
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={signupViewModel.validationSchema}
              onSubmit={handleSignup}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                isValid,
                validateForm,
                setTouched,
              }) => (
                <View style={styles.form}>
                  <BaseTextInput
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={() => {
                      handleBlur("name");
                      setTouched({ ...touched, name: true });
                    }}
                    placeholder={Strings.name}
                    error={
                      touched.name && errors.name ? errors.name : undefined
                    }
                  />
                  <BaseTextInput
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={() => {
                      handleBlur("email");
                      setTouched({ ...touched, email: true });
                    }}
                    placeholder={Strings.email}
                    keyboardType="email-address"
                    error={
                      touched.email && errors.email ? errors.email : undefined
                    }
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
                    error={
                      touched.password && errors.password
                        ? errors.password
                        : undefined
                    }
                  />
                  <BaseTextInput
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={() => {
                      handleBlur("confirmPassword");
                      setTouched({ ...touched, confirmPassword: true });
                    }}
                    placeholder={Strings.confirmPassword}
                    secureTextEntry={true}
                    error={
                      touched.confirmPassword && errors.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                    }
                  />

                  {/* Sign Up button */}
                  <View style={styles.buttonSpace}>
                    <BaseButton
                      title={Strings.signUp}
                      gradientButton={true}
                      textColor={Colors.white}
                      onPress={async () => {
                        // Validate all fields first
                        const formErrors = await validateForm();
                        if (Object.keys(formErrors).length > 0) {
                          // Mark all fields as touched to show errors under fields
                          setTouched({
                            name: true,
                            email: true,
                            password: true,
                            confirmPassword: true,
                          });
                          // Don't show toast, only show errors under fields
                          return;
                        }
                        // If valid, submit
                        handleSignup(values);
                      }}
                      disabled={isLoading}
                    />
                  </View>

                  <Text
                    style={styles.secureMeals}
                  >
                    {Strings.mealsAreSecure}
                  </Text>

                  {/* Divider between sign up and social login */}
                  <Divider style={{marginTop:verticalScale(15)}}/>

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

        {/* Footer with navigation to Sign In screen - positioned above bottom nav */}
        <View style={styles.footerContainer}>
          <AuthFooter
            title={Strings.alreadyHaveAccount}
            buttonText={Strings.logIn}
            onPressButton={() => replaceNavigation(APP_ROUTES.SIGNIN)}
          />
        </View>
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
    justifyContent: "space-between",
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
    marginTop:verticalScale(20)
  },
  buttonSpace: {
    marginTop: verticalScale(10),
  },
  secureMeals: {
    fontSize: fontSize(10),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    textAlign: "center",
  },
  footerContainer: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(10),
    backgroundColor: Colors.background,
  },
});

export default SignupScreen;
