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
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import {
  AUTH_SLICE,
  CHANGE_PASSWORD,
  LOAD_USER_BY_UID,
  LOGIN,
  REGISTER,
  UPDATE_USER,
} from "../actionTypes";
import { MEAL_IMAGE_FOLDER, USER_IMAGE_FOLDER, USERS_COLLECTION } from "../appKeys";
// Utility to map Firebase Auth error codes to user-friendly messages
function getFirebaseAuthErrorMessage(error: any): string {
  console.log("Firebase Auth Error:", JSON.stringify(error));
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
      return Strings.userNotRegistered;
    case "auth/wrong-password":
      return Strings.signinFailed;
    case "auth/invalid-email":
      return Strings.email;
    case "auth/user-disabled":
      return "User account is disabled";
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
      console.log("auth user signin", userCredential);
      if (userCredential?.user) {
        const userUid = userCredential.user.uid;

        const userData = await getDocumentById(USERS_COLLECTION, userUid);

        if (!userData) {
          return rejectWithValue(Strings.userNotRegistered);
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

// Async thunk for register
export const registerAsync = createAsyncThunk(
  REGISTER,
  async (
    userData: { email: string; password: string; name?: string },
    { rejectWithValue },
  ) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password,
      );
      const uid = userCredential.user.uid;
      // Store user profile in Firestore
      await setDocumentById(USERS_COLLECTION, uid, {
        email: userData.email,
        name: userData.name || "",
        createdAt: serverTimestamp(),
      });

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

      console.log("✅ [loadUserByUidAsync] User data loaded:", userData);
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
      // If there's a new image to upload, handle it
      if (userData.image && typeof userData.image === "string" && userData.image.startsWith("file")) {
        const uploadedImageUrl = await addUserImage(userData.image);
        userData.image = uploadedImageUrl;
      }
      // Update user data in Firestore and return the updated data
      const updatedUser = await updateDocument(
        USERS_COLLECTION,
        userId,
        userData,
      );
      console.log("upppppppp8888", updatedUser);
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

        state.user = action.payload;
        console.log("User logged in:", action.payload);
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
        state.user = action.payload;
        state.loading = false;
        state.error = null;
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
