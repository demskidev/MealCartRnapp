import { deleteicon, iconback, iconedit } from "@/assets/images";
import { CheckBox, FilledCheckBox, KrogerIcon } from "@/assets/svg";
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
import { addItemsToKrogerCart } from "@/services/krogerApi";
import { backNavigation } from "@/utils/Navigation";
import { useShoppingListViewModel } from "@/viewmodels/ShoppingListViewModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TourGuideZone } from "rn-tourguide";

enum KrogerModality {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

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
  const [krogerModality, setKrogerModality] = useState<KrogerModality | null>(
    null,
  );
  const [sendingToKroger, setSendingToKroger] = useState(false);

  const {
    fetchListById,
    loading,
    deleteShoppingListData,
    updateShoppingListData,
  } = useShoppingListViewModel();

  // Check if this is tour mode
  const isTourMode = listId === "tour-dummy-list" && shouldStartTour;

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
            // Always open with nothing selected — the user picks what to buy /
            // send each time. What was previously sent is still reflected by the
            // separate "acquired" progress bar (not by the checkboxes).
            setChecked([]);
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

  const acquiredCount = allIngredients.filter(
    (ing: any) => ing.acquired,
  ).length;

  const toggleCheck = (id: string, ingredient: any, index: number) => {
    // Any item can be toggled — including ones already sent to the Kroger cart.
    // (Previously acquired Kroger items were locked, which left the whole screen
    // unusable once items had been sent.)
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
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

  const hasKrogerItems = allIngredients.some(
    (ing: any) => ing.isKroger && ing.krogerIngredientId,
  );

  const handleSendToKrogerCart = async () => {
    if (!krogerModality) {
      Alert.alert(Strings.testPlanShopping_krogerSelectModality);
      return;
    }

    // Only send the Kroger items the user actually selected (checked).
    const isSelectedKroger = (ing: any, idx: number) => {
      const id = `${ing.ingredientId}-${ing.mealId}-${idx}`;
      return ing.isKroger && ing.krogerIngredientId && checked.includes(id);
    };

    const sentIds = new Set(
      allIngredients
        .map((ing: any, idx: number) =>
          isSelectedKroger(ing, idx)
            ? `${ing.ingredientId}-${ing.mealId}-${idx}`
            : null,
        )
        .filter(Boolean) as string[],
    );

    const krogerItems = allIngredients
      .filter((ing: any, idx: number) => isSelectedKroger(ing, idx))
      .map((ing: any) => ({
        quantity: Number(ing.count) || 1,
        upc: ing.krogerIngredientId,
        modality: krogerModality,
      }));

    if (krogerItems.length === 0) {
      Alert.alert(Strings.testPlanShopping_krogerNoItems);
      return;
    }

    setSendingToKroger(true);
    try {
      await addItemsToKrogerCart(krogerItems);

      // Mark only the sent (selected) items as acquired, locally and in Firebase
      const updatedIngredients = allIngredients.map((ing: any, idx: number) => {
        const id = `${ing.ingredientId}-${ing.mealId}-${idx}`;
        const wasSent = sentIds.has(id);
        return {
          ingredientId: ing.ingredientId,
          ingredientName: ing.ingredientName || "",
          categoryId: ing.categoryId,
          categoryName: ing.categoryName || "",
          mealId: ing.mealId || "",
          mealName: ing.mealName || "",
          unit: ing.selectedUnit || ing.unit,
          count: ing.count || 1,
          acquired: wasSent ? true : ing.acquired || false,
          isKroger: ing.isKroger || false,
          krogerIngredientId: ing.krogerIngredientId || "",
        };
      });

      // Update local state
      setSelectedList((prevList: any) => {
        if (!prevList) return prevList;
        return { ...prevList, ingredients: updatedIngredients };
      });

      // Keep only the sent items checked
      setChecked((prev) => [...new Set([...prev, ...sentIds])]);

      // Save to Firebase
      if (selectedList?.id) {
        updateShoppingListData(
          {
            id: selectedList.id,
            ...selectedList,
            ingredients: updatedIngredients,
          },
          () => {},
          (error: any) => {
            alert(Strings.testPlanShopping_errorUpdating + error);
          },
        );
      }

      Alert.alert(
        Strings.testPlanShopping_krogerSuccess,
        Strings.testPlanShopping_krogerSuccessMessage,
      );
    } catch (error: any) {
      const status = error?.details?.status || error?.customData?.status;
      const krogerPayload =
        error?.details?.payload || error?.customData?.payload;
      let detail =
        error?.message || Strings.testPlanShopping_krogerErrorMessage;
      if (status) {
        detail += `\n\nHTTP ${status}`;
      }
      if (krogerPayload) {
        detail += `\n${JSON.stringify(krogerPayload)}`;
      }
      Alert.alert(Strings.testPlanShopping_krogerError, detail);
    } finally {
      setSendingToKroger(false);
    }
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
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>
                {item.ingredientName ||
                  Strings.testPlanShopping_unknownIngredient}
              </Text>
              <Text style={styles.amount} numberOfLines={2}>
                {Number(item.count) > 0 ? `${item.count} ` : ""}
                {item.unit || Strings.testPlanShopping_noUnit}
                {item.mealName ? ` (${item.mealName})` : ""}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* tooltipBelowZone: these zones fill the screen (the list needs flex: 1),
          so place their tooltips below the content and let the on-screen clamp
          settle them in the empty area beneath the list, as in the design. */}
      <TourGuideZone
        zone={18}
        shape="rectangle"
        borderRadius={8}
        style={{ flex: 1 }}
        tooltipBelowZone
      >
        <TourGuideZone
          zone={17}
          shape="rectangle"
          borderRadius={8}
          style={{ flex: 1 }}
          tooltipBelowZone
        >
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
            {
              new Set(
                allIngredients.map((ing: any) => ing.mealId).filter(Boolean),
              ).size
            }{" "}
            {new Set(
              allIngredients.map((ing: any) => ing.mealId).filter(Boolean),
            ).size === 1
              ? Strings.testPlanShopping_meal
              : Strings.testPlanShopping_meals}
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
            style={{ flex: 1 }}
            data={allIngredients}
            keyExtractor={(item, index) =>
              `${item.ingredientId}-${item.mealId}-${index}`
            }
            renderItem={renderIngredientItem}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: verticalScale(20) }}
            ListFooterComponent={
              hasKrogerItems ? (
                <View style={styles.krogerCartSection}>
                  <Text style={styles.krogerCartLabel}>
                    {Strings.testPlanShopping_krogerChooseModality}
                  </Text>
                  <View style={styles.krogerModalityRow}>
                    <TouchableOpacity
                      style={styles.krogerModalityOption}
                      onPress={() =>
                        setKrogerModality((prev) =>
                          prev === KrogerModality.DELIVERY
                            ? null
                            : KrogerModality.DELIVERY,
                        )
                      }
                    >
                      {krogerModality === KrogerModality.DELIVERY ? (
                        <FilledCheckBox
                          width={verticalScale(22)}
                          height={verticalScale(22)}
                          color={Colors.tertiary}
                        />
                      ) : (
                        <CheckBox
                          width={verticalScale(22)}
                          height={verticalScale(22)}
                          color={Colors.tertiary}
                        />
                      )}
                      <Text style={styles.krogerModalityText}>
                        {Strings.testPlanShopping_krogerDelivery}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.krogerModalityOption}
                      onPress={() =>
                        setKrogerModality((prev) =>
                          prev === KrogerModality.PICKUP
                            ? null
                            : KrogerModality.PICKUP,
                        )
                      }
                    >
                      {krogerModality === KrogerModality.PICKUP ? (
                        <FilledCheckBox
                          width={verticalScale(22)}
                          height={verticalScale(22)}
                          color={Colors.tertiary}
                        />
                      ) : (
                        <CheckBox
                          width={verticalScale(22)}
                          height={verticalScale(22)}
                          color={Colors.tertiary}
                        />
                      )}
                      <Text style={styles.krogerModalityText}>
                        {Strings.testPlanShopping_krogerPickup}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.krogerCartButton]}
                    disabled={!krogerModality || sendingToKroger}
                    onPress={handleSendToKrogerCart}
                  >
                    {sendingToKroger ? (
                      <ActivityIndicator color={Colors.primary} />
                    ) : (
                      <View style={styles.krogerCartButtonContent}>
                        <Text style={styles.krogerCartButtonText}>
                          {Strings.testPlanShopping_krogerSendToCart}
                        </Text>

                        <KrogerIcon
                          width={horizontalScale(51)}
                          height={verticalScale(29)}
                        />
                        <Text style={styles.krogerCartButtonText}>
                          {Strings.testPlanShopping_krogerCart}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null
            }
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
  krogerCartSection: {
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(10),
    alignContent: "center",
    alignItems: "center",
  },
  krogerCartLabel: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(15),
    color: Colors.tertiary,
    marginBottom: verticalScale(12),
  },
  krogerModalityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
    gap: horizontalScale(24),
  },
  krogerModalityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  krogerModalityText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  krogerCartButton: {
    backgroundColor: "#9FB6D091",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "100%",
    overflow: "hidden",
  },
  krogerCartButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },
  krogerCartButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors._004A9B,
  },
  krogerLogoInline: {
    width: horizontalScale(60),
    height: verticalScale(20),
  },
});
