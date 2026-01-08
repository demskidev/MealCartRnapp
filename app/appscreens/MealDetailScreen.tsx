import MealDetail from "@/components/MealDetail";
import Loader from "@/components/Loader";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { meals, updateMealData, fetchMeals } = useMealsViewModel();
  
  const mealId = params.mealId as string;

  // Fetch meals if not already loaded
  useEffect(() => {
    if (meals.length === 0) {
      console.log("MealDetailScreen - Fetching meals...");
      fetchMeals(
        () => console.log("MealDetailScreen - Meals fetched successfully"),
        (error) => console.error("MealDetailScreen - Error fetching meals:", error)
      );
    }
  }, []);

  // Get meal from Redux state
  const meal = useMemo(() => {
    const foundMeal = meals.find((m) => m.id === mealId);
    console.log("MealDetailScreen - Looking for meal ID:", mealId);
    console.log("MealDetailScreen - Found meal:", foundMeal?.name);
    console.log("MealDetailScreen - Redux meals count:", meals.length);
    return foundMeal;
  }, [meals, mealId]);

  // Update lastViewedAt when meal is found
  useEffect(() => {
    if (!meal) return;

    const cleanedIngredients = meal.ingredients?.map((ing) => ({
      categoryId: ing.categoryId,
      ingredientId: ing.ingredientId,
    }));

    updateMealData(
      {
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
      () => console.log("MealDetailScreen - Updated lastViewedAt")
    );
  }, [meal?.id]);

  // Only show loader if meals are being fetched AND meal not found yet
  if (!meal && meals.length === 0) {
    return <></>;
  }

  // If meals loaded but this specific meal not found, go back
  if (!meal && meals.length > 0) {
    alert("Meal not found");
    return null;
  }

  return <MealDetail meal={meal} onBack={() => router.back()} />;
}