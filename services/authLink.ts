import { GUEST_DISPLAY_NAME, IS_GUEST_KEY } from "@/reduxStore/appKeys";
import {
  AuthCredential,
  linkWithCredential,
  OAuthProvider,
  reload,
  signInWithCredential,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Errors that all mean the same thing: this credential (or its email) already
 * belongs to a real account, so there is nothing to merge the guest into and we
 * should just sign in as that account.
 */
const ALREADY_CLAIMED_CODES = new Set([
  "auth/credential-already-in-use",
  "auth/email-already-in-use",
  "auth/provider-already-linked",
]);

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

  // `isAnonymous` and `providerData` are read off the cached `User`, which can
  // lag the server after a link earlier in the same session. Refresh first, or a
  // user who is really no longer anonymous still looks like a guest here and we
  // try to link a provider that is already attached.
  try {
    await reload(guestUser);
  } catch {
    // Offline or a revoked token — fall through and let the calls below decide.
  }

  // Nothing to link: this account already carries the provider. Attempting it
  // anyway is what raised `auth/provider-already-linked`, and because that threw
  // before we ever reached the sign-in fallback it surfaced to the user as a
  // failed login even though their credential was perfectly valid.
  if (
    !auth.currentUser?.isAnonymous ||
    auth.currentUser.providerData.some(
      (p) => p.providerId === credential.providerId,
    )
  ) {
    return signInWithCredential(auth, credential);
  }

  try {
    return await linkWithCredential(auth.currentUser, credential);
  } catch (error: any) {
    if (!ALREADY_CLAIMED_CODES.has(error?.code)) {
      throw error;
    }

    // Apple and Google identity tokens are single use. If the link attempt
    // reached the server before failing, `credential` is spent and reusing it
    // fails with `auth/invalid-credential` — a confusing second error on top of
    // the first. Firebase returns a fresh, usable credential on the error for
    // exactly this case, so prefer it and only fall back to the original.
    const reusable = OAuthProvider.credentialFromError(error) ?? credential;
    return signInWithCredential(auth, reusable);
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
