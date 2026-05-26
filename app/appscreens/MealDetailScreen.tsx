import { hideLoader, showLoader } from "@/components/Loader";
import MealDetail from "@/components/MealDetail";
import { MEALS_COLLECTION } from "@/reduxStore/appKeys";
import { enrichMealsWithIngredients } from "@/reduxStore/slices/mealsSlice";
import { updateDocument } from "@/services/firestore";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { meals, fetchMeals } = useMealsViewModel();

  const mealId = params.mealId as string;
  const hasUpdatedViewTime = useRef(false);
  const hasCheckedMealNotFound = useRef(false);
  const lastEnrichedMealRef = useRef<any>(null);

  const [enrichedMeal, setEnrichedMeal] = useState<any>(null);

  // Get meal from Redux state
  const meal = useMemo(() => {
    return meals.find((m) => m.id === mealId);
  }, [meals, mealId]);

  useEffect(() => {
    if (meals.length === 0) {
      showLoader();
      fetchMeals(
        () => {},
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    if (!meal || hasUpdatedViewTime.current) return;
    hasUpdatedViewTime.current = true;
    updateDocument(MEALS_COLLECTION, meal.id, {
      lastViewedAt: new Date(),
    }).catch(() => {});
  }, [meal?.id]);

  // Fetch & enrich ingredients — re-runs when Redux meal updates (e.g. after edit)
  useEffect(() => {
    if (!meal) return;
    if (lastEnrichedMealRef.current === meal) return;
    lastEnrichedMealRef.current = meal;
    showLoader();

    enrichMealsWithIngredients([meal])
      .then((enriched) => setEnrichedMeal(enriched[0]))
      .catch(() => setEnrichedMeal(meal))
      .finally(() => hideLoader());
  }, [meal]);

  useEffect(() => {
    if (!meal && meals.length > 0 && !hasCheckedMealNotFound.current) {
      hasCheckedMealNotFound.current = true;
      hideLoader();
    }
  }, [meal, meals.length]);

  if (!enrichedMeal) {
    return null;
  }

  return <MealDetail meal={enrichedMeal} onBack={() => router.back()} />;
}
