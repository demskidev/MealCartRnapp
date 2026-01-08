import {
  addtomeallist,
  addwishlisticon,
  backIcon,
  icon_edit,
  mealfoodH,
} from "@/assets/images";
import BaseButton from "@/components/BaseButton";
import {
  addDotAtEnd,
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors } from "@/constants/Theme";
import { Meal } from "@/reduxStore/slices/mealsSlice";
import { FontFamily, fontSize } from "@/utils/Fonts";
import { showErrorToast, showSuccessToast } from "@/utils/Toast";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfirmationModal from "./ConfirmationModal";
import CreateMealBottomSheet from "./CreateMealBottomSheet";
import SendToShoppingList from "./SendShoppingList";
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");


type MealDetailProps = {
  meal: Meal;
  onBack: () => void;
};

const MealDetail = ({ meal: initialMeal, onBack }: MealDetailProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendShoppingList, setShowSendShoppingList] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const { meals, deleteTheMeal } = useMealsViewModel();
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Get the updated meal from Redux state, fallback to initial meal
  const meal = useMemo(() => {
    const updatedMeal = meals.find((m) => m.id === initialMeal.id);
    return updatedMeal || initialMeal;
  }, [meals, initialMeal.id]);

  const handleEditPress = () => {
    bottomSheetRef.current?.expand();
  };

  const handleDeleteMeal = async () => {
    setShowDeleteModal(false);

    try {
      await deleteTheMeal(
        meal.id,
        (payload) => {
          console.log("✅ Meal deleted successfully:", payload);
          showSuccessToast(Strings.meal_deleted);
          onBack();
        },
        (error) => {
          console.error(
            "❌ Error deleting meal from deleteTheMeal callback:",
            error
          );
          showErrorToast(error || Strings.error_deleting_meal);
        }
      );
    } catch (error: any) {
      console.error("❌ Exception caught in handleDeleteMeal:", {
        message: error?.message,
        code: error?.code,
        error: error,
      });
      showErrorToast(error?.message || Strings.error_occurred_deleting_meal);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerImageContainer}>
        <ImageBackground
          source={meal.imageUrl ? { uri: meal.imageUrl } : mealfoodH}
          style={{ height: verticalScale(300), width: "100%" }}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Image
                source={backIcon}
                style={styles.backImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {meal.category && (
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{meal.category}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerOverlayContent1}>
            <View style={styles.parentOfname}>
              <Text style={styles.title}>{meal.name}</Text>
              <Text style={styles.info}>
                {meal.prepTime && `${meal.prepTime} •`} {meal.servings || 0}{" "}
                {Strings.createMeal_servings}{" "}
                {meal.difficulty && `• ${meal.difficulty}`}
              </Text>
            </View>
            <View style={styles.parentOfAddList}>
              <Image
                source={addtomeallist}
                style={styles.imageMeallist}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setShowSendShoppingList(true)}>
                <Image
                  source={addwishlisticon}
                  style={styles.imageaddToList}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      <ScrollView
        style={styles.detailContent}
        contentContainerStyle={{ paddingBottom: verticalScale(32) }}
      >
        {meal.description && (
          <Text style={styles.description}>{meal.description || ""}</Text>
        )}

        <View style={styles.buttonRow}>
          <BaseButton
            title={Strings.mealDetail_edit}
            gradientButton={true}
            textColor={Colors.white}
            width={width * 0.47}
            textStyle={styles.editButton}
            rightChild={
              <Image
                source={icon_edit}
                style={styles.editImage}
                resizeMode="contain"
              />
            }
            onPress={handleEditPress}
          />

          <BaseButton
            title={Strings.mealDetail_delete}
            gradientButton={true}
            width={width * 0.47}
            gradientStartColor={Colors._A62A2A}
            gradientEndColor={Colors._FD4B4B}
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
            textColor={Colors.white}
            textStyle={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {Strings.createMeal_ingredients}
            </Text>
            <View style={styles.divider} />
            {meal.ingredients.map((ingredient: any, index: number) => (
              <View style={styles.ingredientRow} key={index}>
                <Text style={styles.ingredientName}>{ingredient.ingredientName}</Text>
                <View style={styles.dividerRow} />
                <Text style={styles.ingredientValue}>
                  {ingredient.count && `${ingredient.count} `}
                  {ingredient.unit}
                </Text>
              </View>
            ))}
          </View>
        )}

        {meal.steps && meal.steps.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>
              {Strings.mealDetail_instructions}
            </Text>
            <View style={styles.divider} />
            {meal.steps.map((step: string, index: number) => (
              <View style={styles.instructionRow} key={index}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{addDotAtEnd(step)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteModal}
        title={Strings.mealDetail_deleteMeal}
        description={Strings.mealDetail_deleteDesc}
        cancelText={Strings.mealDetail_cancel}
        confirmText={Strings.mealDetail_delete}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteMeal}
      />
      <CreateMealBottomSheet
        ref={bottomSheetRef}
        isEdit={true}
        mealData={meal}
      />
      <SendToShoppingList
        visible={showSendShoppingList}
        onClose={() => setShowSendShoppingList(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageMeallist: {
    width: moderateScale(56),
    height: moderateScale(42),
  },
  imageaddToList: {
    width: moderateScale(56),
    height: moderateScale(42),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(10),
    marginTop: verticalScale(55),
  },
  backButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  backButtonText: {
    fontSize: fontSize(28),
    color: Colors.white,
  },
  tagContainer: {
    backgroundColor: Colors._FFFFFF97,
    borderRadius: moderateScale(16),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(10),
    marginRight: horizontalScale(10),
  },
  tagText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  detailContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    marginTop: moderateScale(-24),
    padding: moderateScale(20),
    flex: 1,
  },
  title: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    color: Colors.white,
  },
  info: {
    fontSize: moderateScale(12),
    color: Colors.white,
    marginTop: moderateScale(4),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  description: {
    fontSize: moderateScale(14),
    color: Colors.tertiary,
    marginTop: moderateScale(16),
    fontFamily: FontFamily.ROBOTO_REGULAR,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginStart: horizontalScale(-8),
    marginVertical: verticalScale(25),
  },
  editButton: {
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  editIcon: {
    color: Colors.white,
    fontSize: fontSize(16),
    marginLeft: horizontalScale(8),
  },
  deleteButton: {
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginTop: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  divider: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    marginBottom: moderateScale(8),
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,
    marginHorizontal: horizontalScale(12),
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
    paddingVertical: verticalScale(2),
  },
  ingredientName: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  ingredientValue: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_REGULAR,
    color: Colors.tertiary,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  instructionNumber: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginRight: horizontalScale(8),
    marginTop: verticalScale(2),
  },
  instructionText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_REGULAR,
    color: Colors.tertiary,
    flex: 1,
  },
  parentOfAddList: {
    flexDirection: "row",
    alignItems: "center",
    width: width * moderateScale(0.3),
    justifyContent: "space-between",
  },
  image: {
    width: "100%",
    height: verticalScale(300),
  },
  headerImageContainer: {},
  headerOverlayContent: {},
  headerOverlayContent1: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    position: "absolute",
    bottom: verticalScale(40),
    left: horizontalScale(16),
    width: width * moderateScale(0.96),
  },
  backImage: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  parentOfname: {
    width: width * moderateScale(0.5),
  },
  editImage: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
});

export default MealDetail;
