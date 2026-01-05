// viewmodels/CreateMealViewModel.ts
import { INGREDIENTS_CATEGORY_COLLECTION } from "@/reduxStore/appKeys";
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import { fetchIngredientCategories } from "@/reduxStore/slices/ingredientCategorySlice";
import { addMeal, updateMeal } from "@/reduxStore/slices/mealsSlice";
import { useEffect } from "react";

export const useCreateMealViewModel = () => {
  const dispatch = useAppDispatch();
  const ingredientCategories = useAppSelector(
    (state) => state.ingredientCategory.categories
  );
  const ingredientLoading = useAppSelector(
    (state) => state.ingredientCategory.loading
  );
  const ingredientError = useAppSelector(
    (state) => state.ingredientCategory.error
  );
  const loadingMeal = useAppSelector((state) => state.meal.loading);
  const errorMeal = useAppSelector((state) => state.meal.error);

  useEffect(() => {
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = () => {
    dispatch(fetchIngredientCategories());
  };

  const addMealData = async (
    mealData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(addMeal(mealData));
    if (addMeal.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updateMealData = async (
    mealData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(updateMeal(mealData));
    if (updateMeal.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  return {
    fetchCategories,
    ingredientCategories,
    loading: ingredientLoading || loadingMeal,
    error: ingredientError || errorMeal,
    addMealData,
    updateMealData,
  };
};
