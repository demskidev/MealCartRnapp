import { Stack } from "expo-router";

const AppNavigator = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="TestMealPlan" options={{ headerShown: false }} />
      <Stack.Screen name="CreateMealPlan" options={{ headerShown: false }} />
      <Stack.Screen name="TestPlanShopping" options={{ headerShown: false }} />
      <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
      <Stack.Screen name="DietaryPreferencesScreen" options={{ headerShown: false }} />
      <Stack.Screen name="AllergiesIntolerancesScreen" options={{ headerShown: false }} />
      <Stack.Screen name="PasswordReset" options={{ headerShown: false }} />
      <Stack.Screen name="MealPlanSettings" options={{ headerShown: false }} />


    </Stack>
  );
};

export default AppNavigator;