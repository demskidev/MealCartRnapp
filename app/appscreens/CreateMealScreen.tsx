import CreateMealBottomSheet from "@/components/CreateMealBottomSheet";
import { hideLoader, showLoader } from "@/components/Loader";
import { Colors } from "@/constants/Theme";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateMealScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { meals, getMealById } = useMealsViewModel();

  const mode = typeof params.mode === "string" ? params.mode : "create";
  const mealId = typeof params.mealId === "string" ? params.mealId : "";
  const isEdit = mode === "edit";
  const isGlobal = mode === "global";
  // "copy" prefills the sheet from an existing (global) meal but saves a brand
  // new meal owned by the user. Like edit, it needs the source meal loaded.
  const isCopy = mode === "copy";
  const needsSourceMeal = isEdit || isCopy;

  const mealFromStore = useMemo(
    () => (mealId ? meals.find((meal) => meal.id === mealId) : null),
    [mealId, meals],
  );

  const [mealData, setMealData] = useState<any | null>(mealFromStore || null);
  // Tracks the mealId we've already resolved, so we never re-fetch (and
  // re-trigger the loader) on subsequent renders.
  const resolvedMealIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Prefer the store copy when it's available.
    if (mealFromStore) {
      setMealData(mealFromStore);
      resolvedMealIdRef.current = mealId;
      return;
    }

    // Edit mode with a meal that isn't in the store yet (e.g. a global meal, or
    // after an app reload): fetch it exactly once per mealId. Guarding on the
    // ref avoids the fetch -> setState/hideLoader -> re-render -> fetch loop
    // that kept the loader flashing (getMealById is a fresh ref each render).
    if (!needsSourceMeal || !mealId || resolvedMealIdRef.current === mealId) {
      return;
    }
    resolvedMealIdRef.current = mealId;

    showLoader();
    getMealById(
      mealId,
      (meal) => {
        setMealData(meal);
        hideLoader();
      },
      () => {
        hideLoader();
        router.back();
      },
    );
    // getMealById / router are stable enough for a once-per-mealId fetch and are
    // intentionally omitted to keep this effect from re-running every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSourceMeal, mealId, mealFromStore]);

  if (needsSourceMeal && !mealData) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <CreateMealBottomSheet
        isEdit={isEdit}
        isGlobal={isGlobal}
        isCopy={isCopy}
        mealData={mealData}
        onClose={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default CreateMealScreen;
