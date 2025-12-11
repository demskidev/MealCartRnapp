import AuthFooter from "@/components/AuthFooter";
import BackButton from "@/components/BackButton";
import BaseButton from "@/components/BaseButton";
import BaseTextInput from "@/components/BaseTextInput";
import Header from "@/components/Header";
import { APP_ROUTES } from "@/constants/appRoutes";
import { horizontalScale, verticalScale } from "@/constants/constants";
import { Strings } from "@/constants/strings";
import { Colors } from "@/constants/theme";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { NewPasswordFormValues, NewPasswordViewModel } from "@/viewmodels/NewPasswordViewModel";
import { router } from "expo-router";
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

const NewPasswordScreen = () => {
  // Helper to safely go back or navigate to Sign In
  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) {
      router.back();
    } else {
      router.replace(APP_ROUTES.SIGNIN as any);
    }
  };
  const newPasswordViewModel = new NewPasswordViewModel();
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = (screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]) => {
    router.replace(screen as any);
  };

  const handleNewPassword = async (values: NewPasswordFormValues) => {
    setIsLoading(true);
    try {
      const result = await newPasswordViewModel.handleNewPassword(values);
      if (result.success) {
        showSuccessToast("Password updated successfully!");
        navigate(APP_ROUTES.SIGNIN);
      } else {
        showErrorToast("Update Failed", result.message);
      }
    } catch (error) {
      showErrorToast("Error", "An unexpected error occurred");
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
              title={Strings.setNewPassword}
              description="Your new password must be different from previous ones."
            />

            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={newPasswordViewModel.validationSchema}
              onSubmit={handleNewPassword}
              validateOnChange={true}
              validateOnBlur={true}
            >
              {({ handleChange, handleBlur, values, errors, touched, validateForm, setTouched }) => (
                <View style={styles.form}>
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

                  <BaseButton
                    title={Strings.saveAndLogin}
                    gradientButton={true}
                    textColor={Colors.white}
                    onPress={async () => {
                      const formErrors = await validateForm();
                      if (Object.keys(formErrors).length > 0) {
                        setTouched({
                          password: true,
                          confirmPassword: true,
                        });
                        // Don't show toast, only show errors under fields
                        return;
                      }
                      handleNewPassword(values);
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
          onPressButton={() => navigate(APP_ROUTES.SIGNIN)}
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

export default NewPasswordScreen;