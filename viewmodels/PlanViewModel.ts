// viewmodels/PlanViewModel.ts
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import {
  addPlanAsync,
  deletePlanAsync,
  fetchActivePlanAsync,
  fetchPlanByIdAsync,
  fetchPlansAsync,
  updatePlanAsync,
} from "@/reduxStore/slices/planSlice";

import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useEffect, useRef, useState } from "react";

// Define types for enriched meal slot, day, and plan
export type EnrichedMealSlot = {
  mealPlanId: string;
  mealId: string;
  meal?: any;
  mealPlan?: any;
};
export type EnrichedDay = {
  dayTitle: string;
  date: any;
  mealSlots: EnrichedMealSlot[];
};
export type EnrichedPlan = {
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

  // Enrichment resolves every meal slot into its meal + mealPlan document, one
  // Firestore read each. Without a cache that is redone in full every time the
  // `plans` array changes identity — including for a pause/resume, which only
  // flips `status` and cannot possibly have changed any meal. For a few week-long
  // plans that is ~100 reads and a visible multi-second stall after the
  // confirmation popup closes.
  //
  // These caches make a status change cost zero reads (everything is already
  // resolved from the load that populated the screen), and they also dedupe meals
  // shared between plans on the first pass. They are per-hook-instance and are
  // cleared by `fetchPlans`, so entering the screen and pull-to-refresh still get
  // fresh documents — only in-place updates reuse them.
  const mealCache = useRef(new Map<string, any>());
  const mealPlanCache = useRef(new Map<string, any>());

  const clearEnrichmentCache = () => {
    mealCache.current.clear();
    mealPlanCache.current.clear();
  };

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

  /**
   * Resolves ids to documents, reading through `cache`. A miss is fetched once
   * and remembered; a hit costs nothing. `null` results are cached too, so a
   * deleted meal doesn't get re-requested on every pass.
   */
  const fetchThroughCache = async (
    ids: string[],
    cache: Map<string, any>,
    fetchOne: (
      id: string,
      onSuccess: (doc: any) => void,
      onError: () => void,
    ) => void,
  ): Promise<Record<string, any>> => {
    const missing = ids.filter((id) => !cache.has(id));

    await Promise.all(
      missing.map(
        (id) =>
          new Promise<void>((resolve) =>
            fetchOne(
              id,
              (doc) => {
                cache.set(id, doc ?? null);
                resolve();
              },
              () => {
                cache.set(id, null);
                resolve();
              },
            ),
          ),
      ),
    );

    return Object.fromEntries(ids.map((id) => [id, cache.get(id) ?? null]));
  };

  const fetchMealsMap = (mealIds: string[]) =>
    fetchThroughCache(mealIds, mealCache.current, getMealById);

  const fetchMealPlansMap = (mealPlanIds: string[]) =>
    fetchThroughCache(mealPlanIds, mealPlanCache.current, getMealPlanById);

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
      // Both guarded: a superseded run must not clear the flag while the run
      // that replaced it is still going, or the busy indicator flickers off.
      if (!cancelled) {
        setEnrichedPlans(all);
        setEnriching(false);
      }
    };
    if (plans && plans.length > 0) {
      enrich();
    } else {
      setEnrichedPlans([]);
      // Nothing to enrich — clear the flag a cancelled run may have left set.
      setEnriching(false);
    }
    return () => {
      cancelled = true;
    };
  }, [plans]);

  const fetchActivePlan = async (
    onSuccess?: (enrichedPlan: EnrichedPlan | null) => void,
    onError?: (error: string) => void,
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
    onError?: (error: string) => void,
  ) => {
    if (!userId) {
      onError?.("User not found");
      return;
    }
    const resultAction = await dispatch(
      addPlanAsync({
        uid: userId,
        ...planData,
      }),
    );
    if (addPlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchPlans = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
  ) => {
    if (!userId) {
      onError?.("User not found");
      return;
    }
    // An explicit (re)load is the point at which the user expects fresh meal
    // data — e.g. after editing a meal — so drop the enrichment caches here.
    clearEnrichmentCache();
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
    onError?: (error: string) => void,
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
    onError?: (error: string) => void,
  ) => {
    const resultAction = await dispatch(deletePlanAsync(planId));
    if (deletePlanAsync.fulfilled.match(resultAction)) {
      // If the deleted plan was the active plan, clear it
      if (activePlan && activePlan.id === planId) {
        setEnrichedActivePlan(null);
      }
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchPlanById = async (
    planId: string,
    onSuccess?: (enrichedPlan: EnrichedPlan | null) => void,
    onError?: (error: string) => void,
  ) => {
    const resultAction = await dispatch(fetchPlanByIdAsync(planId));
    if (fetchPlanByIdAsync.fulfilled.match(resultAction)) {
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
    fetchPlanById,
  };
};
