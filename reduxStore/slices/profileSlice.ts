// store/slices/profileSlice.ts
import { Strings } from "@/constants/Strings";
import { auth, db } from "@/services/firebase";
import {
  addDocument,
  deleteDocument,
  getAllDocuments,
  getDocumentById,
  queryDocuments,
  setDocumentById,
  updateDocument,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteUser, signOut } from "firebase/auth";
import { deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  ADD_MEAL_PLAN,
  DELETE_MEAL_PLAN,
  FETCH_DIETARY_PREFERENCES,
  FETCH_MEAL_PLANS,
  PROFILE_SLICE,
  UPDATE_MEAL_PLANS_BATCH,
} from "../actionTypes";
import {
  DIETARY_PREFERENCES_COLLECTION,
  MEAL_PLAN_COLLECTION,
} from "../appKeys";

export const fetchDietryPreferencesAsync = createAsyncThunk(
  FETCH_DIETARY_PREFERENCES,
  async (_, { rejectWithValue }) => {
    try {
      const dietaryPreferences = await getAllDocuments(
        DIETARY_PREFERENCES_COLLECTION,
      );

      if (!dietaryPreferences) {
        return rejectWithValue(Strings.error_fetching_dietary_preferences);
      }

      return dietaryPreferences;
    } catch (error: any) {
      return rejectWithValue(
        error.message || Strings.error_fetching_dietary_preferences,
      );
    }
  },
);

export const addMealPlanAsync = createAsyncThunk(
  ADD_MEAL_PLAN,
  async (
    mealPlanData: { uid: string; mealPlans: string[] },
    { rejectWithValue },
  ) => {
    try {
      const { uid, mealPlans } = mealPlanData;
      const createdPlans = [];

      for (const planName of mealPlans) {
        const dataToAdd = {
          uid: uid,
          name: planName,
          createdAt: serverTimestamp(),
        };

        const newMealPlan = await addDocument(MEAL_PLAN_COLLECTION, dataToAdd);

        if (!newMealPlan) {
          return rejectWithValue(Strings.error_adding_meal_plan);
        }

        createdPlans.push(newMealPlan);
      }

      return createdPlans;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_adding_meal_plan);
    }
  },
);

export const deleteMealPlanAsync = createAsyncThunk(
  DELETE_MEAL_PLAN,
  async (mealPlanId: string, { rejectWithValue }) => {
    try {
      await deleteDocument(MEAL_PLAN_COLLECTION, mealPlanId);
      return mealPlanId;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_deleting_meal_plan);
    }
  },
);

export const updateMealPlansBatchAsync = createAsyncThunk(
  UPDATE_MEAL_PLANS_BATCH,
  async (
    mealPlans: Array<{ id: string; name: string }>,
    { rejectWithValue },
  ) => {
    try {
      // Update all meal plans in parallel
      await Promise.all(
        mealPlans.map((plan) =>
          updateDocument(MEAL_PLAN_COLLECTION, plan.id, { name: plan.name }),
        ),
      );
      return mealPlans;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_updating_meal_plan);
    }
  },
);

export const fetchMealPlansAsync = createAsyncThunk(
  FETCH_MEAL_PLANS,
  async (uid: string, { rejectWithValue }) => {
    try {
      const emptyUidPlans = await queryDocuments(
        MEAL_PLAN_COLLECTION,
        "uid",
        "==",
        "",
      );

      // Query 2: Plans matching current user
      const userPlans = await queryDocuments(
        MEAL_PLAN_COLLECTION,
        "uid",
        "==",
        uid,
      );

      // Merge results (max 18 documents: 9 empty + 9 user-specific)
      const allMealPlans = [...(emptyUidPlans || []), ...(userPlans || [])];

      return allMealPlans;
    } catch (error: any) {
      return rejectWithValue(
        error.message || Strings.error_fetching_meal_plans,
      );
    }
  },
);

export interface DietaryPreferences {
  id: number;
  name: string;
}

const initialState = {
  dietaryPreferences: [] as DietaryPreferences[],
  mealPlans: [] as any[],
  loading: false,
  error: null as any,
};

export const deleteAccountAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("profile/deleteAccount", async (_, { rejectWithValue }) => {
  const user = auth.currentUser;

  if (!user) {
    return rejectWithValue("No user is currently logged in");
  }

  const uid = user.uid;

  // The profile doc has to go first: once `deleteUser` succeeds the client is
  // signed out, and `firestore.rules` only lets `users/{uid}` be deleted by
  // that same uid — so a delete deferred until afterwards would be denied.
  //
  // But `deleteUser` refuses with `auth/requires-recent-login` on a session
  // older than a few minutes, which is the common case (people delete from
  // Profile long after signing in). That left the account half-deleted: the
  // auth user survived with no profile doc, so sign-in reported "not
  // registered", sign-up reported "email already in use", and a password reset
  // fixed nothing. Keep a snapshot and put it back if the auth delete fails.
  let snapshot: any = null;
  try {
    snapshot = await getDocumentById("users", uid);
  } catch {
    // A failed read shouldn't block the delete; it only costs us the restore.
  }

  try {
    await deleteDoc(doc(db, "users", uid));
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to delete account");
  }

  try {
    await deleteUser(user);
  } catch (error: any) {
    // Roll the profile doc back so the account stays usable.
    if (snapshot) {
      const { id, ...profile } = snapshot;
      try {
        await setDocumentById("users", uid, profile);
      } catch {}
    }

    return rejectWithValue(
      error?.code === "auth/requires-recent-login"
        ? Strings.profile_deleteAccountReauth
        : error?.message || "Failed to delete account",
    );
  }

  await signOut(auth);

  return;
});
const profileSlice = createSlice({
  name: PROFILE_SLICE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDietryPreferencesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDietryPreferencesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.dietaryPreferences = action.payload as [] as DietaryPreferences[];
        state.error = null;
      })
      .addCase(fetchDietryPreferencesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMealPlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMealPlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans.push(...action.payload);
        state.error = null;
      })
      .addCase(addMealPlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMealPlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMealPlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = state.mealPlans.filter(
          (plan) => plan.id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteMealPlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMealPlansBatchAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMealPlansBatchAsync.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((updatedPlan) => {
          const index = state.mealPlans.findIndex(
            (plan) => plan.id === updatedPlan.id,
          );
          if (index !== -1) {
            state.mealPlans[index].name = updatedPlan.name;
          }
        });
        state.error = null;
      })
      .addCase(updateMealPlansBatchAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMealPlansAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealPlansAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = action.payload;
        state.error = null;
      })
      .addCase(fetchMealPlansAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAccountAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccountAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;

        // Optional: clear user data after account deletion
        state.mealPlans = [];
        state.dietaryPreferences = [];
      })
      .addCase(deleteAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete account";
      });
  },
});

export default profileSlice.reducer;
