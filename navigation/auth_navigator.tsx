import { Stack } from "expo-router";

const AuthNavigator = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="first_screen" options={{ headerShown: false }} />
      <Stack.Screen name="sign_in" options={{ headerShown: false }} />
      <Stack.Screen name="sign_up" options={{ headerShown: false }} />
      <Stack.Screen name="reset_password" options={{ headerShown: false }} />
      <Stack.Screen name="verify_otp" options={{ headerShown: false }} />
      <Stack.Screen name="new_password" options={{ headerShown: false }} />
      <Stack.Screen name="intro_screen" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthNavigator;
