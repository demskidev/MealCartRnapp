import CreateMealBottomSheet from "@/components/CreateMealBottomSheet";
import { hideLoader, showLoader } from "@/components/Loader";
import { Colors } from "@/constants/Theme";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateMealScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { meals, getMealById } = useMealsViewModel();

  const mode = typeof params.mode === "string" ? params.mode : "create";
  const mealId = typeof params.mealId === "string" ? params.mealId : "";
  const isEdit = mode === "edit";

  const mealFromStore = useMemo(
    () => (mealId ? meals.find((meal) => meal.id === mealId) : null),
    [mealId, meals],
  );

  const [mealData, setMealData] = useState<any | null>(mealFromStore || null);

  useEffect(() => {
    setMealData(mealFromStore || null);
  }, [mealFromStore]);

  useEffect(() => {
    if (!isEdit || !mealId || mealFromStore) {
      return;
    }

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
  }, [getMealById, isEdit, mealFromStore, mealId, router]);

  if (isEdit && !mealData) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <CreateMealBottomSheet
        isEdit={isEdit}
        mealData={mealData}
        onClose={() => router.back()}
      />
    </SafeAreaView>
  );
};

export default CreateMealScreen;
