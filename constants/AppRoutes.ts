export const APP_ROUTES = {
  // Auth routes
  SIGNUP: "/screens/SignUp",
  SIGNIN: "/screens/SignIn",
  RESET_PASSWORD: "/screens/ResetPassword",
  // Only reachable if the reset email is pointed at a custom action URL that
  // deep-links back into the app — see services/passwordReset.ts. Firebase's
  // hosted reset page is used today, so nothing navigates here.
  NEW_PASSWORD: "/screens/NewPassword",
  FIRST_SCREEN: "/screens/FirstScreen",
  INTRO_SCREEN: "/screens/IntroScreen",
  WELCOME_MEAL_CART: "/screens/WelcomeMealCart",
  WelcomeScreen: "/screens/WelcomeScreen",
  KROGER_SIGNUP: "/screens/KrogerSignupScreen",

  // App routes
  HOME: "/(tabs)/home",
  MEALS: "/(tabs)/1_Meals",
  PLANS: "/(tabs)/2_Plans",
  LISTS: "/(tabs)/3_Lists",
  AllergiesIntolerance: "/(tabs)/home/AllergiesIntolerance",
  ProfileScreen: "/(tabs)/home/ProfileScreen",
  CreateMealPlan: "/appscreens/CreateMealPlan",
  DietaryPreferences: "/(tabs)/home/DietaryPreferences",
  MealPlanSettings: "/(tabs)/home/MealPlanSettings",
  PasswordReset: "/(tabs)/home/PasswordReset",
  CREATE_MEAL: "/appscreens/CreateMealScreen",
  TestMealPlan: "/appscreens/TestMealPlan",
  TestPlanShopping: "/appscreens/TestPlanShopping",
};
