// viewmodels/ProfileViewModel.ts
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { updateUserAsync } from "@/reduxStore/slices/authSlice";
import {
    addMealPlanAsync,
    deleteMealPlanAsync,
    fetchDietryPreferencesAsync,
    fetchMealPlansAsync,
    updateMealPlanAsync,
    updateMealPlansBatchAsync
} from "@/reduxStore/slices/profileSlice";

export const useProfileViewModel = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const dietaryPreferences = useAppSelector((state) => state.profile.dietaryPreferences);
  const mealPlans = useAppSelector((state) => state.profile.mealPlans);
  const profileLoading = useAppSelector((state) => state.profile.loading);
  const profileError = useAppSelector((state) => state.profile.error);

  const fetchDietaryPreferences = async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(fetchDietryPreferencesAsync());
    if (fetchDietryPreferencesAsync.fulfilled.match(resultAction)) {
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchMealPlans = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    if (!user?.id) {
      onError?.("User not found");
      return;
    }

    const resultAction = await dispatch(fetchMealPlansAsync(user.id));
    if (fetchMealPlansAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const addMealPlans = async (
    mealPlans: string[],
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    if (!user?.id) {
      onError?.("User not found");
      return;
    }

    const resultAction = await dispatch(
      addMealPlanAsync({ uid: user.id, mealPlans })
    );
    if (addMealPlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const deleteMealPlan = async (
    mealPlanId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(deleteMealPlanAsync(mealPlanId));
    if (deleteMealPlanAsync.fulfilled.match(resultAction)) {
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updateMealPlans = async (
    mealPlans: Array<{ id: string; name: string }>,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(
      updateMealPlansBatchAsync(mealPlans)
    );
    if (updateMealPlansBatchAsync.fulfilled.match(resultAction)) {
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updateUserData = async (
    userData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    if (!user?.id) {
      onError?.("User not found");
      return;
    }

    const resultAction = await dispatch(
      updateUserAsync({ userId: user.id, userData })
    );
    if (updateUserAsync.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  

  return {
    user,
    loading,
    error,
    dietaryPreferences,
    mealPlans,
    profileLoading,
    profileError,
    updateUserData,
    fetchDietaryPreferences,
    fetchMealPlans,
    addMealPlans,
    deleteMealPlan,
    updateMealPlans,
  };
};
