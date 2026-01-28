// app/(tabs)/home/_layout.tsx
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "HomeScreen",
};

export default function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="DietaryPreferencesScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AllergiesIntolerancesScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="MealPlanSettings" options={{ headerShown: false }} />
      <Stack.Screen name="PasswordReset" options={{ headerShown: false }} />
    </Stack>
  );
}
