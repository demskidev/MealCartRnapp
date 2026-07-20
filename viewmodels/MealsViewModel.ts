import { MEALS_COLLECTION } from "@/reduxStore/appKeys";
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import {
  deleteMeal,
  enrichMealsWithIngredients,
  fetchAllMeals,
  fetchGlobalMeals,
  fetchRecentMeals,
  fetchUserMeals,
  searchGlobalMeals,
  searchMeals,
  updateMeal,
} from "@/reduxStore/slices/mealsSlice";
import { getDocumentById } from "@/services/firestore";

export const useMealsViewModel = () => {
  const dispatch = useAppDispatch();
  const meals = useAppSelector((state) => state.meal.meals);
  const allMeals = useAppSelector((state) => state.meal.allMeals);
  const globalMeals = useAppSelector((state) => state.meal.globalMeals);
  const recentMeals = useAppSelector((state) => state.meal.recentMeals);

  const loading = useAppSelector((state) => state.meal.loading);
  const error = useAppSelector((state) => state.meal.error);
  const userId = useAppSelector((state) => state.auth.user?.id);

  const searchMealsCombined = async (
    filters: {
      category?: string | null;
      difficulty?: string | null;
      prepTime?: string | null;
      searchText?: string;
      limit?: number;
      startAfter?: any;
    },
    onSuccess?: (meals: any[]) => void,
    onError?: (error: string) => void,
  ) => {
    if (!userId) {
      onError?.("User ID not found");
      return;
    }
    const resultAction = await dispatch(
      searchMeals({
        userId,
        category: filters.category,
        difficulty: filters.difficulty,
        prepTime: filters.prepTime,
        searchText: filters.searchText,
        limit: filters.limit ?? 10,
        startAfter: filters.startAfter ?? null,
      }),
    );
    if (searchMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchMeals = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
    limit: number = 10,
    startAfter: any = null,
  ) => {
    const resultAction = await dispatch(
      fetchUserMeals({ userId: userId!, limit, startAfter }),
    );
    if (fetchUserMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const deleteTheMeal = async (
    mealId: string,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
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
    onError?: (error: string) => void,
  ) => {
    try {
      const meal = await getDocumentById(MEALS_COLLECTION, mealId);
      if (meal) {
        const [enriched] = await enrichMealsWithIngredients([meal]);
        onSuccess?.(enriched || meal);
      } else {
        onError?.("Meal not found");
      }
    } catch (e: any) {
      onError?.(e.message);
    }
  };

  const fetchTheRecentMeals = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
    limit: number = 4,
    startAfter: any = null,
  ) => {
    if (!userId) {
      onError?.("User ID not found");
      return;
    }
    const resultAction = await dispatch(
      fetchRecentMeals({ userId: userId!, limit, startAfter }),
    );
    if (fetchRecentMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updateMealData = async (
    mealData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
  ) => {
    const resultAction = await dispatch(updateMeal(mealData));
    if (updateMeal.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
      fetchTheRecentMeals();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchAllMealsData = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
    limit: number = 10,
    startAfter: any = null,
  ) => {
    const resultAction = await dispatch(fetchAllMeals({ limit, startAfter }));
    if (fetchAllMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const fetchGlobalMealsData = async (
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void,
    limit: number = 10,
    startAfter: any = null,
  ) => {
    const resultAction = await dispatch(fetchGlobalMeals({ limit, startAfter }));
    if (fetchGlobalMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const searchGlobalMealsCombined = async (
    filters: {
      category?: string | null;
      difficulty?: string | null;
      prepTime?: string | null;
      searchText?: string;
      limit?: number;
      startAfter?: any;
    },
    onSuccess?: (meals: any[]) => void,
    onError?: (error: string) => void,
  ) => {
    const resultAction = await dispatch(
      searchGlobalMeals({
        category: filters.category,
        difficulty: filters.difficulty,
        prepTime: filters.prepTime,
        searchText: filters.searchText,
        limit: filters.limit ?? 10,
        startAfter: filters.startAfter ?? null,
      }),
    );
    if (searchGlobalMeals.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  return {
    meals,
    allMeals,
    globalMeals,
    recentMeals,
    loading,
    error,
    searchMealsCombined,
    fetchMeals,
    deleteTheMeal,
    getMealById,
    fetchTheRecentMeals,
    updateMealData,
    fetchAllMeals,
    fetchAllMealsData,
    fetchGlobalMealsData,
    searchGlobalMealsCombined,
  };
};
