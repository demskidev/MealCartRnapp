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

const NewPasswordScreen = () => {
  // Local state for new password and confirmation
  const [password, setPassword] = React.useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = React.useState<string | null>(
    null
  );

  // Navigation helper using expo-router
  const navigate = (screen: string) => {
    router.replace(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to go to previous screen */}
      <BackButton onPress={() => router.back()} />

      {/* Adjust UI when keyboard is visible */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Scrollable content for smaller screens and keyboard */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentView}>
            {/* Header with screen title and description */}
            <Header
              title={Strings.setNewPassword}
              description="Your new password must be different from previous ones."
            />

            {/* Form for entering new password and confirmation */}
            <View style={styles.form}>
              <BaseTextInput
                value={password}
                onChangeText={setPassword}
                placeholder={Strings.password}
                secureTextEntry={true} // Hide password input
              />
              <BaseTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={Strings.confirmPassword}
                secureTextEntry={true} // Hide confirm password input
              />

              {/* Button to save new password and navigate (login) */}
              <BaseButton
                title={Strings.saveAndLogin}
                gradientButton={true}
                textColor={Colors.white}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer to navigate back to login if needed */}
        <AuthFooter
          title={Strings.rememberPassword}
          buttonText={Strings.logIn}
          onPressButton={() => navigate(APP_ROUTES.SIGNIN)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles for NewPasswordScreen
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
