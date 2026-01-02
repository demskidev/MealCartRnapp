import BaseButton from "@/components/BaseButton";
import {
  addDotAtEnd,
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors } from "@/constants/Theme";
import { FontFamily } from "@/utils/Fonts";
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

const MealDetail = ({ meal: initialMeal, onBack }) => {
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
          source={
            meal.image
              ? { uri: meal.image }
              : require("@/assets/images/mealfoodH.png")
          }
          style={{ height: verticalScale(300), width: "100%" }}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Image
                source={require("@/assets/images/backIcon.png")}
                style={styles.backImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{meal.category || "Dinner"}</Text>
            </View>
          </View>

          <View style={styles.headerOverlayContent1}>
            <View style={styles.parentOfname}>
              <Text style={styles.title}>{meal.title}</Text>
              <Text style={styles.info}>
                {meal.time && `${meal.time} •`} {meal.servings || 0} Servings{" "}
                {meal.difficulty && `• ${meal.difficulty}`}
              </Text>
            </View>
            <View style={styles.parentOfAddList}>
              <Image
                source={require("@/assets/images/addtomeallist.png")}
                style={styles.imageMeallist}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setShowSendShoppingList(true)}>
                <Image
                  source={require("@/assets/images/addwishlisticon.png")}
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
            title="Edit"
            gradientButton={true}
            textColor="#fff"
            width={width * 0.47}
            textStyle={styles.editButton}
            rightChild={
              <Image
                source={require("@/assets/images/icon_edit.png")}
                style={styles.editImage}
                resizeMode="contain"
              />
            }
            onPress={handleEditPress}
          />

          <BaseButton
            title="Delete"
            gradientButton={true}
            width={width * 0.47}
            gradientStartColor="#A62A2A"
            gradientEndColor="#FD4B4B"
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
            textColor="#fff"
            textStyle={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.divider} />
            {meal.ingredients.map((ingredient: any, index: number) => (
              <View style={styles.ingredientRow} key={index}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
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
            <Text style={styles.sectionTitle}>Instructions</Text>
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
        title="Delete Meal"
        description="This action is permanent and cannot be undone. You will lose access to this meal."
        cancelText="Cancel"
        confirmText="Delete"
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
    padding: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 28,
    color: "#fff",
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
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
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
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
    marginBottom: 4,
    paddingVertical: 2,
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
    marginBottom: 8,
    marginTop: 4,
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
    width: width * 0.3,
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
    width: width * 0.92,
  },
  backImage: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
  parentOfname: {
    width: width * 0.5,
  },
  editImage: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
});

export default MealDetail;