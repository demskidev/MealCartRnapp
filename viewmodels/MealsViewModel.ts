import { MEALS_COLLECTION } from "@/reduxStore/appKeys";
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { deleteMeal, fetchUserMeals } from "@/reduxStore/slices/mealsSlice";
import { getDocumentById } from "@/services/firestore";
import { useEffect } from "react";

export const useMealsViewModel = () => {
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meal.meals);
  const loading = useAppSelector((state) => state.meal.loading);
  const error = useAppSelector((state) => state.meal.error);
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    if (userId) {
      fetchMeals();
    }
  }, [dispatch, userId]);

  const fetchMeals = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(fetchUserMeals(userId!));
    if (fetchUserMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const deleteTheMeal = async (
    mealId: string,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(deleteMeal(mealId));
    if (deleteMeal.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const getMealById = async (
    mealId: string,
    onSuccess?: (meal: any) => void,
    onError?: (error: string) => void
  ) => {
    try {
      const meal = await getDocumentById(MEALS_COLLECTION, mealId);
      if (meal) {
        onSuccess?.(meal);
      } else {
        onError?.("Meal not found");
      }
    } catch (e: any) {
      onError?.(e.message);
    }
  };

  return { meals, loading, error, fetchMeals, deleteTheMeal, getMealById };
};
