import AuthFooter from "@/components/AuthFooter";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Header from "@/components/Header";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { horizontalScale, verticalScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors } from "@/constants/Theme";
import { backNavigation, pushNavigation } from "@/utils/Navigation";
import {
  ResetPasswordFormValues,
  ResetPasswordViewModel,
} from "@/viewmodels/ResetPasswordViewModel";
import { Formik } from "formik";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ResetScreenProps {
  navigation?: any;
}

const ResetPasswordScreen: React.FC<ResetScreenProps> = ({ navigation }) => {
  const resetPasswordViewModel = new ResetPasswordViewModel();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBack = () => {
    backNavigation(APP_ROUTES.SIGNIN);
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const result = await resetPasswordViewModel.handleResetPassword(values);
      if (result.success) {
        // showToast("success", result.message);
        // pushNavigation(
        //   `${APP_ROUTES.VERIFY_OTP}?email=${encodeURIComponent(values.email)}`
        // );

         Alert.alert(
        "Check Your Email",
        "A password reset link has been sent to your email address.",
        [
          {
            text: "OK",
            onPress: () => {
              pushNavigation(APP_ROUTES.SIGNIN); 
            },
          },
        ]
      );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
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
              title={Strings.resetPassword}
              description="Enter your email and we'll send you a code to get back into your account."
            />

            <Formik
              initialValues={{
                email: "",
              }}
              validationSchema={resetPasswordViewModel.validationSchema}
              onSubmit={handleResetPassword}
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

                  <BaseButton
                    title={Strings.sendCode}
                    gradientButton={true}
                    textColor={Colors.white}
                    onPress={async () => {
                      const formErrors = await validateForm();
                      if (Object.keys(formErrors).length > 0) {
                        setTouched({ email: true });
                        // Don't show toast, only show errors under field
                        return;
                      }
                      handleResetPassword(values);
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
          onPressButton={() => backNavigation(APP_ROUTES.SIGNIN)}
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

export default ResetPasswordScreen;
