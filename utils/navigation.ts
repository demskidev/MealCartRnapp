import { APP_ROUTES } from "@/constants/AppRoutes";
import { router } from "expo-router";

/**
 * Handle back navigation with fallback
 * - If navigation history exists, go back
 * - If no history, push to fallback screen
 * @param fallbackRoute - Screen to navigate to if no back history exists
 */
export const backNavigation = (
  fallbackRoute: typeof APP_ROUTES[keyof typeof APP_ROUTES] = APP_ROUTES.FIRST_SCREEN
) => {
  if (router.canGoBack && router.canGoBack()) {
    router.back();
  } else {
    router.push(fallbackRoute as any);
  }
};

/**
 * Handle forward navigation
 * - Uses router.push() to maintain navigation stack
 * - Allows back button to properly navigate to previous screen
 * @param screen - Screen to navigate to
 */
export const pushNavigation = (
  screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]
) => {
  router.push(screen as any);
};

export const replaceNavigation = (
  screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]
) => {
  router.replace(screen as any);
};


export const resetAndNavigate = (
  screen: typeof APP_ROUTES[keyof typeof APP_ROUTES]
) => {
  router.dismissAll();
  router.replace(screen as any);
};
