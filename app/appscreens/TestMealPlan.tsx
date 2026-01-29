import { deleteicon, foodimage, iconback, iconedit } from "@/assets/images";
import ConfirmationModal from "@/components/ConfirmationModal";
import GradientText from "@/components/GradientText";
import { hideLoader, showLoader } from "@/components/Loader";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { Plan } from "@/reduxStore/slices/planSlice";
import { pushNavigation } from "@/utils/Navigation";
import { usePlanViewModel } from "@/viewmodels/PlanViewModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestMealPlan({}) {
  const [removePlan, setRemovePlan] = useState(false);
  const [planData, setPlanData] = useState<Plan | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const planId = params.planId as string;

  const { enrichedPlans, fetchPlanById, deletePlan, loading } =
    usePlanViewModel();
  // //   const [planData, setPlanData] = useState<EnrichedPlan | null>(null);
  // const planData: Plan | null = useMemo(() => {
  //   return enrichedPlans.find((p) => p.id === planId) || null;
  // }, [enrichedPlans, planId]);

  // Set planData from enrichedPlans if available, otherwise fetch from API

  useFocusEffect(
    useCallback(() => {
      showLoader();
      const foundPlan = enrichedPlans.find((p) => p.id === planId) || null;
      setPlanData(foundPlan);

      if (!foundPlan && planId) {
        fetchPlanById(
          planId,
          (enrichedPlan) => {
            hideLoader();
            setPlanData(enrichedPlan);
          },
          (error) => {
            hideLoader();
            console.error("Error fetching plan:", error);
          },
        );
      } else {
        hideLoader();
      }
    }, [enrichedPlans, planId]),
  );

  const handleDeletePlan = () => {
    if (planId) {
      deletePlan(
        planId,
        () => {
          setRemovePlan(false);
          router.back();
        },
        (error) => {
          console.error("Error deleting plan:", error);
          setRemovePlan(false);
        },
      );
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  if (loading || !planData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={iconback}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.backText}>{Strings.testMealPlan_backToPlans}</Text>
      </View>

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.planTitle}>
            {planData?.planName || Strings.testMealPlan_title}
          </Text>
          <Text style={styles.planSubTitle}>
            {planData?.startDate
              ? `Started on ${formatDate(planData.startDate)}`
              : Strings.testMealPlan_startedOn}
          </Text>
        </View>
        <View style={styles.editdelete}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              pushNavigation(APP_ROUTES.CreateMealPlan, {
                plan: JSON.stringify(planData),
              });
            }}
          >
            <Image
              source={iconedit}
              resizeMode="contain"
              style={styles.editIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRemovePlan(true)}>
            <Image
              source={deleteicon}
              resizeMode="contain"
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={planData.days.map((day: any) => ({
          title: day.dayTitle,
          data: day.mealSlots,
        }))}
        keyExtractor={(_, index) => index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <View>
            <Text style={styles.dayTitle}>{title}</Text>
            <View style={styles.dividerRow} />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Image
              source={
                item.meal?.imageUrl ? { uri: item.meal.imageUrl } : foodimage
              }
              style={styles.mealImage}
              resizeMode="cover"
            />
            <View style={styles.mealInfo}>
              <GradientText
                text={item.mealPlan?.name || "Meal"}
                startColor={Colors._667D4C}
                endColor={Colors._9DAF89}
                fontSize={moderateScale(12)}
              />
              <Text style={styles.mealName}>
                {item.meal?.name || "Meal Title"}
              </Text>
              <Text style={styles.mealMeta}>
                {item.meal?.prepTime ? `${item.meal.prepTime}` : "N/A"} ·{" "}
                {item.meal?.difficulty || "N/A"}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.sectionListContent}
        showsVerticalScrollIndicator={false}
        style={styles.sectionListStyle}
      />
      <ConfirmationModal
        visible={removePlan}
        title={Strings.testMealPlan_removeTitle}
        description={Strings.testMealPlan_removeDescription}
        cancelText={Strings.testMealPlan_cancel}
        confirmText={Strings.testMealPlan_remove}
        onCancel={() => setRemovePlan(false)}
        onConfirm={() => {
          handleDeletePlan();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalScale(10),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
    marginHorizontal: horizontalScale(10),
  },
  backText: {
    fontSize: moderateScale(14),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginLeft: horizontalScale(30),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
    marginHorizontal: horizontalScale(10),
  },
  planTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
  },
  planSubTitle: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    marginTop: verticalScale(10),
  },
  dayTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginTop: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  mealCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(8),
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  mealImage: {
    width: moderateScale(85),
    height: moderateScale(67),
    borderTopLeftRadius: moderateScale(10),
    borderBottomLeftRadius: horizontalScale(12),
    backgroundColor: Colors._ccc,
  },
  mealInfo: {
    flex: 1,
    paddingVertical: verticalScale(12),
    marginHorizontal: horizontalScale(8),
  },
  mealType: {
    fontSize: moderateScale(12),
    color: Colors._667D4C,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  mealName: {
    fontSize: moderateScale(14),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    marginBottom: verticalScale(3),
  },
  mealMeta: {
    fontSize: moderateScale(10),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  editdelete: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,

    marginTop: verticalScale(2),
    marginBottom: verticalScale(15),
  },
  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "flex-end",
    marginRight: horizontalScale(-11),
  },
  editButton: {
    marginRight: horizontalScale(20),
  },
  editIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "flex-end",
  },
  deleteIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "flex-end",
  },
  sectionListContent: {
    paddingBottom: verticalScale(32),
    marginHorizontal: horizontalScale(10),
  },
  sectionListStyle: {
    marginTop: verticalScale(8),
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});
