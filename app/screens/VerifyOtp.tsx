import AuthFooter from "@/components/AuthFooter";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import BaseOTPField from "@/components/BaseOTPField";
import Header from "@/components/Header";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  verticalScale
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors } from "@/constants/Theme";
import { backNavigation, pushNavigation, replaceNavigation } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import { OTPFormValues, OTPViewModel } from "@/viewmodels/OTPViewModel";
import { useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VerifyOTPScreen = () => {
  const handleBack = () => {
    backNavigation(APP_ROUTES.SIGNIN);
  };
  const otpViewModel = new OTPViewModel();
  const [isLoading, setIsLoading] = React.useState(false);
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleOTPVerification = async (values: OTPFormValues) => {
    setIsLoading(true);
    try {
      const result = await otpViewModel.handleOTPVerification(values);
      if (result.success) {
        showSuccessToast(Strings.verifyOtp_success);
        pushNavigation(APP_ROUTES.NEW_PASSWORD);
      } else {
        showErrorToast(Strings.verifyOtp_verificationFailed, result.message);
      }
    } catch (error) {
      showErrorToast(Strings.verifyOtp_error, Strings.verifyOtp_unexpectedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <BackButton onPress={handleBack} />

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
          <View style={styles.contentView}>
            <Header
              title={Strings.checkEmail}
              description={Strings.verifyOtp_description.replace('{email}', email || 'your email')}
            />

            <Formik
              initialValues={{
                otp: "",
              }}
              validationSchema={otpViewModel.validationSchema}
              onSubmit={handleOTPVerification}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ handleChange, handleBlur, values, errors, touched, validateForm, setTouched }) => (
                <View style={styles.form}>
                  <BaseOTPField
                    value={values.otp}
                    onChange={handleChange("otp")}
                    onBlur={() => handleBlur("otp")}
                    error={touched.otp ? errors.otp : undefined}
                  />

                  <BaseButton
                    title={Strings.verify}
                    gradientButton={true}
                    textColor={Colors.white}
                    onPress={async () => {
                      const formErrors = await validateForm();
                      if (Object.keys(formErrors).length > 0) {
                        setTouched({ otp: true });
                        return;
                      }
                      handleOTPVerification(values);
                    }}
                    disabled={isLoading}
                  />
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>

        <AuthFooter
          title={Strings.rememberPassword}
          buttonText={Strings.logIn}
          onPressButton={() => replaceNavigation(APP_ROUTES.SIGNIN)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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