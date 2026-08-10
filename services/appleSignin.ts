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
        error: "Apple Sign In is not available on this device",
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
        error: "No identity token received from Apple",
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

      await getDocumentById(USERS_COLLECTION, firebaseUser.uid);
    } else {
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
    let errorMessage = "Failed to sign in with Apple";

    if (error.code === "ERR_REQUEST_CANCELED") {
      errorMessage = "Sign-in was cancelled";
    } else if (error.code === "ERR_REQUEST_FAILED") {
      errorMessage = "Sign-in request failed";
    } else if (error.code === "ERR_INVALID_RESPONSE") {
      errorMessage = "Invalid response from Apple";
    }

    return {
      success: false,
      error: errorMessage,
    };
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
