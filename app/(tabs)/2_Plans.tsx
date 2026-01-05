import { activeImage, createlist, gradientclose } from "@/assets/images";
import BaseButton from "@/components/BaseButton";
import ConfirmationModal from "@/components/ConfirmationModal";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useLoader } from "@/context/LoaderContext";
import { useTourStep } from "@/context/TourStepContext";
import { MealStatus } from "@/reduxStore/appKeys";
import { pushNavigation } from "@/utils/Navigation";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { usePlanViewModel } from "@/viewmodels/PlanViewModel";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

const shoppingLists = [
  { id: "1", name: "Test Plan", created: "October 2, 2025", meals: "8 meals" },
  {
    id: "2",
    name: "Test Plan 2",
    created: "October 1, 2025",
    meals: "24 meals",
  },
];
const PlansScreen: React.FC = () => {
  const [pausePlan, setPausePlan] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [zoneReady, setZoneReady] = useState(false);
  const router = useRouter();
  const { start, stop } = useTourGuideController();
  const { setCurrentStepIndex } = useTourStep();
  const { enrichedPlans, loading, fetchPlans, updatePlan } = usePlanViewModel();
  const { getMealById } = useMealsViewModel();
  const { getMealPlanById } = useProfileViewModel();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    fetchPlans(
      () => hideLoader(),
      (error) => {
        hideLoader();
        console.error("❌ Error fetching plans:", error);
      }
    );
    // eslint-disable-next-line
  }, []);

  // Use filteredPlans from viewmodel (date filtering logic is now in the viewmodel)
  const filteredPlans = usePlanViewModel().enrichedPlans;

  const activePlan = filteredPlans.find(
    (plan) => plan.status === MealStatus.STARTED
  );
  const otherPlans = filteredPlans.filter(
    (plan) => plan.status !== MealStatus.STARTED
  );

  console.log("🏆 Active Plan:", activePlan);





  // useFocusEffect(React.useCallback(() => {
  //   if (!zoneReady) return;
  //   setCurrentStepIndex(4);
  //   const timeout = setTimeout(() => { start(1); }, 300);
  //   return () => clearTimeout(timeout);
  // }, [zoneReady]));


  useFocusEffect(
  React.useCallback(() => {
    if (!zoneReady) return;

    const timeout = setTimeout(() => {
      start(5); // 🔥 order 1, zone 1
    }, 100);

    return () => clearTimeout(timeout);
  }, [zoneReady])
);

  useFocusEffect(React.useCallback(() => {
    stop();
    let isActive = true;
    const timeout = setTimeout(() => { if (isActive) { start(); } }, 200);
    return () => { isActive = false; clearTimeout(timeout); };
  }, []));

 
  // Utility to normalize Firestore/JS timestamps to JS Date
  const toDateObject = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (typeof timestamp === "string") {
      return new Date(timestamp);
    } else if (timestamp.toDate) {
      return timestamp.toDate();
    } else if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    } else {
      return new Date(timestamp);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = toDateObject(timestamp);
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTotalMeals = (plan: any) => {
    let total = 0;
    plan.days?.forEach((day: any) => {
      total += day.mealSlots?.length || 0;
    });
    return total;
  };

  const updateThePlan = (plan: any, status: string) => {
    // Prevent starting a plan whose startDate is in the future
    if (status === MealStatus.STARTED) {
      const start = toDateObject(plan.startDate);
      const now = new Date();
      if (start && start > now) {
        alert('You cannot start an upcoming plan.');
        return;
      }
      if (activePlan && activePlan.id !== plan.id) {
        alert("Only one plan can be active at a time.");
        return;
      }
    }
    showLoader();
    updatePlan(
      {
        id: plan.id,
        status: status,
      },
      () => {
        hideLoader();
        showSuccessToast(Strings.plan_updated_successfully);
        // loadPlans()
      },
      (error) => {
        showErrorToast(error || Strings.error_updating_plan);
      }
    );
  };

  const renderShoppingList = ({ item }: { item: any }) => {
    const totalMeals = getTotalMeals(item);
    const startDate = formatDate(item.startDate);
    return (
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>{item.planName}</Text>
        <View style={styles.listItem}>
          <View>
            <Text style={styles.listDate}>
              {item.status === MealStatus.STARTED
                ? Strings.plans_started
                : Strings.plans_created}{" "}
              {startDate}
            </Text>
          </View>

          <Text style={styles.listDate}>
            {totalMeals} {Strings.meals}
          </Text>
        </View>
        <View style={styles.dividerRow} />
        <View style={styles.parentOfMarkDone}>
          <BaseButton
            title={Strings.plans_viewPlan}
            gradientButton={false}
            textColor={Colors.background}
            width={width * 0.43}
            textStyle={styles.addButton}
            textStyleText={styles.addButtonText}
            onPress={() => pushNavigation(APP_ROUTES.TestMealPlan)}
          />
          <BaseButton
            title={
              item.status === MealStatus.PAUSED
                ? Strings.plans_resumePlan
                : Strings.plans_startPlan
            }
            gradientButton={false}
            textColor={Colors.background}
            width={width * 0.43}
            textStyle={
              item.status === MealStatus.PAUSED
                ? styles.resumeButton
                : styles.addButton
            }
            textStyleText={
              item.status === MealStatus.PAUSED
                ? styles.resumeButtonText
                : styles.addButtonText
            }
            onPress={() => updateThePlan(item, MealStatus.STARTED)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View
        style={styles.headerRow}
        onLayout={() => setLayoutReady(true)}
      ></View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{Strings.plans_mealPlans}</Text>

          <TourGuideZone zone={5} shape="circle" maskOffset={10}>
            <View
               collapsable={false}
              style={styles.tourTarget}
               onLayout={() => setZoneReady(true)}
            >
              <TouchableOpacity
                onPress={() => pushNavigation(APP_ROUTES.CreateMealPlan)}
              >
                <Image
                  source={gradientclose}
                  style={styles.gradientCloseImage}
                />
              </TouchableOpacity>
            </View>
          </TourGuideZone>
        </View>
        {!activePlan ? (
          <>
            <View style={styles.noActivePlan}>
              <Text style={styles.noActiveText}>
                {Strings.plans_noActivePlan}
              </Text>
            </View>
            <View style={styles.dividerRowSpaced} />
          </>
        ) : (
          <View style={styles.activeCard}>
            <View style={styles.activeBadge}>
              <Image
                source={activeImage}
                resizeMode="contain"
                style={styles.activeImage}
              />
            </View>
            <Text style={styles.planTitle}>{activePlan.planName}</Text>
            <Text style={styles.planSubTitle}>{Strings.plans_dayOf}</Text>
            <View style={styles.mealBox}>
              <Text style={styles.mealBoxTitle}>
                {Strings.plans_todaysMeal}
              </Text>
              {activePlan &&
                activePlan.days &&
                activePlan.days.length > 0 &&
                (() => {
                  // Find today's date in activePlan.days
                  const today = new Date();
                  const isSameDay = (a: Date, b: Date) =>
                    a.getFullYear() === b.getFullYear() &&
                    a.getMonth() === b.getMonth() &&
                    a.getDate() === b.getDate();

                  const findDay = () => {
                    for (const day of activePlan.days) {
                      if (day.date) {
                        const dayDate = toDateObject(day.date);
                        if (dayDate && isSameDay(dayDate, today)) {
                          return day;
                        }
                      }
                    }
                    return null;
                  };
                  const todayDay = findDay();
                  if (
                    !todayDay ||
                    !todayDay.mealSlots ||
                    todayDay.mealSlots.length === 0
                  ) {
                    return (
                      <Text style={styles.mealValue}>
                        {Strings.plans_notPlanned}
                      </Text>
                    );
                  }
                  return (
                    <View style={styles.mealRow}>
                      {todayDay.mealSlots.map((slot, idx) => (
                        <View key={slot.mealPlanId} style={styles.mealColumn}>
                          <Text style={styles.mealLabelTop}>
                            {slot.mealPlan?.name || `Meal ${idx + 1}`}
                          </Text>
                          <Text style={styles.mealValue}>
                            {slot.meal?.name || Strings.plans_notPlanned}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
            </View>
            <View style={styles.footer}>
              <BaseButton
                title={Strings.plans_getShoppingList}
                gradientButton={true}
                textColor={Colors.background}
                width={width * 0.53}
                textStyle={styles.createButtonText}
                rightChild={
                  <Image
                    source={createlist}
                    resizeMode="contain"
                    style={styles.createListIcon}
                  />
                }
                onPress={() => router.push(APP_ROUTES.LISTS)}
              />
              <BaseButton
                title={Strings.plans_viewPlan}
                gradientButton={false}
                textColor={Colors.background}
                width={width * 0.3}
                textStyle={styles.confirmButton}
                textStyleText={styles.confirmButtonText}
                onPress={() => router.push(APP_ROUTES.TestMealPlan)}
              />
            </View>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => setPausePlan(true)}
            >
              <Text style={styles.pauseText}>{Strings.plans_pausePlan}</Text>
            </TouchableOpacity>
          </View>
        )}
        {otherPlans && otherPlans.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {Strings.plans_yourOtherPlans}
            </Text>

            <FlatList
              data={otherPlans}
              keyExtractor={(item) => item.id}
              renderItem={renderShoppingList}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={pausePlan}
        title={Strings.plans_pauseMealPlan}
        description={Strings.plans_pauseDescription}
        cancelText={Strings.plans_cancel}
        confirmText={Strings.plans_pause}
        onCancel={() => setPausePlan(false)}
        onConfirm={() => {
          if (activePlan) {
            updateThePlan(activePlan, MealStatus.PAUSED);
            setPausePlan(false);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalScale(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: moderateScale(21),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
  },

  activeCard: {
    borderRadius: moderateScale(16),
    borderWidth: moderateScale(1),
    borderColor: Colors._667D4C,
    padding: horizontalScale(18),
    marginBottom: verticalScale(20),
  },
  activeBadge: {
    position: "absolute",
    top: moderateScale(-20),
    right: moderateScale(-6),
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    zIndex: 2,
  },

  planTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginBottom: 2,
  },
  planSubTitle: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    marginTop: verticalScale(8),

    marginBottom: verticalScale(12),
  },
  mealBox: {
    backgroundColor: Colors.boxbackground,
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(18),
  },
  mealBoxTitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginBottom: 6,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width * 0.9,
  },
  mealLabelTop: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    marginVertical: verticalScale(8),
  },
  mealLabel: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
  },
  mealValue: {
    fontSize: moderateScale(12),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  cardBtnRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginRight: 8,
  },
  primaryBtnText: {
    fontSize: 16,
  },

  secondaryBtnText: {
    fontSize: 16,
  },
  pauseText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
    textAlign: "center",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: moderateScale(10),
  },

  otherCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  otherPlanTitle: {
    fontSize: 16,
  },
  otherPlanMeals: {
    fontSize: 13,
  },
  otherPlanDate: {
    fontSize: 13,
    marginBottom: 10,
  },
  otherBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  primaryBtnOutlineText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(18),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    marginRight: horizontalScale(8),
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  confirmButton: {
    borderRadius: moderateScale(8),
    alignItems: "center",
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  confirmButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  createButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    fontSize: moderateScale(16),
  },
  pauseButton: {
    marginTop: verticalScale(10),
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(3),
  },
  listTitle: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  listDate: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.tertiary,
    marginTop: verticalScale(4),
  },
  addButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(3),
    paddingHorizontal: horizontalScale(4),
  },
  resumeButton: {
    backgroundColor: Colors._3A4D25,
    borderColor: Colors._3A4D25,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(3),
    paddingHorizontal: horizontalScale(4),
  },
  addButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  resumeButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    fontSize: moderateScale(14),
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,
    marginVertical: verticalScale(10),
    marginTop: verticalScale(15),
  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(6),
    paddingHorizontal: moderateScale(9),
    marginHorizontal: horizontalScale(2),
    paddingVertical: verticalScale(11),

    elevation: 4,

    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  parentOfMarkDone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  noActivePlan: {
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: verticalScale(35),
  },
  noActiveText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.tertiary,
  },
  addButtonWrapper: {
    width: moderateScale(56),
    height: moderateScale(56),
  },
  tourTarget: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },

  touchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 56,
    height: 56,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
  gradientCloseImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    alignSelf: "flex-end",
    marginRight: horizontalScale(-11),
  },
  dividerRowSpaced: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,
    marginVertical: verticalScale(20),
  },
  activeImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    alignSelf: "flex-end",
    marginRight: horizontalScale(-11),
  },
  mealColumn: {
    flex: 1,
  },
  createListIcon: {
    width: moderateScale(18),
    height: moderateScale(18),
  },
});

export default PlansScreen;
