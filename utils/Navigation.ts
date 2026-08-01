import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  CommonActions,
  type NavigationContainerRef,
} from "@react-navigation/native";
import { router } from "expo-router";

let rootNavigationRef: NavigationContainerRef<any> | null = null;

/**
 * Registered once from `app/_layout.tsx`.
 *
 * expo-router's imperative `router` has no "throw away the history" primitive —
 * `dismissAll()` pops to the *first* route of the root stack, which here is
 * `app/index.tsx` (the pre-auth entry route), not the home screen. Clearing
 * history properly needs the navigation container ref.
 */
export const setRootNavigationRef = (
  ref: NavigationContainerRef<any> | null,
) => {
  rootNavigationRef = ref;
};

/**
 * Drop every root-stack entry below the focused one, leaving the focused route
 * (and its nested state) untouched.
 *
 * The reset payload reuses the live root state, so it keeps `stale: false` and
 * every existing route/navigator key — React Navigation therefore trims the
 * history without remounting the screen we are staying on.
 */
const clearRootHistory = () => {
  const ref = rootNavigationRef;

  if (!ref?.isReady()) {
    return;
  }

  const rootState = ref.getRootState();

  if (rootState?.type !== "stack" || rootState.routes.length < 2) {
    return;
  }

  const focusedRoute = rootState.routes[rootState.index];

  if (!focusedRoute) {
    return;
  }

  ref.dispatch(
    CommonActions.reset({
      ...rootState,
      index: 0,
      routes: [focusedRoute],
    }),
  );
};

/**
 * Handle back navigation with fallback
 * - If navigation history exists, go back
 * - If no history, push to fallback screen
 * @param fallbackRoute - Screen to navigate to if no back history exists
 */
export const backNavigation = (
  fallbackRoute: (typeof APP_ROUTES)[keyof typeof APP_ROUTES] = APP_ROUTES.FIRST_SCREEN
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
 * @param params - Optional parameters to pass to the screen
 */
export const pushNavigation = (
  screen: (typeof APP_ROUTES)[keyof typeof APP_ROUTES],
  params?: Record<string, any>
) => {
  if (params) {
    router.push({ pathname: screen as any, params });
  } else {
    router.push(screen as any);
  }
};

export const replaceNavigation = (
  screen: (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
) => {
  router.replace(screen as any);
};

/**
 * Go to `screen` and leave nothing behind it.
 *
 * Do NOT go back to `router.dismissAll()` here. `dismissAll` pops the root stack
 * to `app/index.tsx`, and expo-router resolves the `replace` that follows
 * against the *pre-pop* navigation state — so the replace targets a navigator
 * that no longer exists and is silently dropped, stranding the user on the
 * pre-auth entry route. That is what made "skip Kroger store → skip tour" (the
 * only flow that still had the whole sign-up stack underneath it) look like a
 * spontaneous logout.
 *
 * Trimming the history first is safe in either order: React Navigation applies
 * the reset before the queued replace, and the reset preserves navigator keys,
 * so the replace still lands on a live target.
 */
export const resetAndNavigate = (
  screen: (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
) => {
  clearRootHistory();
  router.replace(screen as any);
};
