// store/slices/authSlice.ts
import { Strings } from "@/constants/Strings";
import { auth } from "@/services/firebase";
import {
  getDocumentById,
  setDocumentById,
  updateDocument,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { AUTH_SLICE, LOGIN, REGISTER, UPDATE_USER } from "../actionTypes";
import { USERS_COLLECTION } from "../appKeys";
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
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
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
  }
);

// Async thunk for register
export const registerAsync = createAsyncThunk(
  REGISTER,
  async (
    userData: { email: string; password: string; name?: string },
    { rejectWithValue }
  ) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
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
  }
);

// Async thunk for updating user data
export const updateUserAsync = createAsyncThunk(
  UPDATE_USER,
  async (
    { userId, userData }: { userId: string; userData: any },
    { rejectWithValue }
  ) => {
    try {
      // Update user data in Firestore and return the updated data
      const updatedUser = await updateDocument(
        USERS_COLLECTION,
        userId,
        userData
      );
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update user data");
    }
  }
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
  reducers: {},
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
      });
  },
});

export default authSlice.reducer;
