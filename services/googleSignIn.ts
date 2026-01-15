



import { USERS_COLLECTION } from '@/reduxStore/appKeys';
import {
  GoogleSignin,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
  User
} from '@react-native-google-signin/google-signin';
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase';
import { getDocumentById, setDocumentById } from './firestore';

const WEB_CLIENT_ID = '107165390600-nb7021ovk2s5118vrbdcarj36piilrb5.apps.googleusercontent.com';
const IOS_CLIENT_ID = '107165390600-sni5oc9le9cnucc89mqv7e51eq0undge.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID, 
  offlineAccess: false, 
  forceCodeForRefreshToken: true,
  profileImageSize: 120,
});

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

/**
 * Sign in with Google and authenticate with Firebase
 */
export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();
    console.log('📦 [Google Sign-In] Full response:', JSON.stringify(response, null, 2));
    console.log('📝 [Google Sign-In] Response type:', response.type);
    
    // Use type guard from documentation
    if (!isSuccessResponse(response)) {
      console.log('❌ [Google Sign-In] Sign-in not successful, type:', response.type);
      return {
        success: false,
        error: 'Sign-in was cancelled by user',
      };
    }

    const { data } = response;
    console.log('👤 [Google Sign-In] User data:', JSON.stringify(data, null, 2));

    console.log('   - User ID:', data?.user?.id);
    console.log('   - User Email:', data?.user?.email);
    console.log('   - User Name:', data?.user?.name);
    console.log('   - User Photo:', data?.user?.photo);

    const { idToken } = data;

    if (!idToken) {
      return {
        success: false,
        error: 'No ID token received from Google',
      };
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    const existingUser = await getDocumentById(USERS_COLLECTION, firebaseUser.uid);

    console.log('existingUser99', existingUser)
    const isNewUser = !existingUser;

    if (isNewUser) {
      const newUserData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        imageUrl: firebaseUser.photoURL || "",
        provider: 'google',
        createdAt: serverTimestamp(),
        uid: firebaseUser.uid,
      };
      console.log('💾 [New User] Saving to Firestore:', JSON.stringify(newUserData, null, 2));
      await setDocumentById(USERS_COLLECTION, firebaseUser.uid, newUserData);

      const savedData = await getDocumentById(USERS_COLLECTION, firebaseUser.uid);
      console.log('✅ [New User] Saved successfully. Verification:', JSON.stringify(savedData, null, 2));
    } else {
      console.log('✅ [Existing User] User already exists');
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
    console.error('🔥 [Google Sign-In] Error:', error);

    let errorMessage = 'Failed to sign in with Google';

    // Use type guard from documentation
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          errorMessage = 'Sign-in was cancelled';
          break;
        case statusCodes.IN_PROGRESS:
          errorMessage = 'Sign-in is already in progress';
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          errorMessage = 'Play Services not available or outdated';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in with Google';
      }
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with the same email address';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid Google credentials';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Sign in silently (if user previously signed in)
 */
export const signInSilently = async (): Promise<GoogleSignInResult> => {
  try {
    const response = await GoogleSignin.signInSilently();
    
    if (isSuccessResponse(response)) {
      const { data } = response;
      const { idToken } = data;

      if (!idToken) {
        return {
          success: false,
          error: 'No ID token received from Google',
        };
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      return {
        success: true,
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          imageUrl: firebaseUser.photoURL,
          isNewUser: false,
        },
      };
    } else if (isNoSavedCredentialFoundResponse(response)) {
      return {
        success: false,
        error: 'No saved credentials found',
      };
    }

    return {
      success: false,
      error: 'Silent sign-in failed',
    };
  } catch (error: any) {
    console.error('Silent sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in silently',
    };
  }
};

/**
 * Check if user has previously signed in
 */
export const hasPreviousSignIn = (): boolean => {
  return GoogleSignin.hasPreviousSignIn();
};

/**
 * Get current signed-in user
 */
export const getCurrentUser = (): User | null => {
  return GoogleSignin.getCurrentUser();
};

/**
 * Sign out from Google and Firebase
 */
export const signOut = async (): Promise<GoogleSignOutResult> => {
  try {
    await GoogleSignin.signOut();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign out',
    };
  }
};

/**
 * Revoke Google access and sign out
 */
export const revokeAccess = async (): Promise<GoogleSignOutResult> => {
  try {
    await GoogleSignin.revokeAccess();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error revoking access:', error);
    return {
      success: false,
      error: error.message || 'Failed to revoke access',
    };
  }
};


export { GoogleSignin };
