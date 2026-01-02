import AuthFooter from "@/components/AuthFooter";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Divider from "@/components/Divider";
import GradientText from "@/components/GradientText";
import Header from "@/components/Header";
import { moderateScale, verticalScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { pushNavigation, replaceNavigation, resetAndNavigate } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppleIcon, GoogleIcon } from "@/assets/svg";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { Colors } from "@/constants/Theme";
import { useLoader } from "@/context/LoaderContext";
import { useAppSelector } from "@/reduxStore/hooks";
import {
  SigninFormValues,
  SigninViewModel,
} from "@/viewmodels/SigninViewModel";
import { Formik } from "formik";
import { useEffect } from "react";

const SignInScreen = () => {
  const signinViewModel = new SigninViewModel();
  const isLoading = useAppSelector(state => state.auth.loading);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading]);


  const handleSignin = async (values: SigninFormValues) => {


    await signinViewModel.handleSignin(
      values,
      (payload) => {
        showSuccessToast(Strings.signinSuccessful);
        resetAndNavigate(APP_ROUTES.HOME);
      },
      (error) => {
        showErrorToast(error);

      }
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Header
              title={Strings.welcomeBack}
              description={Strings.signinDescription}
            />

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
              {({
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                validateForm,
                setTouched,
              }) => (
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
                  </View>

                  <View style={styles.middleContainer}>
                    <TouchableOpacity
                      style={styles.forgotPasswordContainer}
                      onPress={() => pushNavigation(APP_ROUTES.RESET_PASSWORD)}
                    >
                      <GradientText
                        text={Strings.forgotPassword}
                        startColor={Colors._586E3F}
                        endColor={Colors._5F6C51}
                        fontSize={14}
                        angle="diagonal"
                      />
                    </TouchableOpacity>

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
                          return;
                        }
                        handleSignin(values);
                      }}
                      disabled={isLoading}
                    />
                  </View>

                  <Divider style={styles.dividerStyle} />

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

        <View style={styles.footerContainer}>
          <AuthFooter
            title={Strings.newUser}
            buttonText={Strings.signup}
            onPressButton={() => replaceNavigation(APP_ROUTES.SIGNUP)}
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
    justifyContent: "space-between",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(25),
    justifyContent: "center",
  },
  forgotPassword: {
    textAlign: "right",
    color: Colors.tertiary,
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
    gap: moderateScale(8),
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginVertical: verticalScale(8),
  },
  dividerStyle: {
    marginVertical: verticalScale(50),
  },
});

export default SignInScreen;
