import { deleteicon, iconback, iconedit } from "@/assets/images";
import { CheckBox, FilledCheckBox } from "@/assets/svg";
import ConfirmationModal from "@/components/ConfirmationModal";
import CreateNewListBottomSheet, {
  CreateNewListBottomSheetRef,
} from "@/components/CreateNewListBottomSheet";
import { hideLoader, showLoader } from "@/components/Loader";
import ProgressBar from "@/components/ProgressBar";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useTourStep } from "@/context/TourStepContext";
import { useAppSelector } from "@/reduxStore/hooks";
import { backNavigation } from "@/utils/Navigation";
import { useShoppingListViewModel } from "@/viewmodels/ShoppingListViewModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TourGuideZone } from "rn-tourguide";

export default function TestPlanShopping() {
  const [checked, setChecked] = useState<string[]>([]);
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  const { shouldStartTour } = useTourStep();
  const createNewListRef = useRef<CreateNewListBottomSheetRef>(null);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [removeList, setRemoveList] = useState(false);
  const [removing, setRemoving] = useState(false);

  const {
    fetchListById,
    loading,
    deleteShoppingListData,
    updateShoppingListData,
  } = useShoppingListViewModel();

  // Check if this is tour mode
  const isTourMode = listId === "tour-dummy-list" && shouldStartTour;

  // Create dummy list for tour
  const dummyTourList = useMemo(
    () => ({
      id: "tour-dummy-list",
      listName: "My Weekly Groceries",
      shoppingDay: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      createdAt: new Date(),
      uid: user?.id || "tour-user",
      items: [
        {
          ingredientId: "dummy-ing-1",
          ingredientName: "Spaghetti",
          categoryId: "cat-1",
          categoryName: "Pasta",
          unit: "400 grams",
          mealId: "tour-dummy-meal",
          mealName: "Omelette",
          isChecked: false,
        },
        {
          ingredientId: "dummy-ing-2",
          ingredientName: "Ground Beef",
          categoryId: "cat-2",
          categoryName: "Meat",
          unit: "500 grams",
          mealId: "tour-dummy-meal",
          mealName: "Omelette",
          isChecked: false,
        },
        {
          ingredientId: "dummy-ing-3",
          ingredientName: "Tomato Sauce",
          categoryId: "cat-3",
          categoryName: "Sauces",
          unit: "250 ml",
          mealId: "tour-dummy-meal",
          mealName: "Omelette",
          isChecked: false,
        },
      ],
    }),
    [user?.id],
  );

  useFocusEffect(
    React.useCallback(() => {
      if (isTourMode) {
        setSelectedList(dummyTourList);
        setChecked([]);
      } else if (listId) {
        showLoader();
        fetchListById(
          listId as string,
          (data) => {
            hideLoader();
            setSelectedList(data);
            const checkedIds = (data?.ingredients || []).reduce(
              (arr: string[], ing: any, idx: number) => {
                if (ing.acquired) {
                  arr.push(`${ing.ingredientId}-${ing.mealId}-${idx}`);
                }
                return arr;
              },
              [],
            );
            setChecked(checkedIds);
          },
          (error) => {
            hideLoader();
            setSelectedList(null);
          },
        );
      }
    }, [listId, isTourMode, dummyTourList]),
  );

  const allIngredients = selectedList?.ingredients || selectedList?.items || [];

  // const toggleCheck = (id: string) => {
  //   setChecked((prev) =>
  //     prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
  //   );
  // };

  const acquiredCount = allIngredients.filter(
    (ing: any) => ing.acquired,
  ).length;

  const toggleCheck = (id: string, ingredient: any, index: number) => {
    setChecked((prev) => {
      const isNowChecked = !prev.includes(id);
      // Update local checked state
      const newChecked = isNowChecked
        ? [...prev, id]
        : prev.filter((i) => i !== id);

      const mappedIngredients = allIngredients.map(
        (ingredient: any, idx: number) => ({
          ingredientId: ingredient.ingredientId,
          categoryId: ingredient.categoryId,
          mealId: ingredient.mealId || "",
          unit: ingredient.selectedUnit || ingredient.unit,
          count: ingredient.count || 1,
          acquired: idx === index ? isNowChecked : ingredient.acquired || false,
        }),
      );

      // Prepare updated ingredients array
      const updatedIngredients = mappedIngredients.map(
        (ing: any, idx: number) => {
          if (idx === index) {
            // Add or update the acquired key
            return { ...ing, acquired: isNowChecked };
          }
          return ing;
        },
      );

      setSelectedList((prevList: any) => {
        if (!prevList) return prevList;
        const updatedIngredients = prevList.ingredients.map(
          (ing: any, idx: number) =>
            idx === index ? { ...ing, acquired: isNowChecked } : ing,
        );
        return { ...prevList, ingredients: updatedIngredients };
      });

      // Prepare updated list object
      const updatedList = {
        ...selectedList,
        ingredients: updatedIngredients,
      };

      // Call update API (pass id and updated data)
      if (selectedList?.id) {
        updateShoppingListData(
          { id: selectedList.id, ...updatedList },
          () => {},
          (error: any) => {
            alert("Error updating ingredient status: " + error);
          },
        );
      }

      return newChecked;
    });
  };

  const handleDeleteList = () => {
    if (listId) {
      setRemoving(true);
      deleteShoppingListData(
        listId as string,
        () => {
          setRemoving(false);
          alert(Strings.shoppingList_deleted);
          backNavigation();
        },
        (error) => {
          setRemoving(false);
          alert(Strings.error_deleting_shoppingList);
        },
      );
    }

    return;
  };

  const renderIngredientItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const itemId = `${item.ingredientId}-${item.mealId}-${index}`;
    const isChecked = checked.includes(itemId);

    // Check if this is the first item in its category
    const showCategoryHeader =
      index === 0 ||
      allIngredients[index - 1]?.categoryName !== item.categoryName;

    return (
      <View>
        {showCategoryHeader && (
          <>
            <Text style={styles.sectionTitle}>
              {item.categoryName || "Other"}
            </Text>
            <View style={styles.dividerRow} />
          </>
        )}
        <TouchableOpacity
          style={styles.cardCategory}
          onPress={() => toggleCheck(itemId, item, index)}
          activeOpacity={0.7}
        >
          <View style={styles.checkboxRow}>
            {isChecked ? (
              <FilledCheckBox
                width={verticalScale(22)}
                height={verticalScale(22)}
                color={Colors.tertiary}
                style={styles.checkboxIcon}
              />
            ) : (
              <CheckBox
                width={verticalScale(22)}
                height={verticalScale(22)}
                color={Colors.tertiary}
                style={styles.checkboxIcon}
              />
            )}
            <View>
              <Text style={styles.name}>
                {item.ingredientName || "Unknown Ingredient"}
              </Text>
              <Text style={styles.amount}>{item.unit || "No unit"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <TourGuideZone zone={18} shape="rectangle" borderRadius={8}>
        <TourGuideZone zone={17} shape="rectangle" borderRadius={8}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={iconback}
                resizeMode="contain"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.backText}>
              {Strings.testPlanShopping_backToLists}
            </Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.planTitle}>
              {selectedList?.listName || Strings.testPlanShopping_title}
            </Text>

            <View style={styles.editdelete}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setSelectedList({ ...selectedList });

                  createNewListRef.current?.expand();
                }}
              >
                <Image
                  source={iconedit}
                  resizeMode="contain"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRemoveList(true)}>
                <Image
                  source={deleteicon}
                  resizeMode="contain"
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.planSubTitle}>
            {allIngredients.length}{" "}
            {allIngredients.length === 1 ? "meal" : "meals"}
          </Text>

          {/* <ProgressBar
            progress={checked.length / (allIngredients.length || 1)}
            label={Strings.testPlanShopping_progress}
            progressText={`${checked.length} / ${allIngredients.length}`}
            containerStyle={styles.progressbar}
          /> */}

          <ProgressBar
            progress={acquiredCount / (allIngredients.length || 1)}
            label={Strings.testPlanShopping_progress}
            progressText={`${acquiredCount} / ${allIngredients.length}`}
            containerStyle={styles.progressbar}
          />

          <FlatList
            data={allIngredients}
            keyExtractor={(item, index) =>
              `${item.ingredientId}-${item.mealId}-${index}`
            }
            renderItem={renderIngredientItem}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: verticalScale(20) }}
          />
        </TourGuideZone>
      </TourGuideZone>
      <ConfirmationModal
        visible={removeList}
        title={Strings.shoppingList_removeTitle}
        description={Strings.shoppingList_removeDescription}
        cancelText={Strings.testMealPlan_cancel}
        confirmText={
          removing ? Strings.testMealPlan_removing : Strings.testMealPlan_remove
        }
        onCancel={() => setRemoveList(false)}
        onConfirm={() => {
          handleDeleteList();
        }}
        isRemoving={removing}
      />
      <CreateNewListBottomSheet
        ref={createNewListRef}
        shoppingList={selectedList}
        onClose={() => {
          if (!isTourMode && listId) {
            showLoader();
            fetchListById(
              listId as string,
              (data) => {
                hideLoader();
                setSelectedList(data);
              },
              (error) => {
                hideLoader();
                setSelectedList(null);
              },
            );
          }
        }}
        // Pass current data here
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 8,
  },
  actions: { flexDirection: "row" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
  },
  listContainer: { flex: 1, marginTop: 10 },
  selectedTab: { alignItems: "center", justifyContent: "center" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  backText: {
    fontSize: moderateScale(14),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginLeft: horizontalScale(30),
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
  editdelete: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(10),
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,

    marginBottom: verticalScale(10),
  },
  cardCategory: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginBottom: verticalScale(10),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginHorizontal: moderateScale(3),
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: moderateScale(19),
    height: moderateScale(19),
    borderWidth: moderateScale(1),
    borderColor: Colors.tertiary,
    borderRadius: moderateScale(1),
    marginRight: horizontalScale(10),
  },
  name: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(12),
    color: Colors.primary,
  },
  amount: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.primary,
    marginTop: moderateScale(2),
  },
  progressbar: {
    marginVertical: verticalScale(20),
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
  checkboxIcon: {
    marginRight: horizontalScale(10),
  },
});
