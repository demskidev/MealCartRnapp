import {
    deleteicon,
    icon_edit,
    iconback,
    plusblackicon,
    tikicon,
} from "@/assets/images";
import BaseButton from "@/components/BaseButton";
import Loader from "@/components/Loader";
import {
    horizontalScale,
    moderateScale,
    verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useProfileViewModel } from "@/viewmodels/ProfileViewModel";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

export default function MealPlanSettings({ navigation }: { navigation: any }) {
  const [removePlan, setRemovePlan] = useState(false);
  const router = useRouter();
  const {
    mealPlans,
    fetchMealPlans,
    addMealPlans,
    profileLoading,
    deleteMealPlan,
    updateMealPlan,
    updateMealPlans,
  } = useProfileViewModel();

  const [fixedMeals, setFixedMeals] = useState<string[]>([]);
  const [mealTypes, setMealTypes] = useState<
    Array<{
      id: string;
      label: string;
      isEditing: boolean;
      isNew: boolean;
      isModified: boolean;
    }>
  >([]);

  const MAX_TOTAL_MEALS = 9;
  const MAX_USER_MEALS = MAX_TOTAL_MEALS - fixedMeals.length;

  const [addMore, setAddMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMealPlans();
  }, [mealPlans]);

  const processMealPlans = (data: any[]) => {
    const fixedPlans = data
      .filter((plan: any) => !plan.uid || plan.uid === "")
      .map((plan: any) => plan.name);
    const userPlans = data
      .filter((plan: any) => plan.uid && plan.uid !== "")
      .map((plan: any) => ({
        id: plan.id,
        label: plan.name,
        isEditing: false,
        isNew: false,
        isModified: false,
      }));

    // sorting fixed meals as in order of Breakfast, Lunch, Dinner
    const mealOrder = [
      Strings.plans_breakfast,
      Strings.plans_lunch,
      Strings.plans_dinner,
    ];
    const sortedFixed = fixedPlans.sort((a: string, b: string) => {
      const indexA = mealOrder.indexOf(a);
      const indexB = mealOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    setFixedMeals(sortedFixed);
    setMealTypes(userPlans);
  };

  const loadMealPlans = () => {
    if (mealPlans && mealPlans.length > 0) {
      processMealPlans(mealPlans);
    } else {
      fetchMealPlans(
        (data) => {
          processMealPlans(data);
        },
        (error) => {
          console.error("Error fetching meal plans:", error);
        }
      );
    }
  };

  const handleDeleteMealPlan = (mealPlanId: string) => {
    deleteMealPlan(
      mealPlanId,
      () => {
        console.log("Meal plan deleted successfully");
        // const updated = [...mealTypes];
        // setMealTypes(updated);
      },
      (error) => {
        console.error("Error deleting meal plan:", error);
      }
    );
  };

  const isLimitReached = mealTypes.length >= MAX_USER_MEALS;

  const onRefresh = () => {
    setRefreshing(true);
    fetchMealPlans(
      (data) => {
        processMealPlans(data);
        setRefreshing(false);
      },
      (error) => {
        console.error("Error refreshing meal plans:", error);
        setRefreshing(false);
      }
    );
  };

  const handleAddType = () => {
    if (mealTypes.length >= MAX_USER_MEALS) return;

    setMealTypes((prev) => [
      ...prev,
      { id: "", label: "", isEditing: true, isNew: false, isModified: false },
    ]);
  };

  const handleChangeType = (text: string, idx: number) => {
    const updated = [...mealTypes];
    updated[idx].label = text;
    setMealTypes(updated);
  };

  const handleSaveType = (idx: number) => {
    const updated = [...mealTypes];
    const mealToConfirm = updated[idx];

    if (!mealToConfirm.label.trim()) {
      alert(Strings.mealPlanSettings_mealNameEmpty);
      return;
    }

    updated[idx].isEditing = false;

    // If it has an ID, it's an existing plan being modified
    if (mealToConfirm.id && mealToConfirm.id !== "") {
      updated[idx].isModified = true;
    } else {
      // New meal plan - mark as new
      updated[idx].isNew = true;
    }

    setMealTypes(updated);
  };

  const handleEditType = (idx: number) => {
    const updated = [...mealTypes];
    updated[idx].isEditing = true;
    setMealTypes(updated);
  };

  const handleSaveAll = () => {
    // Get all NEW meal plans that haven't been saved to Firebase yet
    const newPlans = mealTypes
      .filter((type) => type.isNew && type.label.trim() !== "")
      .map((type) => type.label.trim());

    // Get all MODIFIED meal plans that need to be updated
    const modifiedPlans = mealTypes.filter(
      (type) => type.isModified && type.id && type.label.trim() !== ""
    );

    if (newPlans.length === 0 && modifiedPlans.length === 0) {
      alert(Strings.mealPlanSettings_noNewPlans);
      return;
    }

    let completedOperations = 0;
    // Both new plans and modified plans are sent as batch operations (1 API call each)
    const totalOperations =
      (newPlans.length > 0 ? 1 : 0) + (modifiedPlans.length > 0 ? 1 : 0);

    const checkCompletion = () => {
      completedOperations++;
      if (completedOperations === totalOperations) {
        console.log("All meal plans saved successfully");
        // Reset modified flags
        const updated = mealTypes.map((type) => ({
          ...type,
          isNew: false,
          isModified: false,
        }));
        setMealTypes(updated);
      }
    };

    // Save all new meal plans in one batch
    if (newPlans.length > 0) {
      addMealPlans(
        newPlans,
        (data) => {
          console.log("New meal plans saved:", data);
          checkCompletion();
        },
        (error) => {
          console.error("Error saving new meal plans:", error);
          checkCompletion();
        }
      );
    }

    // Update all modified meal plans in one batch
    if (modifiedPlans.length > 0) {
      updateMealPlans(
        modifiedPlans.map((plan) => ({
          id: plan.id,
          name: plan.label.trim(),
        })),
        () => {
          console.log("Meal plans updated:", modifiedPlans.length);
          checkCompletion();
        },
        (error) => {
          console.error("Error updating meal plans:", error);
          checkCompletion();
        }
      );
    }
  };

  const combinedMeals = [
    ...fixedMeals.map((item) => ({
      id: "",
      label: item,
      editable: false,
      isEditing: false,
    })),
    ...mealTypes.map((item) => ({
      id: item.id,
      label: item.label,
      editable: true,
      isEditing: item.isEditing,
    })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {profileLoading && !refreshing && <Loader />}

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={iconback}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.backText}>{Strings.mealPlanSettings_title}</Text>
      </View>

      <Text style={styles.customizeText}>
        {Strings.mealPlanSettings_customize}
      </Text>

      <FlatList
        data={combinedMeals}
        keyExtractor={(_, idx) => idx.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item, index }) => {
          const userIndex = index - fixedMeals.length;

          return (
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    !item.isEditing && styles.inputWithIcon,
                  ]}
                  value={item.label}
                  editable={item.editable && item.isEditing}
                  selectTextOnFocus={item.isEditing}
                  placeholder={
                    item.editable
                      ? Strings.mealPlanSettings_addEveningSnacks
                      : ""
                  }
                  placeholderTextColor={Colors.tertiary}
                  onChangeText={(text) => {
                    if (item.editable && item.isEditing) {
                      handleChangeType(text, userIndex);
                    }
                  }}
                />

                {item.editable && !item.isEditing && (
                  <TouchableOpacity
                    onPress={() => handleEditType(userIndex)}
                    style={styles.editIcon}
                  >
                    <Image source={icon_edit} style={styles.editImage} />
                  </TouchableOpacity>
                )}
              </View>

              {item.editable && item.isEditing && (
                <TouchableOpacity
                  onPress={() => handleSaveType(userIndex)}
                  style={styles.deleteBtn}
                >
                  <Image source={tikicon} style={styles.tikIcon} />
                </TouchableOpacity>
              )}

              {item.editable && !item.isEditing && (
                <TouchableOpacity
                  onPress={() => handleDeleteMealPlan(item.id)}
                  style={styles.deleteBtn}
                >
                  <Image source={deleteicon} style={styles.deleteIcon} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <>
            <TouchableOpacity style={styles.addMeal} onPress={handleAddType}>
              <Text style={styles.addMoreText}>
                {isLimitReached
                  ? Strings.mealPlanSettings_limitReached
                  : Strings.mealPlanSettings_addMoreType}
              </Text>
              {isLimitReached ? null : (
                <Image
                  source={plusblackicon}
                  style={styles.plusBlackIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            <BaseButton
              title={Strings.mealPlanSettings_save}
              gradientButton={true}
              textStyle={styles.savePreference}
              width={width * 0.92}
              onPress={handleSaveAll}
              disabled={profileLoading}
            />
          </>
        }
        contentContainerStyle={styles.flatListContent}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    fontSize: moderateScale(21),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginLeft: horizontalScale(30),
  },
  savePreference: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  customizeText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.tertiary,
    fontSize: moderateScale(14),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(12),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  deleteBtn: {
    marginLeft: moderateScale(10),

    alignItems: "center",
    justifyContent: "center",
  },

  addMeal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.buttonBackground,
    borderRadius: moderateScale(8),

    paddingHorizontal: horizontalScale(12),
    marginBottom: verticalScale(18),
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginTop: verticalScale(10),
    height: verticalScale(48),
    marginHorizontal: horizontalScale(5),
  },
  addMoreText: {
    color: Colors.textBlack,
    marginRight: horizontalScale(12),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
  },

  inputWithIcon: {
    paddingRight: horizontalScale(40),
  },

  editIcon: {
    position: "absolute",
    right: horizontalScale(12),
    top: "50%",
    transform: [{ translateY: -11 }],
  },

  editImage: {
    width: verticalScale(22),
    height: verticalScale(22),
    tintColor: Colors.primary,
  },
  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: "flex-end",
  },
  tikIcon: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  deleteIcon: {
    width: verticalScale(22),
    height: verticalScale(22),
  },
  plusBlackIcon: {
    width: verticalScale(12),
    height: verticalScale(12),
  },
  flatListContent: {
    paddingBottom: 32,
  },
});
