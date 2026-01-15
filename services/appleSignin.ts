import { USERS_COLLECTION } from '@/reduxStore/appKeys';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase';
import { getDocumentById, setDocumentById } from './firestore';

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
        error: 'Apple Sign In is not available on this device',
      };
    }

    // Get Apple credential
    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('🍎 [Apple Sign-In] Credential:', JSON.stringify(appleCredential, null, 2));

    const { identityToken, email, fullName } = appleCredential;

    if (!identityToken) {
      return {
        success: false,
        error: 'No identity token received from Apple',
      };
    }

    
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
    });

 
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    console.log('🔥 [Firebase] User signed in:', firebaseUser.uid);

   
    const existingUser = await getDocumentById(USERS_COLLECTION, firebaseUser.uid);
    const isNewUser = !existingUser;

  
    let displayName = firebaseUser.displayName || '';
    if (fullName?.givenName || fullName?.familyName) {
      displayName = `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim();
    }

    if (isNewUser) {
  
      const newUserData = {
        email: email || firebaseUser.email || '',
        name: displayName || 'Apple User',
        imageUrl: '', 
        provider: 'apple',
        createdAt: serverTimestamp(),
        uid: firebaseUser.uid,
      };

      console.log('💾 [New User] Saving to Firestore:', JSON.stringify(newUserData, null, 2));
      await setDocumentById(USERS_COLLECTION, firebaseUser.uid, newUserData);

      const savedData = await getDocumentById(USERS_COLLECTION, firebaseUser.uid);
      console.log('✅ [New User] Saved successfully:', JSON.stringify(savedData, null, 2));
    } else {
      console.log('✅ [Existing User] User already exists, skipping Firestore write');
    }

    return {
      success: true,
      user: {
        id: firebaseUser.uid,
        email: email || firebaseUser.email,
        name: displayName || existingUser?.name || 'Apple User',
        imageUrl: null,
        isNewUser,
      },
    };
  } catch (error: any) {
    console.error('🍎 [Apple Sign-In] Error:', error);

    let errorMessage = 'Failed to sign in with Apple';

    if (error.code === 'ERR_REQUEST_CANCELED') {
      errorMessage = 'Sign-in was cancelled';
    } else if (error.code === 'ERR_REQUEST_FAILED') {
      errorMessage = 'Sign-in request failed';
    } else if (error.code === 'ERR_INVALID_RESPONSE') {
      errorMessage = 'Invalid response from Apple';
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
    console.error('Apple sign-out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
};