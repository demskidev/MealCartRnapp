import { Stack } from "expo-router";

const AuthNavigator = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FirstScreen" options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="ResetPassword" options={{ headerShown: false }} />
      <Stack.Screen name="VerifyOtp" options={{ headerShown: false }} />
      <Stack.Screen name="NewPassword" options={{ headerShown: false }} />
      <Stack.Screen name="IntroScreen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthNavigator;
