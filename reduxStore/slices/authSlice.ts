// store/slices/authSlice.ts
import { Strings } from "@/constants/Strings";
import { auth } from "@/services/firebase";
import {
  getDocumentById,
  setDocumentById,
  updateDocument,
  uploadImageToFirebase,
} from "@/services/firestore";
import { waitForAuthReady } from "@/services/waitForAuth";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import {
  AUTH_SLICE,
  CHANGE_PASSWORD,
  CONTINUE_AS_GUEST,
  LOAD_USER_BY_UID,
  LOGIN,
  REGISTER,
  UPDATE_USER,
} from "../actionTypes";
import {
  GUEST_DISPLAY_NAME,
  IS_GUEST_KEY,
  USER_IMAGE_FOLDER,
  USERS_COLLECTION,
} from "../appKeys";
// Utility to map Firebase Auth error codes to user-friendly messages
function getFirebaseAuthErrorMessage(error: any): string {
  switch (error.code) {
    // With email-enumeration protection on (the default for new projects),
    // Firebase returns `invalid-credential` for BOTH an unknown email and a
    // wrong password — `wrong-password` / `user-not-found` are effectively
    // legacy. So this must not claim the account doesn't exist.
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return Strings.invalidCredentials;
    case "auth/user-not-found":
      return Strings.userNotRegistered;
    case "auth/too-many-requests":
      return Strings.tooManyAttempts;
    case "auth/invalid-email":
      return Strings.email;
    case "auth/user-disabled":
      return "User account is disabled";
    // Raised by `linkWithCredential` when the email (or social account) already
    // belongs to a real account. The guest session can't be merged into it, so
    // point them at sign-in rather than showing a raw Firebase message.
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
    case "auth/provider-already-linked":
      return Strings.guest_accountExists;
    // Both mean the sign-in provider is switched off for the Firebase project.
    // Anonymous auth in particular reports `admin-restricted-operation`, which
    // is what "Continue as Guest" hits until Anonymous is enabled under
    // Authentication -> Sign-in method.
    case "auth/operation-not-allowed":
    case "auth/admin-restricted-operation":
      return Strings.guest_signInUnavailable;
    default:
      return error.message || Strings.loginFailed;
  }
}

// Async thunk for login
export const loginAsync = createAsyncThunk(
  LOGIN,
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
      if (userCredential?.user) {
        const authUser = userCredential.user;
        const userUid = authUser.uid;

        const userData = await getDocumentById(USERS_COLLECTION, userUid);

        // The credentials are valid, so the account genuinely exists — a
        // missing profile doc is our own data being out of sync, not a reason
        // to refuse the login. It happens when a write failed mid sign-up, or
        // when a half-completed "Delete Account" removed the doc but left the
        // auth user behind. Rejecting here bricked the account: sign-in said
        // "not registered", sign-up said "email already in use", and a password
        // reset changed nothing. Re-seed the doc instead and let them in.
        if (!userData) {
          await setDocumentById(USERS_COLLECTION, userUid, {
            email: authUser.email || credentials.email.trim().toLowerCase(),
            name: authUser.displayName || "",
            imageUrl: authUser.photoURL || "",
            [IS_GUEST_KEY]: false,
            createdAt: serverTimestamp(),
            uid: userUid,
          });

          const restored = await getDocumentById(USERS_COLLECTION, userUid);
          if (!restored) {
            return rejectWithValue(Strings.userNotRegistered);
          }
          return restored;
        }

        return userData;
      } else {
        return rejectWithValue(Strings.userNotRegistered);
      }
    } catch (error: any) {
      return rejectWithValue(getFirebaseAuthErrorMessage(error));
    }
  },
);

// Async thunk for "Continue as Guest".
//
// Apple guideline 5.1.1(v) forbids requiring registration to reach features
// that aren't account based, so browsing meals and building plans / lists has
// to work without an account. An anonymous Firebase session gives us a real
// `request.auth`, which means `firestore.rules` and every viewmodel that reads
// `state.auth.user.id` keep working unchanged.
//
// The session is device-local: an anonymous uid lives in AsyncStorage and is
// not recoverable on another device or after a reinstall. Upgrading via
// `registerAsync` links credentials onto the SAME uid, so the guest's meals,
// plans and lists carry over.
export const continueAsGuestAsync = createAsyncThunk(
  CONTINUE_AS_GUEST,
  async (_: void, { rejectWithValue }) => {
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // A guest can return to a still-valid anonymous session (the uid is
      // cached), so only seed the profile doc the first time.
      const existingUser = await getDocumentById(USERS_COLLECTION, uid);
      if (!existingUser) {
        await setDocumentById(USERS_COLLECTION, uid, {
          email: "",
          name: GUEST_DISPLAY_NAME,
          [IS_GUEST_KEY]: true,
          createdAt: serverTimestamp(),
          uid,
        });
      }

      const user = await getDocumentById(USERS_COLLECTION, uid);
      return user;
    } catch (error: any) {
      return rejectWithValue(getFirebaseAuthErrorMessage(error));
    }
  },
);

