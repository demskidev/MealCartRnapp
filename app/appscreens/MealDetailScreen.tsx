import Loader from "@/components/Loader";
import MealDetail from "@/components/MealDetail";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { meals, updateMealData, fetchMeals } = useMealsViewModel();

  const mealId = params.mealId as string;
  const hasUpdatedViewTime = useRef(false);
  const hasCheckedMealNotFound = useRef(false); // Prevent multiple alerts

  // Get meal from Redux state
  const meal = useMemo(() => {
    return meals.find((m) => m.id === mealId);
  }, [meals, mealId]);

  // Fetch meals if not already loaded
  useEffect(() => {
    if (meals.length === 0) {
      fetchMeals(
        () => console.log("MealDetailScreen - Meals fetched successfully"),
        (error) => console.error("MealDetailScreen - Error fetching meals:", error)
      );
    }
  }, []);

  // Update lastViewedAt when meal is found
  useEffect(() => {
    if (!meal || hasUpdatedViewTime.current) return;

    hasUpdatedViewTime.current = true;

    const cleanedIngredients = meal.ingredients?.map((ing) => ({
      ingredientId: ing.ingredientId,
      categoryId: ing.categoryId,
    }));

    updateMealData(
      {
        mealData: {
          id: meal.id,
          name: meal.name,
          description: meal.description,
          imageUrl: meal.imageUrl,
          prepTime: meal.prepTime,
          servings: meal.servings,
          difficulty: meal.difficulty,
          category: meal.category,
          ingredients: cleanedIngredients,
          steps: meal.steps,
          lastViewedAt: new Date(),
          uid: meal.uid,
        },
        updateWithIngredients: false,
      },
      () => console.log("MealDetailScreen - Updated lastViewedAt"),
      (error) =>
        console.error("MealDetailScreen - Error updating lastViewedAt:", error)
    );
  }, [meal?.id]);

  // Handle meal not found
  useEffect(() => {
    if (!meal && meals.length > 0 && !hasCheckedMealNotFound.current) {
      hasCheckedMealNotFound.current = true;
      // Alert.alert(
      //   "Meal Not Found",
      //   "This meal could not be found or has been deleted.",
      //   [
      //     {
      //       text: "OK",
      //       onPress: () => router.back(),
      //     },
      //   ],
      //   { cancelable: false }
      // );
    }
  }, [meal, meals.length, router]);

  // Show loader only while fetching initial meals or meal not found yet
  if (!meal) {
    return <Loader visible={true} />;
  }

  return <MealDetail meal={meal} onBack={() => router.back()} />;
}