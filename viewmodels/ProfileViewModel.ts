// viewmodels/ProfileViewModel.ts
import { INGREDIENTS_CATEGORY_COLLECTION } from "@/reduxStore/appKeys";
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { fetchDietryPreferencesAsync, updateUserAsync } from "@/reduxStore/slices/authSlice";
import { getDocumentById } from "@/services/firestore";
import { useEffect } from "react";

export const useProfileViewModel = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);
  const dietaryPreferences = useAppSelector((state) => state.auth.dietaryPreferences);

  useEffect(() => {
    fetchDietaryPreferences();
  }, []);

  const fetchDietaryPreferences = () => {
    dispatch(fetchDietryPreferencesAsync());
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
    updateUserData,
    fetchDietaryPreferences,
  };
};