// Async thunk for register
export const registerAsync = createAsyncThunk(
  REGISTER,
  async (
    userData: { email: string; password: string; name?: string },
    { rejectWithValue },
  ) => {
    try {
      const guestUser = auth.currentUser?.isAnonymous ? auth.currentUser : null;

      // Upgrade in place when the user started as a guest: linking keeps the
      // same uid, so everything they already created stays theirs. A brand-new
      // user just gets a fresh account.
      const userCredential = guestUser
        ? await linkWithCredential(
            guestUser,
            EmailAuthProvider.credential(userData.email, userData.password),
          )
        : await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password,
          );

      const uid = userCredential.user.uid;

      const profile = {
        email: userData.email,
        name: userData.name || "",
        [IS_GUEST_KEY]: false,
      };

      if (guestUser) {
        // Merge onto the guest's existing profile doc so preferences, allergies
        // and servings set while browsing aren't wiped by the upgrade.
        await updateDocument(USERS_COLLECTION, uid, profile);
      } else {
        await setDocumentById(USERS_COLLECTION, uid, {
          ...profile,
          createdAt: serverTimestamp(),
        });
      }

      const user = await getDocumentById(USERS_COLLECTION, uid);

      return user;
    } catch (error: any) {
      return rejectWithValue(getFirebaseAuthErrorMessage(error));
    }
  },
);

// Async thunk for loading user by UID (for Google sign-in)
export const loadUserByUidAsync = createAsyncThunk(
  LOAD_USER_BY_UID,
  async (uid: string, { rejectWithValue }) => {
    try {
      const userData = await getDocumentById(USERS_COLLECTION, uid);

      if (!userData) {
        return rejectWithValue("User data not found in Firestore");
      }

      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load user data");
    }
  },
);

const addUserImage = async (imageUrl: string) => {
  try {
    const uploadedImageUrl = await uploadImageToFirebase(
      imageUrl,
      USER_IMAGE_FOLDER + Date.now().toString(),
    );
    return uploadedImageUrl;
  } catch (error) {
    throw error;
  }
};

// ...existing code...
export const updateUserAsync = createAsyncThunk(
  UPDATE_USER,
  async (
    { userId, userData }: { userId: string; userData: any },
    { rejectWithValue },
  ) => {
    try {
      // If there's a new image to upload, handle it. The picker hands us a
      // local file:// URI; upload it to Storage and replace it with the
      // remote https URL so it survives cache clears / reinstalls.
      if (
        userData.imageUrl &&
        typeof userData.imageUrl === "string" &&
        userData.imageUrl.startsWith("file")
      ) {
        const uploadedImageUrl = await addUserImage(userData.imageUrl);

        // Never persist a local file:// URI. If the upload didn't return a
        // usable remote URL, fail loudly instead of saving a broken reference.
        if (
          !uploadedImageUrl ||
          typeof uploadedImageUrl !== "string" ||
          !uploadedImageUrl.startsWith("http")
        ) {
          return rejectWithValue(Strings.updateProfile_imageUploadFailed);
        }

        userData.imageUrl = uploadedImageUrl;
      }
      // Update user data in Firestore and return the updated data
      const updatedUser = await updateDocument(
        USERS_COLLECTION,
        userId,
        userData,
      );
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user data");
    }
  },
);

// ...existing code...
export const changePasswordAsync = createAsyncThunk<
  boolean,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  CHANGE_PASSWORD,
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      // ⏳ WAIT FOR FIREBASE AUTH
      await waitForAuthReady();

      const user = auth.currentUser;

      if (!user || !user.email) {
        return rejectWithValue("Session expired. Please login again.");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.code === "auth/wrong-password"
          ? "Current password is incorrect"
          : error.message,
      );
    }
  },
);

const initialState = {
  isAuthenticated: false,
  // True while the session is an anonymous "Continue as Guest" one. Persisted
  // alongside `isAuthenticated` (the auth slice is the only persisted slice),
  // so a guest who reopens the app stays a guest instead of being bounced to
  // the welcome screen. Account-based features gate on this, not on
  // `isAuthenticated`.
  isGuest: false,
  user: null as any,
  loading: false,
  error: null as any,
};

const authSlice = createSlice({
  name: AUTH_SLICE,
  initialState,
  reducers: {
    markTourCompleted: (state) => {
      if (state.user) {
        state.user.hasCompletedTour = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login async
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isGuest = false;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register async
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isGuest = false;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      // Continue as guest
      .addCase(continueAsGuestAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(continueAsGuestAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isGuest = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(continueAsGuestAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load user by UID (for Google sign-in)
      .addCase(loadUserByUidAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserByUidAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.isGuest = false;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadUserByUidAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user async
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(changePasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { markTourCompleted } = authSlice.actions;
export default authSlice.reducer;
