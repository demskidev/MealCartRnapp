// viewmodels/PlanViewModel.ts
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import {
    addPlanAsync,
    deletePlanAsync,
    fetchActivePlanAsync,
    fetchPlansAsync,
    updatePlanAsync,
} from "@/reduxStore/slices/planSlice";


import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useEffect, useState } from "react";

// Define types for enriched meal slot, day, and plan
type EnrichedMealSlot = {
  mealPlanId: string;
  mealId: string;
  meal?: any;
  mealPlan?: any;
};
type EnrichedDay = {
  dayTitle: string;
  date: any;
  mealSlots: EnrichedMealSlot[];
};
type EnrichedPlan = {
  id: string;
  uid: string;
  planName: string;
  startDate: any;
  status: string;
  endDate: any;
  createdAt: any;
  updatedAt: any;
  days: EnrichedDay[];
};

export const usePlanViewModel = () => {
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.plans.plans);
  const loading = useAppSelector((state) => state.plans.loading);
  const error = useAppSelector((state) => state.plans.error);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { getMealById } = useMealsViewModel();
  const { getMealPlanById } = useProfileViewModel();
  const [enrichedPlans, setEnrichedPlans] = useState<EnrichedPlan[]>([]);
  const [enriching, setEnriching] = useState(false);
  const activePlan = useAppSelector((state) => state.plans.activePlan);

  const [enrichedActivePlan, setEnrichedActivePlan] =
    useState<EnrichedPlan | null>(null);

  useEffect(() => {
    let cancelled = false;
    const enrich = async () => {
      if (activePlan) {
        const enriched = await enrichPlan(activePlan);
        if (!cancelled) setEnrichedActivePlan(enriched);
      } else {
        setEnrichedActivePlan(null);
      }
    };
    enrich();
    return () => {
      cancelled = true;
    };
  }, [activePlan]);

  // Helper to parse Firestore/JS date
  const parseDate = (d: any) => {
    if (!d) return null;
    if (typeof d === "string") return new Date(d);
    if (d.toDate) return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    return new Date(d);
  };
  // Today's date (for filtering)
  const today = new Date();

  //   // Only show plans whose startDate <= today and endDate >= today
  //   const filteredPlans = enrichedPlans.filter(plan => {
  //     const start = parseDate(plan.startDate);
  //     const end = parseDate(plan.endDate);
  //     if (!start || !end) return false;
  //     return start <= today && end >= today;
  //   });

  // Enrich plans with meal and mealPlan data whenever plans change

  // --- Helper functions for enrichment ---
  const collectMealAndPlanIds = (plan: EnrichedPlan) => {
    const mealIds = new Set<string>();
    const mealPlanIds = new Set<string>();
    plan.days.forEach((day: EnrichedDay) => {
      day.mealSlots.forEach((slot: EnrichedMealSlot) => {
        mealIds.add(slot.mealId);
        mealPlanIds.add(slot.mealPlanId);
      });
    });
    return {
      mealIds: Array.from(mealIds),
      mealPlanIds: Array.from(mealPlanIds),
    };
  };

  const fetchMealsMap = async (
    mealIds: string[]
  ): Promise<Record<string, any>> => {
    const mealPromises = mealIds.map(
      (id: string) =>
        new Promise<[string, any]>((resolve) =>
          getMealById(
            id,
            (meal) => resolve([id, meal]),
            () => resolve([id, null])
          )
        )
    );
    const mealResults = await Promise.all(mealPromises);
    return Object.fromEntries(mealResults);
  };

  const fetchMealPlansMap = async (
    mealPlanIds: string[]
  ): Promise<Record<string, any>> => {
    const mealPlanPromises = mealPlanIds.map(
      (id: string) =>
        new Promise<[string, any]>((resolve) =>
          getMealPlanById(
            id,
            (mealPlan) => resolve([id, mealPlan]),
            () => resolve([id, null])
          )
        )
    );
    const mealPlanResults = await Promise.all(mealPlanPromises);
    return Object.fromEntries(mealPlanResults);
  };

  const enrichPlan = async (plan: EnrichedPlan): Promise<EnrichedPlan> => {
    const { mealIds, mealPlanIds } = collectMealAndPlanIds(plan);
    const [mealMap, mealPlanMap] = await Promise.all([
      fetchMealsMap(mealIds),
      fetchMealPlansMap(mealPlanIds),
    ]);
    const enrichedDays = plan.days.map((day: EnrichedDay) => ({
      ...day,
      mealSlots: day.mealSlots.map((slot: EnrichedMealSlot) => ({
        ...slot,
        meal: mealMap[slot.mealId] || null,
        mealPlan: mealPlanMap[slot.mealPlanId] || null,
      })),
    }));
    return { ...plan, days: enrichedDays };
  };

  useEffect(() => {
    let cancelled = false;
    const enrich = async () => {
      setEnriching(true);
      const all = await Promise.all(plans.map((plan) => enrichPlan(plan)));
      if (!cancelled) setEnrichedPlans(all);
      setEnriching(false);
    };
    if (plans && plans.length > 0) enrich();
    else setEnrichedPlans([]);
    return () => {
      cancelled = true;
    };
  }, [plans]);

  const fetchActivePlan = async (
    onSuccess?: (enrichedPlan: EnrichedPlan | null) => void,
    onError?: (error: string) => void
  ) => {
    if (!userId) {
      onError?.("User not found");
      return;
    }
    const resultAction = await dispatch(fetchActivePlanAsync(userId));
    if (fetchActivePlanAsync.fulfilled.match(resultAction)) {
      const plan = resultAction.payload;
      if (plan) {
        const enriched = await enrichPlan(plan as EnrichedPlan);
        onSuccess?.(enriched);
      } else {
        onSuccess?.(null);
      }
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const addPlan = async (
    planData: {
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
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    if (!userId) {
      onError?.("User not found");
      return;
    }
    const resultAction = await dispatch(
      addPlanAsync({
        uid: userId,
        ...planData,
      })
    );
    if (addPlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchPlans = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    console.log("Fetching plans for user:", userId);
    if (!userId) {
      onError?.("User not found");
      return;
    }
    const resultAction = await dispatch(fetchPlansAsync(userId));
    if (fetchPlansAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updatePlan = async (
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
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(updatePlanAsync(planData));
    if (updatePlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const deletePlan = async (
    planId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(deletePlanAsync(planId));
    if (deletePlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  // Returns the first active plan (status STARTED) from filteredPlans

  return {
    plans,
    enrichedPlans,
    // filteredPlans,
    enrichedActivePlan,
    loading: loading || enriching,
    error,
    addPlan,
    fetchPlans,
    updatePlan,
    deletePlan,
    fetchActivePlan,
  };
};
