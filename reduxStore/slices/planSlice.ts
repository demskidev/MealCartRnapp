// reduxStore/slices/planSlice.ts
import { Strings } from "@/constants/Strings";
import {
  addDocument,
  deleteDocument,
  queryDocuments,
  updateDocument,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import {
  ADD_PLAN,
  DELETE_PLAN,
  FETCH_PLANS,
  UPDATE_PLAN,
} from "../actionTypes";
import { PLANS_COLLECTION } from "../appKeys";

export interface MealSlot {
  mealPlanId: string;
  mealId: string;
}

export interface DayData {
  dayTitle: string;
  date: Timestamp;
  mealSlots: MealSlot[];
}

export interface Plan {
  id: string;
  uid: string;
  planName: string;
  startDate: Timestamp;
  status: string;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  days: DayData[];
}

export interface PlansState {
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  loading: false,
  error: null,
};

// Add Plan
export const addPlanAsync = createAsyncThunk(
  ADD_PLAN,
  async (
    planData: {
      uid: string;
      planName: string;
      startDate: Date;
      endDate: Date;
      status: string;
      days: Array<{
        dayTitle: string;
        date: Date;
        mealSlots: Array<{
          mealPlanId: string;
          mealId: string;
        }>;
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const dataToSave = {
        uid: planData.uid,
        planName: planData.planName,
        startDate: Timestamp.fromDate(planData.startDate),
        endDate: Timestamp.fromDate(planData.endDate),
        status: planData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        days: planData.days.map((day) => ({
          dayTitle: day.dayTitle,
          date: Timestamp.fromDate(day.date),
          mealSlots: day.mealSlots,
        })),
      };

      const newPlan = await addDocument(PLANS_COLLECTION, dataToSave);
      return newPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_adding_plan);
    }
  }
);

// Fetch Plans
export const fetchPlansAsync = createAsyncThunk(
  FETCH_PLANS,
  async (uid: string, { rejectWithValue }) => {
    try {
      const plans = await queryDocuments(PLANS_COLLECTION, "uid", "==", uid);
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_fetching_plans);
    }
  }
);

// Update Plan
export const updatePlanAsync = createAsyncThunk(
  UPDATE_PLAN,
  async (
    planData: {
      id: string;
      planName?: string;
      startDate?: Date;
      status: string;
      endDate?: Date;
      days?: Array<{
        dayTitle: string;
        date: Date;
        mealSlots: Array<{
          mealPlanId: string;
          mealId: string;
        }>;
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      const dataToUpdate: any = {
        updatedAt: serverTimestamp(),
      };

      if (planData.planName) dataToUpdate.planName = planData.planName;
      if (planData.startDate)
        dataToUpdate.startDate = Timestamp.fromDate(planData.startDate);
      if (planData.endDate)
        dataToUpdate.endDate = Timestamp.fromDate(planData.endDate);
      if (planData.days) {
        dataToUpdate.days = planData.days.map((day) => ({
          dayTitle: day.dayTitle,
          date: Timestamp.fromDate(day.date),
          mealSlots: day.mealSlots,
        }));
      }
      if (planData.status) dataToUpdate.status = planData.status;

      const updatedPlan = await updateDocument(
        PLANS_COLLECTION,
        planData.id,
        dataToUpdate
      );
      return updatedPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_updating_plan);
    }
  }
);

// Delete Plan
export const deletePlanAsync = createAsyncThunk(
  DELETE_PLAN,
  async (planId: string, { rejectWithValue }) => {
    try {
      await deleteDocument(PLANS_COLLECTION, planId);
      return planId;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_deleting_plan);
    }
  }
);

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add Plan
      .addCase(addPlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
      })
      .addCase(addPlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Plans
      .addCase(fetchPlansAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlansAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload as Plan[];
      })
      .addCase(fetchPlansAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Plan
      .addCase(updatePlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.plans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
      })
      .addCase(updatePlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Plan
      .addCase(deletePlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default plansSlice.reducer;
