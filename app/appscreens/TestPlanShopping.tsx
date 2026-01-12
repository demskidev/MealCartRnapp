import { deleteicon, iconback, iconedit } from "@/assets/images";
import { CheckBox, FilledCheckBox } from "@/assets/svg";
import ProgressBar from "@/components/ProgressBar";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useAppSelector } from "@/reduxStore/hooks";
import { pushNavigation } from "@/utils/Navigation";
import { useShoppingListViewModel } from "@/viewmodels/ShoppingListViewModel";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const data = [
  {
    id: "1",
    category: "Bakery",
    name: "Whole-grain bread",
    amount: "1 slice (Avocado Toast with Egg)",
  },
  {
    id: "2",
    category: "Dairy",
    name: "Egg",
    amount: "1 (Avocado Toast with Egg)",
  },
  {
    id: "3",
    category: "Pantry",
    name: "Red pepper flakes",
    amount: "1 pinch (Avocado Toast with Egg)",
  },
  {
    id: "4",
    category: "Produce",
    name: "Avocado",
    amount: "0.5 (Avocado Toast with Egg)",
  },
];
export default function TestPlanShopping() {
  const [checked, setChecked] = useState<string[]>([]);
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const user = useAppSelector((state) => state.auth.user);
  
  const {
    shoppingLists,
    loading,
    fetchShoppingLists,
  } = useShoppingListViewModel();

  useEffect(() => {
    if (user?.id) {
      console.log("Fetching shopping lists for user:", user.id);
      fetchShoppingLists(
        user.id,
        (data) => {
          console.log("Shopping lists fetched:", data.length);
        },
        (error) => {
          console.error("Error fetching shopping lists:", error);
        },
        10,
        null
      );
    }
  }, [user?.id]);

  console.log('shoppp9999', shoppingLists)
  console.log('Selected listId:', listId);
  
  // Find the specific shopping list by ID
  const selectedList = shoppingLists.find((list) => list.id === listId);
  
  // Get ingredients only from the selected list
  const allIngredients = selectedList?.ingredients || [];
  console.log('Ingredients for selected list:', allIngredients);
  
  const toggleCheck = (id: string) => {
    setChecked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
    const showCategoryHeader = index === 0 || 
      allIngredients[index - 1]?.categoryName !== item.categoryName;
    
    return (
      <View>
        {showCategoryHeader && (
          <>
            <Text style={styles.sectionTitle}>{item.categoryName || 'Other'}</Text>
            <View style={styles.dividerRow} />
          </>
        )}
        <TouchableOpacity 
          style={styles.cardCategory}
          onPress={() => toggleCheck(itemId)}
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
              <Text style={styles.name}>{item.ingredientName || 'Unknown Ingredient'}</Text>
              <Text style={styles.amount}>{item.unit || 'No unit'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.planTitle}>{selectedList?.listName || Strings.testPlanShopping_title}</Text>

        <View style={styles.editdelete}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => pushNavigation(APP_ROUTES.CreateMealPlan)}
          >
            <Image
              source={iconedit}
              resizeMode="contain"
              style={styles.editIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={deleteicon}
              resizeMode="contain"
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.planSubTitle}>
        {allIngredients.length} {allIngredients.length === 1 ? 'meal' : 'meals'}
      </Text>

      <ProgressBar
        progress={checked.length / (allIngredients.length || 1)}
        label={Strings.testPlanShopping_progress}
        progressText={Strings.testPlanShopping_progressText}
        containerStyle={styles.progressbar}
      />

      <FlatList
        data={allIngredients}
        keyExtractor={(item, index) => `${item.ingredientId}-${item.mealId}-${index}`}
        renderItem={renderIngredientItem}
        scrollEnabled={true}
        contentContainerStyle={{ paddingBottom: verticalScale(20) }}
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
