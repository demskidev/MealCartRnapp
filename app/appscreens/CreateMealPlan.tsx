import { calendaricon, closeIcon, iconback, plusmeal } from "@/assets/images";
import { IconCartWhite } from "@/assets/svg";
import AddItemToList from "@/components/AddItemToList";
import BaseButton from "@/components/BaseButton";
import CustomDateTimePicker from "@/components/DateTimePicker";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useLoader } from "@/context/LoaderContext";
import { CREATE_MEAL_PLAN, MealStatus } from "@/reduxStore/appKeys";
import { useAppSelector } from "@/reduxStore/hooks";
import { DayData, MealSlot } from "@/reduxStore/slices/planSlice";
import { backNavigation } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import { usePlanViewModel } from "@/viewmodels/PlanViewModel";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
const meals = ["Breakfast", "Lunch", "Dinner"];
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

interface SelectedMealSlot {
  dayTitle: string;
  mealPlanName: string;
  meal: any;
}

export default function CreateMealPlan({}) {
  const router = useRouter();
  const { mealPlans, fetchMealPlans, profileLoading } = useProfileViewModel();
  const { addPlan, loading: planLoading } = usePlanViewModel();
  const { showLoader, hideLoader } = useLoader();

  const user = useAppSelector((state) => state.auth.user);

  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addToListVisible, setAddToListVisible] = useState(false);
  const [selectedMealSlots, setSelectedMealSlots] = useState<
    Record<string, any>
  >({});
  const [currentSlot, setCurrentSlot] = useState<{
    dayTitle: string;
    mealPlanName: string;
  } | null>(null);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const formatDisplayDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const getDayName = (dayIndex: number) => {
    const dayNames = [
      Strings.days.sunday,
      Strings.days.monday,
      Strings.days.tuesday,
      Strings.days.wednesday,
      Strings.days.thursday,
      Strings.days.friday,
      Strings.days.saturday,
    ];
    return dayNames[dayIndex];
  };

  const generateWeekDays = (selectedDate: Date) => {
    const days = [];
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days remaining in the week (until Sunday)
    // If Sunday (0), that's the end of week, so 0 days remaining
    // If Monday (1), 6 days remaining, etc.
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    const sortedMealPlans = [...mealPlans].sort((a, b) => {
      // Handle cases where createdAt might be undefined
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });

    // Get meal plan names from fetched meal plans
    const mealPlanNames =
      sortedMealPlans.length > 0
        ? sortedMealPlans.map((plan) => plan.name)
        : [Strings.plans_breakfast, Strings.plans_lunch, Strings.plans_dinner];

    for (let i = 0; i <= daysUntilSunday; i++) {
      const currentDate = new Date(selectedDate);
      currentDate.setDate(selectedDate.getDate() + i);

      days.push({
        title: getDayName(currentDate.getDay()),
        date: currentDate,
        meals: mealPlanNames,
      });
    }

    return days;
  };

  const handleMealBoxPress = (dayTitle: string, mealPlanName: string) => {
    const slotKey = `${dayTitle}-${mealPlanName}`;
    const existingMeal = selectedMealSlots[slotKey];

    // Don't open modal if a meal is already selected
    if (existingMeal) {
      return;
    }

    setCurrentSlot({ dayTitle, mealPlanName });
    setAddToListVisible(true);
  };

  const handleMealSelect = (meal: any) => {
    if (currentSlot) {
      const slotKey = `${currentSlot.dayTitle}-${currentSlot.mealPlanName}`;
      setSelectedMealSlots((prev) => ({
        ...prev,
        [slotKey]: meal,
      }));
    }
  };

  const getSelectedMeal = (dayTitle: string, mealPlanName: string) => {
    const slotKey = `${dayTitle}-${mealPlanName}`;
    return selectedMealSlots[slotKey];
  };

  const days = generateWeekDays(startDate);

  function renderDayCard({ item }: { item: any }) {
    const formattedDate = `${item.date.getDate()}/${
      item.date.getMonth() + 1
    }/${item.date.getFullYear()}`;

    return (
      <View style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{item.title}</Text>
          <Text style={styles.dayDate}>{formattedDate}</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.mealRow}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* {item.meals.map((meal, idx) => (
            <View key={meal + idx} style={styles.mealCol}>
              <Text style={styles.mealLabel}>{meal}</Text>
              <TouchableOpacity
                style={styles.mealBox}
                onPress={() => setAddToListVisible(true)}
              >
                <Image
                  source={plusmeal}
                  resizeMode="contain"
                  style={styles.plusMealIcon}
                />
              </TouchableOpacity>
            </View>
          ))} */}
          {item.meals.map((mealPlanName: string, idx: number) => {
            const selectedMeal = getSelectedMeal(item.title, mealPlanName);

            return (
              <View key={mealPlanName + idx} style={styles.mealCol}>
                <Text style={styles.mealLabel}>{mealPlanName}</Text>
                <TouchableOpacity
                  style={[
                    styles.mealBox,
                    selectedMeal && styles.mealBoxWithMeal,
                  ]}
                  onPress={() => handleMealBoxPress(item.title, mealPlanName)}
                >
                  {selectedMeal ? (
                    <View style={styles.selectedMealContent}>
                      <Text
                        style={styles.selectedMealName}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {selectedMeal.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeMealIcon}
                        onPress={(e) => {
                          const slotKey = `${item.title}-${mealPlanName}`;
                          setSelectedMealSlots((prev) => {
                            const updated = { ...prev };
                            delete updated[slotKey];
                            return updated;
                          });
                        }}
                      >
                        <Image
                          source={closeIcon}
                          style={styles.closeIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Image
                      source={plusmeal}
                      resizeMode="contain"
                      style={styles.plusMealIcon}
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // const saveMealPlan = () => {
  //   const getMealPlanId = (mealPlanName: string) => {
  //     const plan = mealPlans.find((p) => p.name === mealPlanName);
  //     return plan?.id;
  //   };

  //   const daysData = days.map((day) => {
  //     const mealSlots = day.meals
  //       .map((mealPlanName) => {
  //         const selectedMeal = getSelectedMeal(day.title, mealPlanName);
  //         if (!selectedMeal) return null;

  //         return {
  //           mealPlanId: getMealPlanId(mealPlanName)!,
  //           mealId: selectedMeal.id,
  //         };
  //       })
  //       .filter(Boolean) as Array<{ mealPlanId: string; mealId: string }>;

  //     return {
  //       dayTitle: day.title,
  //       date: day.date,
  //       mealSlots,
  //     };
  //   });

  //   const lastDay = days[days.length - 1];

  //   addPlan(
  //     {
  //       planName: Strings.createMealPlan_mySpecialMealPlan,
  //       startDate: startDate,
  //       endDate: lastDay.date,
  //       days: daysData,
  //     },
  //     () => {
  //       showSuccessToast(Strings.plan_saved_successfully);
  //       pushNavigation(APP_ROUTES.LISTS);
  //     },
  //     (error) => {
  //       showErrorToast(error || Strings.error_adding_plan);
  //     }
  //   );
  // };

  const saveMealPlan = () => {
    console.log("=== SAVE MEAL PLAN STARTED ===");
    console.log("1. Start Date:", startDate);
    console.log("2. Days array:", days);
    console.log("3. Selected Meal Slots:", selectedMealSlots);
    console.log("4. Meal Plans:", mealPlans);

    // Validation: Ensure at least one meal is selected for the entire week
    const anyMealSelected = Object.keys(selectedMealSlots).length > 0;

    if (planName.trim() === "") {
      alert(Strings.error_enter_plan_name);
      return;
    }

    if (!anyMealSelected) {
      alert(Strings.error_select_meal_for_any_day);
      return;
    }

    showLoader();

    const getMealPlanId = (mealPlanName: string) => {
      const plan = mealPlans.find((p) => p.name === mealPlanName);
      console.log(`  Finding plan for "${mealPlanName}":`, plan?.id);
      return plan?.id;
    };

    const daysData = days
      .map((day) => {
        const mealSlots = day.meals
          .map((mealPlanName: string) => {
            const selectedMeal = getSelectedMeal(day.title, mealPlanName);
            if (!selectedMeal) return null;
            const mealPlanId = getMealPlanId(mealPlanName);
            return {
              mealPlanId: mealPlanId!,
              mealId: selectedMeal.id,
            };
          })
          .filter(Boolean) as Array<{ mealPlanId: string; mealId: string }>;

        if (mealSlots.length === 0) return null;

        return {
          dayTitle: day.title,
          date: day.date,
          mealSlots,
        };
      })
      .filter((daySlot): daySlot is DayData => daySlot !== null);
    const lastDay = days[days.length - 1];
    console.log("\n5. Last Day:", lastDay);
    console.log("6. Days Data to save:", JSON.stringify(daysData, null, 2));

    const planPayload = {
      planName: planName || Strings.unknown_plan,
      startDate: startDate,
      endDate: lastDay.date,
      status: MealStatus.CREATED,
      days: daysData,
    };
    console.log("\n7. Final Payload:", JSON.stringify(planPayload, null, 2));

    console.log("\n8. Calling addPlan...");
    addPlan(
      planPayload,
      (response) => {
        hideLoader();
        console.log("✅ SUCCESS - Plan saved:", response);
        showSuccessToast(Strings.plan_saved_successfully);
        backNavigation();
      },
      (error) => {
        hideLoader();
        console.error("❌ ERROR - Failed to save plan:", error);
        showErrorToast(error || Strings.error_adding_plan);
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={iconback}
            resizeMode="contain"
            style={styles.backIconImage}
          />
        </TouchableOpacity>
        <Text style={styles.backText}>
          {Strings.createMealPlan_backToPlans}
        </Text>
      </View>
      <Text style={styles.label}>{Strings.createMealPlan_yourMealPlan}</Text>
      <TextInput
        style={styles.input}
        placeholder={Strings.createMealPlan_mySpecialMealPlan}
        placeholderTextColor={Colors.tertiary}
        value={planName}
        onChangeText={setPlanName}
      />

      <Text style={styles.label}>{Strings.createMealPlan_startingDate}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.dateInput}
          value={formatDisplayDate(startDate)}
          editable={false}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Image
            source={calendaricon}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <CustomDateTimePicker
        mode="date"
        value={startDate}
        visible={showDatePicker}
        onChange={(date) => {
          setStartDate(date);
        }}
        onClose={() => setShowDatePicker(false)}
      />
      <FlatList
        data={days}
        keyExtractor={(item) => item.title}
        renderItem={renderDayCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.parentOfConfirmButton}>
        <BaseButton
          title={Strings.createMealPlan_discard}
          gradientButton={false}
          backgroundColor={Colors.white}
          width={width * 0.28}
          textStyle={styles.discardButton}
          textColor={Colors.error}
          textStyleText={styles.discardText}
          onPress={() => backNavigation()}
        />
        <BaseButton
          title={Strings.createMealPlan_save}
          gradientButton={true}
          width={width * 0.65}
          gradientStartColor={Colors._667D4C}
          gradientEndColor={Colors._9DAF89}
          gradientStart={{ x: 0, y: 0 }}
          gradientEnd={{ x: 1, y: 0 }}
          textColor={Colors.white}
          rightChild={
            <IconCartWhite
              width={verticalScale(21)}
              height={verticalScale(21)}
            />
          }
          textStyle={[styles.confirmButton]}
          textStyleText={styles.saveShopping}
          onPress={saveMealPlan}
        />
      </View>

      <AddItemToList
        visible={addToListVisible}
        onClose={() => setAddToListVisible(false)}
        from={CREATE_MEAL_PLAN}
        onMealSelect={(meal) => {
          console.log("Selected meal:", meal);
          handleMealSelect(meal);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalScale(20),
  },

  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    fontSize: moderateScale(14),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginLeft: horizontalScale(30),
  },

  label: {
    fontSize: moderateScale(12),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    marginBottom: verticalScale(6),
    marginTop: verticalScale(8),
  },
  input: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    height: verticalScale(50),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(10),
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingVertical: verticalScale(12),
    paddingRight: horizontalScale(10),
    height: verticalScale(50),
  },
  calendarIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  daySection: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    elevation: 4,

    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  dayTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  dayDate: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  mealRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    justifyContent: "space-between",
  },
  mealCol: {},
  mealLabel: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    marginBottom: verticalScale(6),
  },
  mealBox: {
    width: width * 0.24,
    height: moderateScale(40),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    borderColor: Colors.tertiary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  mealBoxWithMeal: {
    borderStyle: "solid",
    borderColor: Colors.borderColor,
    padding: moderateScale(4),
  },
  plus: {
    fontSize: moderateScale(22),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  cancelButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,

    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  parentOfConfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(55),
    marginHorizontal: moderateScale(-5),
  },
  discardText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
  },
  saveShopping: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  confirmButton: {
    color: Colors.white,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(13),
  },
  plusMealIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "center",
  },
  backIconImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "flex-end",
    marginRight: horizontalScale(-11),
  },
  dateInput: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingHorizontal: horizontalScale(12),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    height: verticalScale(50),
    flex: 1,
    paddingVertical: 0,
  },
  flatListContent: {
    paddingBottom: 32,
  },
  discardButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    color: Colors.error,
  },
  selectedMealContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: horizontalScale(4),
  },
  removeMealIcon: {
    padding: moderateScale(2),
  },
  closeIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
  },
  selectedMealImage: {
    width: "100%",
    height: moderateScale(50),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(4),
  },
  selectedMealName: {
    fontSize: moderateScale(10),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.primary,
    textAlign: "center",
    paddingHorizontal: horizontalScale(2),
  },
});
