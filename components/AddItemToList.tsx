import { burger, closeIcon, mealfoodA } from "@/assets/images";
import { CheckBox, FilledCheckBox, SearchIcon } from "@/assets/svg";
import {
  horizontalScale,
  isAndroid,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { CREATE_MEAL_PLAN, SHOPPING_LIST } from "@/reduxStore/appKeys";
import { Meal } from "@/reduxStore/slices/mealsSlice";
import { toDate } from "@/utils/DateFormat";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomStepper from "./CustomStepper";
import CustomTextInput from "./CustomTextInput";
import PaginationLoader from "./PaginationLoader";
import ThemeGradientButton from "./ThemeGradientButton";
import ThemeNormalButton from "./ThemeNormalButton";

const mealsData = [
  { id: "1", name: "Classic Spaghetti Bolognese", image: burger },
  { id: "2", name: "Classic Spaghetti Bolognese", image: burger },
  { id: "3", name: "Classic Spaghetti Bolognese", image: burger },
];
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

interface AddItemToListProps {
  visible: boolean;
  onClose: () => void;
  from?: typeof CREATE_MEAL_PLAN | typeof SHOPPING_LIST;
  onMealSelect?: (meal: any) => void;
}

const AddItemToList = ({
  visible,
  onClose,
  from = "shoppingList",
  onMealSelect,
}: AddItemToListProps) => {
  const [search, setSearch] = useState("");

  const [manualInput, setManualInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pendingItems, setPendingItems] = useState<
    { id: string; value: string }[]
  >([]);
  const [manualList, setManualList] = useState<{ id: string; value: string }[]>(
    [],
  );
  const [unitWeight, setUnitweight] = useState("100 grms");
  const unitWeightOptions = ["100grm", "200grm", "1kg"];
  const unitWeightIndex = unitWeightOptions.indexOf(unitWeight);
  const [itemWeights, setItemWeights] = useState<Record<string, number>>({});

  const { meals, loading, fetchMeals, searchMealsCombined } =
    useMealsViewModel();
  const [filteredMeals, setFilteredMeals] = useState<any[]>([]);
  const [mealsCursor, setMealsCursor] = useState<any>(null);
  const [mealsEndReached, setMealsEndReached] = useState(false);
  const [isLoadingMoreMeals, setIsLoadingMoreMeals] = useState(false);
  const MEALS_PAGE_SIZE = 10;
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [dynamicIngredients, setDynamicIngredients] = useState<string[]>([]);
  const [fullIngredientsData, setFullIngredientsData] = useState<any[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function: Fetch all ingredients data for a meal
  // Fetch from ingredient collection using ingredientId

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setManualInput("");
      setFilteredSuggestions([]);
      setSearchText("");
      setSuggestions([]);
      setIsInputFocused(false);
      setPendingItems([]);
      setManualList([]);
      setUnitweight("100 grms");
      setItemWeights({});
      setFilteredMeals([]);
      setSelectedMeals([]);
      setDynamicIngredients([]);
      setFullIngredientsData([]);
      setIsLoading(false);
    }
  }, [visible]);

  // Load the first page every time the picker opens.
  //
  // This used to fetch only `if (meals.length === 0)` and only 3 rows. Because
  // `meals` is a Redux accumulator shared with the Meals tab, whatever that tab
  // happened to have loaded became the entire set of meals offered here — so a
  // meal you had just created showed up while older ones didn't, and the list
  // never grew. Always fetching page 1 (and paginating below) makes this list
  // reflect the user's meals instead of another screen's fetch history.
  useEffect(() => {
    if (!visible) return;

    setMealsCursor(null);
    setMealsEndReached(false);
    setIsLoading(true);
    fetchMeals(
      (data) => {
        if (data.length < MEALS_PAGE_SIZE) setMealsEndReached(true);
        if (data.length > 0) setMealsCursor(data[data.length - 1]);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
      },
      MEALS_PAGE_SIZE,
      null,
    );
  }, [visible]);

  // `meals` is appended page-by-page and newly created meals are pushed onto the
  // end, so the store order is fetch order. Sort explicitly, newest first, to
  // match how the Meals tab presents the same data.
  const mealOptions = search.trim()
    ? filteredMeals
    : [...meals].sort(
        (a: any, b: any) =>
          (toDate(b?.createdAt)?.getTime() ?? 0) -
          (toDate(a?.createdAt)?.getTime() ?? 0),
      );

  const loadMoreMeals = () => {
    // `search` swaps the list over to `filteredMeals`, which is its own
    // (unpaginated) result set — don't advance the store cursor from there.
    if (
      search.trim() ||
      mealsEndReached ||
      isLoading ||
      isLoadingMoreMeals ||
      !mealsCursor
    ) {
      return;
    }

    setIsLoadingMoreMeals(true);
    fetchMeals(
      (data) => {
        if (data.length < MEALS_PAGE_SIZE) setMealsEndReached(true);
        if (data.length > 0) setMealsCursor(data[data.length - 1]);
        setIsLoadingMoreMeals(false);
      },
      (error) => {
        setIsLoadingMoreMeals(false);
      },
      MEALS_PAGE_SIZE,
      mealsCursor,
    );
  };

  // Filter meals based on search
  useEffect(() => {
    if (!visible) return;
    if (!search.trim()) return; // Don't search if empty

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setIsLoading(true);

      searchMealsCombined(
        { searchText: search.trim().toLowerCase() },
        (data) => {
          setFilteredMeals(data);
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
          setFilteredMeals([]);
        },
      );
    }, 400); // 400ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search, visible]);

  // Extract ingredients from selected meals with full data
  useEffect(() => {
    if (selectedMeals.length === 0) {
      setDynamicIngredients([]);
      setFullIngredientsData([]);
      return;
    }

    // Look in both Redux meals and search-filtered meals
    const combinedMeals = [...meals, ...filteredMeals];
    const seenIds = new Set<string>();
    const uniqueMeals = combinedMeals.filter((meal) => {
      if (seenIds.has(meal.id)) return false;
      seenIds.add(meal.id);
      return true;
    });

    const selectedMealObjects = uniqueMeals.filter((meal) =>
      selectedMeals.includes(meal.id),
    );

    const allIngredientNames: string[] = [];
    const allFullIngredients: any[] = [];

    // Loop through each selected meal
    for (const meal of selectedMealObjects) {
      if (meal.ingredients && Array.isArray(meal.ingredients)) {
        // Extract ingredient names from the meal's ingredients array
        meal.ingredients.forEach((ingredient: any) => {
          const ingredientName = ingredient.ingredientName;

          if (ingredientName && !allIngredientNames.includes(ingredientName)) {
            allIngredientNames.push(ingredientName);
            // Add meal information to each ingredient
            allFullIngredients.push({
              ...ingredient,
              mealId: meal.id,
              mealName: meal.name,
            });
          }
        });
      }
    }

    setDynamicIngredients(allIngredientNames);
    setFullIngredientsData(allFullIngredients);
  }, [selectedMeals, meals, filteredMeals]);

  // Removed initialization of itemWeights - let them be undefined by default
  // so that ingredient's default unit can be used

  // Helper: get names already picked (pending or added)
  const excludedNames = useMemo(() => {
    const names = new Set<string>();
    pendingItems.forEach((i) => names.add(i.value));
    manualList.forEach((i) => names.add(i.value));
    return names;
  }, [pendingItems, manualList]);

  // Build filtered suggestions whenever inputs change
  useEffect(() => {
    // Show suggestions when meals are selected (dynamicIngredients populated)
    // OR when the input is focused / has search text
    const hasMealIngredients = dynamicIngredients.length > 0;

    if (!hasMealIngredients && !isInputFocused && !searchText.trim()) {
      setSuggestions([]);
      return;
    }

    let pool = dynamicIngredients.filter((name) => !excludedNames.has(name));

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      pool = pool.filter((name) => name.toLowerCase().includes(lower));
    }

    setSuggestions(pool);
  }, [dynamicIngredients, searchText, isInputFocused, excludedNames]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleSelectSuggestion = (value: string) => {
    if (excludedNames.has(value)) {
      return;
    }

    const newItem = { id: Date.now().toString(), value };
    setPendingItems((prev) => [...prev, newItem]);
    setSearchText("");
  };

  const handleAddPendingItem = (item: { id: string; value: string }) => {
    setManualList((prev) => [...prev, item]);
    setPendingItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Use dynamic ingredients from selected meals

  const handleAddItem = (value: string) => {
    if (!value.trim()) return;

    setManualList((prev) => [...prev, { id: Date.now().toString(), value }]);

    setManualInput("");
    setFilteredSuggestions([]);
  };

  const handleMealPress = (meal: any) => {
    // Dismiss keyboard and blur input when selecting meals
    // Keyboard.dismiss();
    // inputRef.current?.blur();

    if (from === CREATE_MEAL_PLAN) {
      // For meal plan: single selection, call callback immediately
      onMealSelect?.(meal);
      onClose();
    } else {
      // For shopping list: multi-selection with checkboxes
      setSelectedMeals((prev) => {
        if (prev.includes(meal.id)) {
          return prev.filter((id) => id !== meal.id);
        } else {
          return [...prev, meal.id];
        }
      });
    }
  };

  const handleGenerateList = () => {
    // Only send ingredients that the user explicitly added via the "Add" button
    const addedNames = manualList.map((item) => item.value);
    const addedIngredients = fullIngredientsData.filter((ingredient) =>
      addedNames.includes(ingredient.ingredientName),
    );

    const ingredientsList = addedIngredients.map((ingredient) => {
      const ingredientName = ingredient.ingredientName || "";
      const isKroger = ingredient.isKroger || false;

      // For Kroger: always use ingredient's own unit
      // For non-Kroger: use user-selected unit from stepper
      let selectedUnit = ingredient.unit || "";
      if (!isKroger) {
        const categoryUnits = ingredient.categoryUnits || [];
        const defaultUnit = ingredient.unit || "";
        const normalizedDefault = defaultUnit.replace(/\s+/g, "").toLowerCase();
        const defaultIndex = categoryUnits.findIndex(
          (u: string) =>
            u.replace(/\s+/g, "").toLowerCase() === normalizedDefault,
        );
        const weightIndex =
          itemWeights[ingredientName] !== undefined
            ? itemWeights[ingredientName]
            : defaultIndex >= 0
              ? defaultIndex
              : 0;
        selectedUnit = categoryUnits[weightIndex] || defaultUnit;
      }

      return {
        ingredientId: ingredient.ingredientId || "",
        ingredientName: ingredientName,
        categoryName: ingredient.categoryName || "",
        categoryId: ingredient.categoryId || "",
        unit: selectedUnit,
        count: ingredient.count || "0",
        mealId: ingredient.mealId || "",
        mealName: ingredient.mealName || "",
        isKroger,
        krogerIngredientId: ingredient.krogerIngredientId || "",
      };
    });

    onMealSelect?.(ingredientsList);
    onClose();
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => handleMealPress(item)}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : mealfoodA}
        style={styles.mealImage}
        resizeMode="cover"
      />
      <Text style={styles.mealName}>{item.name}</Text>

      {from !== CREATE_MEAL_PLAN &&
        (selectedMeals.includes(item.id) ? (
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
        ))}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={"padding"}
          keyboardVerticalOffset={isAndroid ? 0 : 0}
          style={{ width: "100%", alignItems: "center" }}
        >
          <View style={styles.container}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View>
                <Text style={styles.title}>
                  {from === CREATE_MEAL_PLAN
                    ? Strings.createPlan_selectAMeal
                    : Strings.addItemToList_title}
                </Text>
                {from !== CREATE_MEAL_PLAN && (
                  <Text style={styles.subtitle}>
                    {Strings.addItemToList_subtitle}
                  </Text>
                )}
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.searchBox}>
              <SearchIcon
                width={verticalScale(22)}
                height={verticalScale(22)}
                color={Colors.tertiary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={Strings.addItemToList_searchPlaceholder}
                placeholderTextColor={Colors.tertiary}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {meals.length > 0 && <View style={styles.dividerRow} />}

            {isLoading && (
              <ActivityIndicator size="large" style={styles.loader} />
            )}

            <TouchableWithoutFeedback>
              <View>
                <FlatList
                  data={mealOptions}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMealItem}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.mealsListContent}
                  ItemSeparatorComponent={() => (
                    <View style={styles.mealSeparator} />
                  )}
                  style={styles.mealsListStyle}
                  onEndReached={loadMoreMeals}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isLoadingMoreMeals ? <PaginationLoader /> : null
                  }
                />
              </View>
            </TouchableWithoutFeedback>

            {from !== CREATE_MEAL_PLAN && (
              <View>
                <View style={styles.divider} />

                <Text style={styles.addManualLabel}>
                  {Strings.addItemToList_addManualLabel}
                </Text>

                <CustomTextInput
                  ref={inputRef}
                  placeholder={Strings.addItemToList_searchIngredient}
                  style={styles.manualInput}
                  placeholderTextColor={Colors.tertiary}
                  onChangeText={handleSearch}
                  value={searchText}
                  onFocus={handleInputFocus}
                />

                {suggestions.length > 0 && (
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    keyboardShouldPersistTaps="handled"
                    style={styles.suggestionsListStyle}
                    extraData={[pendingItems, manualList, itemWeights]}
                    renderItem={({ item }) => {
                      const ingredientData = fullIngredientsData.find(
                        (ing) => ing.ingredientName === item,
                      );
                      const isKroger = ingredientData?.isKroger || false;
                      const unit = ingredientData?.unit || "";
                      const count = ingredientData?.count || "0";
                      const categoryUnits = ingredientData?.categoryUnits || [];

                      // For non-Kroger: calculate stepper index
                      const normalizedDefault = unit
                        .replace(/\s+/g, "")
                        .toLowerCase();
                      const defaultIndex = categoryUnits.findIndex(
                        (u: string) =>
                          u.replace(/\s+/g, "").toLowerCase() ===
                          normalizedDefault,
                      );
                      const currentIndex =
                        itemWeights[item] !== undefined
                          ? itemWeights[item]
                          : defaultIndex >= 0
                            ? defaultIndex
                            : 0;
                      const safeIndex = currentIndex >= 0 ? currentIndex : 0;

                      return (
                        <View>
                          <View style={styles.suggestionItemContainer}>
                            <TouchableOpacity
                              onPress={() => {
                                handleSelectSuggestion(item);
                              }}
                              style={styles.suggestionTouchable}
                            >
                              <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>

                            {isKroger ? (
                              <Text style={styles.suggestionText}>
                                {Number(count) > 0 && `${count} `}
                                {unit}
                              </Text>
                            ) : (
                              <View style={styles.rowItem}>
                                <CustomStepper
                                  value={categoryUnits[safeIndex] || unit}
                                  onIncrement={() => {
                                    setItemWeights((prev) => {
                                      const current = prev[item] ?? safeIndex;
                                      return {
                                        ...prev,
                                        [item]: Math.min(
                                          current + 1,
                                          categoryUnits.length - 1,
                                        ),
                                      };
                                    });
                                  }}
                                  onDecrement={() => {
                                    setItemWeights((prev) => {
                                      const current = prev[item] ?? safeIndex;
                                      return {
                                        ...prev,
                                        [item]: Math.max(current - 1, 0),
                                      };
                                    });
                                  }}
                                  containerStyle={styles.stepperContainer}
                                />
                              </View>
                            )}
                          </View>

                          <View style={styles.dividerRowList} />
                        </View>
                      );
                    }}
                  />
                )}

                <FlatList
                  data={[...pendingItems, ...manualList]}
                  extraData={[pendingItems, manualList]}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  style={styles.manualListStyle}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isPending = pendingItems.some(
                      (i) => i.id === item.id,
                    );

                    return (
                      <View style={styles.manualAddRow}>
                        {isPending ? (
                          <>
                            <TextInput
                              style={styles.manualAddInput}
                              value={item.value}
                              editable={isPending}
                            />
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() => handleAddPendingItem(item)}
                            >
                              <Text style={styles.addButtonText}>
                                {Strings.addItemToList_add}
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View style={styles.manualItemContainer}>
                            <TextInput
                              style={styles.manualItemInput}
                              value={item.value}
                              editable={false}
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setManualList((prev) =>
                                  prev.filter((i) => i.id !== item.id),
                                )
                              }
                              style={styles.closeIconButton}
                            >
                              <Image
                                source={closeIcon}
                                style={styles.closeIconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
              </View>
            )}

            {from !== CREATE_MEAL_PLAN ? (
              <View style={styles.footer}>
                <ThemeNormalButton
                  title={Strings.addItemToList_cancel}
                  textColor={Colors.background}
                  containerStyle={[styles.cancelButton, { flex: 0.6 }]}
                  textStyle={styles.cancelButtonText}
                  onPress={onClose}
                />

                <ThemeGradientButton
                  title={Strings.addItemToList_generateList}
                  containerStyle={styles.confirmButton}
                  textStyle={styles.confirmButtonText}
                  onPress={handleGenerateList}
                />
              </View>
            ) : (
              <ThemeNormalButton
                title={Strings.addItemToList_cancel}
                textColor={Colors.background}
                containerStyle={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                onPress={onClose}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(18),
    paddingHorizontal: horizontalScale(18),
    paddingTop: verticalScale(5),
    paddingBottom: verticalScale(15),
    width: "92%",
    alignSelf: "center",
  },
  title: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(18),
    color: Colors.primary,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(2),
  },
  subtitle: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    marginBottom: verticalScale(16),
    marginTop: verticalScale(8),
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(30),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    paddingHorizontal: horizontalScale(12),
    height: isAndroid ? verticalScale(50) : verticalScale(44),
    marginTop: verticalScale(5),
    marginBottom: verticalScale(8),
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(15),
    color: Colors.primary,
    marginLeft: horizontalScale(8),
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    marginRight: horizontalScale(2),
    marginLeft: horizontalScale(1),
    elevation: 4,

    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: verticalScale(3),
  },
  mealImage: {
    borderTopLeftRadius: moderateScale(8),
    borderBottomLeftRadius: moderateScale(8),
    marginRight: horizontalScale(12),
    width: horizontalScale(65),
    height: verticalScale(55),
  },
  mealName: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  checkbox: {
    width: verticalScale(24),
    height: verticalScale(24),
    borderWidth: moderateScale(2),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(6),
    backgroundColor: Colors.white,
  },
  divider: {
    marginTop: verticalScale(9),
    marginBottom: verticalScale(18),
    height: moderateScale(1),
    backgroundColor: Colors.divider,
  },
  addManualLabel: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
    marginBottom: verticalScale(6),
  },
  manualInput: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(12),
    color: Colors.primary,
    paddingHorizontal: horizontalScale(10),
    height: verticalScale(44),
    marginBottom: verticalScale(6),
  },
  manualItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    paddingHorizontal: horizontalScale(10),
    height: verticalScale(40),
    marginBottom: verticalScale(6),
  },
  manualItemText: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(15),
    color: Colors.primary,
  },
  manualAddRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
    marginHorizontal: horizontalScale(2),
    marginTop: verticalScale(4),
  },
  manualAddInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),

    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    paddingHorizontal: horizontalScale(10),
    height: verticalScale(40),
    marginRight: horizontalScale(8),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
  },
  addButton: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),

    paddingHorizontal: horizontalScale(18),
    height: verticalScale(40),
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2.54,
  },
  addButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  generateButton: {
    backgroundColor: Colors._7B8756,
    borderRadius: moderateScale(8),
    flex: 1,
    marginLeft: horizontalScale(8),
    height: verticalScale(44),
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  checkboxIcon: {
    marginRight: horizontalScale(10),
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,

    marginVertical: verticalScale(15),
  },
  confirmButton: {
    borderRadius: moderateScale(8),
    alignItems: "center",
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    flex: 1,
    fontSize: moderateScale(14),
  },
  confirmButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    fontSize: moderateScale(14),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(18),
    gap: moderateScale(10),
  },
  rowItem: {
    minWidth: 100,
    alignSelf: "center",
    marginBottom: verticalScale(-8),
  },
  label: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(8),
    marginBottom: moderateScale(4),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.primary,
  },
  suggestionButton: {
    backgroundColor: "red",
  },
  dividerRowList: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,

    marginVertical: verticalScale(8),
  },
  mealsListContent: {
    paddingBottom: verticalScale(12),
  },
  mealSeparator: {
    height: verticalScale(10),
  },
  mealsListStyle: {
    marginTop: verticalScale(10),
    maxHeight: verticalScale(200),
  },
  suggestionsListStyle: {
    maxHeight: 200,
  },
  suggestionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalScale(12),
    justifyContent: "space-between",
  },
  suggestionTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    height: verticalScale(40),
  },
  suggestionText: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(12),
    color: Colors.tertiary,
  },
  stepperContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  manualListStyle: {
    maxHeight: verticalScale(250),
  },
  manualItemContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  manualItemInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    paddingHorizontal: horizontalScale(10),
    height: verticalScale(40),
    marginRight: 0,
    paddingRight: 36,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeIconButton: {
    position: "absolute",
    right: 10,
    top: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconImage: {
    width: 22,
    height: 22,
  },
  loader: {
    marginVertical: verticalScale(20),
  },
});

export default AddItemToList;
