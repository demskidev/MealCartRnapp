import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { 
  GoogleAuthProvider, 
  signInWithCredential,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from './firebase';
import { makeRedirectUri } from 'expo-auth-session';

// This is needed for web browser to close properly after auth
WebBrowser.maybeCompleteAuthSession();

// Get your Web Client ID from Firebase Console (Step 1.2)
// It's in the firebaseConfig, but you also need it separately
const EXPO_CLIENT_ID = '107165390600-nb7021ovk2s5118vrbdcarj36piilrb5.apps.googleusercontent.com.apps.googleusercontent.com';

/**
 * Hook to setup Google authentication
 * Use this in your SignIn component
 */
export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: EXPO_CLIENT_ID, // Same as web for this method
    androidClientId: EXPO_CLIENT_ID, // Same as web for this method
    webClientId: "107165390600-nb7021ovk2s5118vrbdcarj36piilrb5.apps.googleusercontent.com",
    // Redirect URI for Expo
    redirectUri: makeRedirectUri({
      scheme: 'mealcart', // Your app slug from app.json
      path: 'redirect'
    }),
  });

  return { request, response, promptAsync };
};

/**
 * Sign in to Firebase with Google credential
 */
export const signInWithGoogleCredential = async (idToken: string) => {
  try {
    // Create Firebase credential from Google token
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase
    const userCredential = await signInWithCredential(auth, credential);
    
    return {
      success: true,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      },
    };
  } catch (error: any) {
    console.error('Firebase sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign in with Google',
    };
  }
};

/**
 * Sign out from Firebase
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};