import { GUEST_DISPLAY_NAME, IS_GUEST_KEY } from "@/reduxStore/appKeys";
import {
  AuthCredential,
  linkWithCredential,
  signInWithCredential,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Sign in with a social credential, upgrading the current anonymous ("guest")
 * session in place when there is one.
 *
 * Linking keeps the same uid, so the meals / plans / lists a guest built before
 * signing up stay theirs. If the credential already belongs to a real account
 * there is nothing to merge into, so we fall back to a plain sign-in — the
 * guest's local session is abandoned, which is the standard trade-off and is
 * what `Strings.guest_accountExists` warns about.
 */
export const signInOrLinkWithCredential = async (
  credential: AuthCredential,
): Promise<UserCredential> => {
  const guestUser = auth.currentUser?.isAnonymous ? auth.currentUser : null;

  if (!guestUser) {
    return signInWithCredential(auth, credential);
  }

  try {
    return await linkWithCredential(guestUser, credential);
  } catch (error: any) {
    if (
      error?.code === "auth/credential-already-in-use" ||
      error?.code === "auth/email-already-in-use" ||
      error?.code === "auth/provider-already-linked"
    ) {
      return signInWithCredential(auth, credential);
    }
    throw error;
  }
};

/**
 * Was this `users/{uid}` doc seeded by "Continue as Guest"?
 *
 * After linking, the profile doc already exists, so the social sign-in flows
 * would treat the user as returning and leave the placeholder name and the
 * `isGuest` flag in place. Callers use this to overwrite those instead.
 */
export const isGuestProfile = (profile: any): boolean =>
  Boolean(profile?.[IS_GUEST_KEY]);

export const clearedGuestFields = (profile: any, name: string, email: string) => ({
  [IS_GUEST_KEY]: false,
  // The guest doc carries the placeholder name; only replace it if the provider
  // actually gave us something, so we never downgrade a real name to "Guest".
  name: name || (profile?.name === GUEST_DISPLAY_NAME ? "" : profile?.name) || "",
  email: email || profile?.email || "",
});
