import { hideLoader, showLoader } from "@/components/Loader";
import MealDetail from "@/components/MealDetail";
import { MEALS_COLLECTION } from "@/reduxStore/appKeys";
import { enrichMealsWithIngredients } from "@/reduxStore/slices/mealsSlice";
import { getDocumentById, updateDocument } from "@/services/firestore";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function MealDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { meals } = useMealsViewModel();

  const mealId = params.mealId as string;
  const hasUpdatedViewTime = useRef(false);

  const [enrichedMeal, setEnrichedMeal] = useState<any>(null);

  // Prefer the meal already in Redux (e.g. the meals list). Meals coming from
  // an active plan ("Your next meal") are not stored there, so we fall back to
  // fetching by id below.
  const reduxMeal = useMemo(() => {
    return meals.find((m) => m.id === mealId);
  }, [meals, mealId]);

  // Load & enrich the meal. Prefers the Redux copy (so edits to meals in the
  // list reflect immediately) and falls back to fetching by id when the meal
  // isn't in Redux — e.g. meals coming from an active plan ("Your next meal"),
  // which would otherwise render a blank screen. Runs on focus so returning
  // from the edit screen always shows fresh data, even for a plan meal that
  // was never added to Redux.
  useFocusEffect(
    useCallback(() => {
      if (!mealId) return;
      let cancelled = false;

      const load = async () => {
        showLoader();
        try {
          const source =
            reduxMeal ?? (await getDocumentById(MEALS_COLLECTION, mealId));
          if (!source) {
            if (!cancelled) setEnrichedMeal(null);
            return;
          }
          const [enriched] = await enrichMealsWithIngredients([source]);
          if (!cancelled) setEnrichedMeal(enriched || source);
        } catch {
          if (!cancelled && reduxMeal) setEnrichedMeal(reduxMeal);
        } finally {
          hideLoader();
        }
      };

      load();

      return () => {
        cancelled = true;
      };
    }, [mealId, reduxMeal]),
  );

  // Record last-viewed time once we have a meal.
  useEffect(() => {
    if (!enrichedMeal || hasUpdatedViewTime.current) return;
    hasUpdatedViewTime.current = true;
    updateDocument(MEALS_COLLECTION, enrichedMeal.id, {
      lastViewedAt: new Date(),
    }).catch(() => {});
  }, [enrichedMeal?.id]);

  if (!enrichedMeal) {
    return null;
  }

  return <MealDetail meal={enrichedMeal} onBack={() => router.back()} />;
}
