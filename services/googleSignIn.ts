import { Strings } from "@/constants/Strings";
import { USERS_COLLECTION } from "@/reduxStore/appKeys";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  User,
} from "@react-native-google-signin/google-signin";
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { Platform } from "react-native";
import {
  clearedGuestFields,
  isGuestProfile,
  signInOrLinkWithCredential,
} from "./authLink";
import { auth } from "./firebase";
import { getDocumentById, setDocumentById, updateDocument } from "./firestore";

const WEB_CLIENT_ID =
  "107165390600-nb7021ovk2s5118vrbdcarj36piilrb5.apps.googleusercontent.com";
const IOS_CLIENT_ID =
  "107165390600-nmgglhb1s0gglvqmcln8kehr21cgpi5o.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: false,
  forceCodeForRefreshToken: false,
  profileImageSize: 120,
});

// Guard to prevent concurrent sign-in attempts
let isSigningIn = false;
let signInTimeout: NodeJS.Timeout | null = null;

export interface GoogleSignInResult {
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

export interface GoogleSignOutResult {
  success: boolean;
  error?: string;
}

export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  if (isSigningIn) {
    return {
      success: false,
      error: "Sign-in is already in progress. Please wait.",
    };
  }

  isSigningIn = true;

  // Safety timeout - reset flag after 30 seconds in case something goes wrong
  signInTimeout = setTimeout(() => {
    isSigningIn = false;
  }, 30000);

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    // Clear any previous session to prevent stale OAuth state
    try {
      await GoogleSignin.signOut();

      // CRITICAL: Add delay to ensure OAuth session is fully cleaned up
      // This prevents the "OAuth redirect sent after session completed" error
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (clearError) {}

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return {
        success: false,
        error: "Sign-in was cancelled",
      };
    }

    const { data } = response;
    const { idToken } = data;

    if (!idToken) {
      return {
        success: false,
        error: "No ID token received from Google",
      };
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInOrLinkWithCredential(credential);
    const firebaseUser = userCredential.user;

    // `getDocumentById` is typed as `{ id: string } | null`, so the profile
    // fields spread in from Firestore aren't visible without widening.
    const existingUser: any = await getDocumentById(
      USERS_COLLECTION,
      firebaseUser.uid,
    );

    // A guest who just linked already has a profile doc, so `existingUser` is
    // truthy — but they're a new *account*, and the doc still holds the "Guest"
    // placeholder and the isGuest flag.
    const wasGuest = isGuestProfile(existingUser);
    const isNewUser = !existingUser || wasGuest;

    if (wasGuest) {
      await updateDocument(USERS_COLLECTION, firebaseUser.uid, {
        ...clearedGuestFields(
          existingUser,
          firebaseUser.displayName || "",
          firebaseUser.email || "",
        ),
        imageUrl: firebaseUser.photoURL || existingUser?.imageUrl || "",
        provider: "google",
      });
    } else if (isNewUser) {
      const newUserData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        imageUrl: firebaseUser.photoURL || "",
        provider: "google",
        createdAt: serverTimestamp(),
        uid: firebaseUser.uid,
      };
      await setDocumentById(USERS_COLLECTION, firebaseUser.uid, newUserData);
    } else {
    }

    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        imageUrl: firebaseUser.photoURL,
        isNewUser,
      },
    };
  } catch (error: any) {
    let errorMessage = "Failed to sign in with Google";

    // Use type guard from documentation
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = "Sign-in was cancelled";
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = "Sign-in is already in progress";
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = "Play Services not available or outdated";
          break;
        // Android only, and never the user's fault: Google rejected the request
        // because the signing certificate of the installed build isn't
        // registered as an Android OAuth client on the Firebase project. A
        // Play-distributed build is re-signed with Play's app signing key, so
        // its SHA-1 has to be added in Firebase on top of the upload key's.
        //
        // The native module rejects with the raw CommonStatusCodes value ("10")
        // and a "DEVELOPER_ERROR: Follow troubleshooting instructions at ..."
        // message — `statusCodes` has no entry for it, so match the code
        // directly rather than surfacing that URL to the user.
        case "10":
          errorMessage = Strings.googleSignInMisconfigured;
          break;
        default:
          errorMessage = error.message || "Failed to sign in with Google";
      }
    } else if (error.code === "auth/account-exists-with-different-credential") {
      errorMessage = "An account already exists with the same email address";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid Google credentials. Please try again.";
    } else if (error.message?.includes("OIDExternalUserAgentSession")) {
      errorMessage = "Sign-in session expired. Please try again.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    if (signInTimeout) {
      clearTimeout(signInTimeout);
      signInTimeout = null;
    }
    isSigningIn = false;
  }
};

export const hasPreviousSignIn = (): boolean => {
  return GoogleSignin.hasPreviousSignIn();
};

export const getCurrentUser = (): User | null => {
  return GoogleSignin.getCurrentUser();
};

export const signOut = async (): Promise<GoogleSignOutResult> => {
  try {
    await GoogleSignin.signOut();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to sign out",
    };
  }
};

export const revokeAccess = async (): Promise<GoogleSignOutResult> => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to revoke access",
    };
  }
};

export { GoogleSignin };
