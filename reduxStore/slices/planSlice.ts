// reduxStore/slices/planSlice.ts
import { Strings } from "@/constants/Strings";
import {
  addDocument,
  compoundQueryDocuments,
  deleteDocument,
  getDocumentById,
  queryDocuments,
  updateDocument,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import {
  ADD_PLAN,
  DELETE_PLAN,
  FETCH_ACTIVE_PLAN,
  FETCH_PLAN_BY_ID,
  FETCH_PLANS,
  UPDATE_PLAN,
} from "../actionTypes";
import { MealStatus, PLANS_COLLECTION } from "../appKeys";

export interface MealSlot {
  mealPlanId: string;
  mealId: string;
}

export interface DayData {
  dayTitle: string;
  date: Date;
  mealSlots: MealSlot[];
}

export interface Plan {
  id: string;
  uid: string;
  planName: string;
  startDate: Date;
  status: string;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  days: DayData[];
}

export interface PlansState {
  plans: Plan[];
  activePlan: Plan | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  activePlan: null,
  loading: false,
  error: null,
};

// --- Active-plan selection helpers ----------------------------------------
// A user may now have several plans in the STARTED state at once (e.g. so they
// can pull a shopping list for an upcoming plan a few days early). The Home
// screen still surfaces a single plan, so `activePlan` is the STARTED plan that
// covers *today* — not simply the first one that happens to be started.
const toJsDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof value.toDate === "function") return value.toDate();
  if (value.seconds != null) return new Date(value.seconds * 1000);
  return new Date(value);
};

const isSameCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// True when one of the plan's days falls on today's calendar date.
const planCoversToday = (plan: any): boolean => {
  if (!plan?.days?.length) return false;
  const now = new Date();
  return plan.days.some((day: any) => {
    const date = toJsDate(day.date);
    return date ? isSameCalendarDay(date, now) : false;
  });
};

// The plan Home shows as "active": the STARTED plan whose schedule includes
// today. Returns null when no started plan is current, so Home shows nothing
// until an upcoming plan's start date actually arrives.
const pickActivePlanForToday = (plans: any): Plan | null => {
  if (!Array.isArray(plans)) return null;
  const started = plans.filter((p) => p?.status === MealStatus.STARTED);
  return (started.find(planCoversToday) as Plan) || null;
};

// Fetch Active Plan
export const fetchActivePlanAsync = createAsyncThunk(
  FETCH_ACTIVE_PLAN,
  async (uid: string, { rejectWithValue }) => {
    try {
      const plans = await queryDocuments(PLANS_COLLECTION, "uid", "==", uid);
      return pickActivePlanForToday(plans);
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_fetching_plans);
    }
  },
);

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
    { rejectWithValue },
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
  },
);

// Fetch Plans
export const fetchPlansAsync = createAsyncThunk(
  FETCH_PLANS,
  async (uid: string, { rejectWithValue }) => {
    try {
      const plans = await compoundQueryDocuments(PLANS_COLLECTION, [
        { field: "uid", op: "==", value: uid },
        { field: "status", op: "!=", value: MealStatus.COMPLETED },
      ]);
      return plans;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_fetching_plans);
    }
  },
);

// Fetch Plan By ID
export const fetchPlanByIdAsync = createAsyncThunk(
  FETCH_PLAN_BY_ID,
  async (planId: string, { rejectWithValue }) => {
    try {
      const plan = await getDocumentById(PLANS_COLLECTION, planId);
      return plan;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_fetching_plans);
    }
  },
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
    { rejectWithValue },
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
        dataToUpdate,
      );
      return updatedPlan;
    } catch (error: any) {
      return rejectWithValue(error.message || Strings.error_updating_plan);
    }
  },
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
  },
);

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    // Add plan locally without API call (for tour/demo purposes)
    addPlanLocally: (state, action) => {
      state.plans.push(action.payload);
      if (action.payload.status === MealStatus.STARTED) {
        state.activePlan = action.payload;
      }
    },
    // Remove tour plan when tour completes
    removeTourPlan: (state) => {
      state.plans = state.plans.filter(
        (plan) => !plan.id.startsWith("tour-plan-"),
      );
    }, // Update plan status locally without API call
    updatePlanLocally: (state, action) => {
      const { id, status } = action.payload;
      const index = state.plans.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.plans[index] = {
          ...state.plans[index],
          status,
          updatedAt: new Date(),
        };
        // Update activePlan if status changed to STARTED
        if (status === MealStatus.STARTED) {
          state.activePlan = state.plans[index];
        } else if (state.activePlan && state.activePlan.id === id) {
          // If the updated plan was the active one but is no longer started, clear activePlan
          state.activePlan = null;
        }
      }
    },
  },
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
        // Recompute which STARTED plan is current for today
        state.activePlan = pickActivePlanForToday(state.plans);
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
        // Surface the STARTED plan that covers today (if any)
        state.activePlan = pickActivePlanForToday(action.payload);
      })
      .addCase(fetchPlansAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Active Plan
      .addCase(fetchActivePlanAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePlanAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.activePlan = action.payload as Plan | null;
      })
      .addCase(fetchActivePlanAsync.rejected, (state, action) => {
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
        // Recompute which STARTED plan is current for today
        state.activePlan = pickActivePlanForToday(state.plans);
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
        // Recompute the active (today's) plan after deletion
        state.activePlan = pickActivePlanForToday(state.plans);
      })
      .addCase(deletePlanAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addPlanLocally, removeTourPlan, updatePlanLocally } =
  plansSlice.actions;
export default plansSlice.reducer;
