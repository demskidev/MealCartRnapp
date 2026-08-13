import { Strings } from "@/constants/Strings";
import { USERS_COLLECTION } from "@/reduxStore/appKeys";
import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import {
  clearedGuestFields,
  isGuestProfile,
  signInOrLinkWithCredential,
} from "./authLink";
import { auth } from "./firebase";
import { getDocumentById, setDocumentById, updateDocument } from "./firestore";

export interface AppleSignInResult {
  success: boolean;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    imageUrl: string | null;
    isNewUser: boolean;
  };
  error?: string;
}

export const signInWithApple = async (): Promise<AppleSignInResult> => {
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: Strings.appleSignIn_unsupportedDevice,
      };
    }

    // Get Apple credential
    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, email, fullName } = appleCredential;

    if (!identityToken) {
      return {
        success: false,
        error: Strings.appleSignIn_noIdentityToken,
      };
    }

    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: identityToken,
    });

    const userCredential = await signInOrLinkWithCredential(credential);
    const firebaseUser = userCredential.user;

    // `getDocumentById` is typed as `{ id: string } | null`, so the profile
    // fields spread in from Firestore aren't visible without widening.
    const existingUser: any = await getDocumentById(
      USERS_COLLECTION,
      firebaseUser.uid,
    );
    // A guest who just linked already has a profile doc, but it still holds the
    // "Guest" placeholder and the isGuest flag — treat them as a new account.
    const wasGuest = isGuestProfile(existingUser);
    const isNewUser = !existingUser || wasGuest;

    let displayName = firebaseUser.displayName || "";
    if (fullName?.givenName || fullName?.familyName) {
      displayName =
        `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim();
    }

    if (wasGuest) {
      await updateDocument(USERS_COLLECTION, firebaseUser.uid, {
        ...clearedGuestFields(
          existingUser,
          displayName,
          email || firebaseUser.email || "",
        ),
        provider: "apple",
      });
    } else if (isNewUser) {
      const newUserData = {
        email: email || firebaseUser.email || "",
        name: displayName || "Apple User",
        imageUrl: "",
        provider: "apple",
        createdAt: serverTimestamp(),
        uid: firebaseUser.uid,
      };

      await setDocumentById(USERS_COLLECTION, firebaseUser.uid, newUserData);
    }

    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        email: email || firebaseUser.email,
        name: displayName || existingUser?.name || "Apple User",
        imageUrl: null,
        isNewUser,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: describeAppleSignInError(error),
    };
  }
};

/**
 * Turn an Apple *or* Firebase failure into something that identifies the cause.
 *
 * This flow has two completely separate failure surfaces and they used to share
 * one message ("Failed to sign in with Apple"), which said nothing about which
 * had failed:
 *
 *  1. `expo-apple-authentication` — native `ASAuthorizationError`s, surfaced as
 *     `ERR_REQUEST_*` / `ERR_INVALID_*` codes. Only three of the nine were
 *     handled; `ERR_REQUEST_UNKNOWN` and `ERR_REQUEST_NOT_HANDLED` — the ones
 *     iOS raises when the "Sign In with Apple" entitlement or the App ID
 *     capability is missing — fell through to the generic message.
 *  2. `firebase/auth` and Firestore, from `signInOrLinkWithCredential` onwards.
 *     None of these were handled at all, so a disabled Apple provider
 *     (`auth/operation-not-allowed`) looked identical to a user cancelling.
 *
 * The default branch appends the raw code so an unrecognised failure is still
 * diagnosable from a screenshot rather than anonymous.
 */
const describeAppleSignInError = (error: any): string => {
  switch (error?.code) {
    // --- expo-apple-authentication (native ASAuthorizationError) -----------
    case "ERR_REQUEST_CANCELED":
      return Strings.appleSignIn_cancelled;

    // iOS reports .unknown / .notHandled when the request can't even be
    // presented: the entitlement is absent from the build, the App ID in the
    // Apple Developer portal doesn't have the Sign In with Apple capability, or
    // the device has no iCloud account signed in.
    case "ERR_REQUEST_UNKNOWN":
    case "ERR_REQUEST_NOT_HANDLED":
    case "ERR_REQUEST_NOT_INTERACTIVE":
      return Strings.appleSignIn_entitlementMissing;

    case "ERR_REQUEST_FAILED":
    case "ERR_INVALID_RESPONSE":
    case "ERR_REQUEST_MATCHED_EXCLUDED_CREDENTIAL":
      return Strings.appleSignIn_rejectedCredential;

    case "ERR_INVALID_SCOPE":
    case "ERR_INVALID_OPERATION":
      return Strings.appleSignIn_failed;

    // --- firebase/auth ----------------------------------------------------
    // The Apple provider is switched off under Authentication -> Sign-in
    // method. Nothing client side can fix this.
    case "auth/operation-not-allowed":
    case "auth/admin-restricted-operation":
      return Strings.appleSignIn_providerDisabled;

    // Firebase refused Apple's identity token — typically the provider's
    // Services ID / team ID / key don't match the bundle id the token was
    // issued for, or (with a nonce in play) the nonce didn't verify.
    case "auth/invalid-credential":
    case "auth/invalid-oauth-provider":
    case "auth/invalid-oauth-client-id":
      return Strings.appleSignIn_rejectedCredential;

    case "auth/account-exists-with-different-credential":
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
      return Strings.appleSignIn_accountExists;

    // Should now be unreachable — `signInOrLinkWithCredential` checks
    // `providerData` before linking and falls back to a plain sign-in. Kept
    // mapped so that if it ever escapes again it reads as "try again" rather
    // than as a raw Firebase code.
    case "auth/provider-already-linked":
      return Strings.appleSignIn_failed;

    case "auth/user-disabled":
      return "User account is disabled";

    case "auth/network-request-failed":
      return Strings.appleSignIn_networkError;

    case "auth/too-many-requests":
      return Strings.tooManyAttempts;

    default:
      return error?.code
        ? `${Strings.appleSignIn_failed} (${error.code})`
        : error?.message || Strings.appleSignIn_failed;
  }
};

export const signOutApple = async () => {
  try {
    await auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to sign out" };
  }
};
