import {
  browseicon,
  filtericon,
  foodimage,
  gradientclose,
} from "@/assets/images";

import { SearchIcon } from "@/assets/svg";
import CreateMealBottomSheet from "@/components/CreateMealBottomSheet";
import FilterModal from "@/components/FilterModal";
import Loader from "@/components/Loader";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Filters } from "@/constants/interfaces";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { Meal } from "@/reduxStore/slices/mealsSlice";
import { FontFamily } from "@/utils/Fonts";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");
const MealsScreen: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const itemWidth = (width - horizontalScale(40) - horizontalScale(8)) / 2;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [isMyMeals, setIsMyMeals] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Filters>({
    category: null,
    difficulty: null,
    prepTime: null,
  });

  const {
    fetchMeals,
    searchMealsCombined,
    fetchTheRecentMeals,
    loading,
    error,
    recentMeals,
  } = useMealsViewModel();

  const [normalMeals, setNormalMeals] = useState<Meal[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null); // Changed from lastVisible
  const [isEndReached, setIsEndReached] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 2;

  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const hasActiveFilters =
    filters.category || filters.difficulty || filters.prepTime || search;

  // Display meals: show filtered meals if filters active, otherwise normal meals
  const displayMeals = hasActiveFilters ? filteredMeals : normalMeals;

  useEffect(() => {
    loadInitialMeals();
    fetchTheRecentMeals();
  }, []);

  useEffect(() => {
    if (hasActiveFilters) {
      loadFilteredMeals();
    }
  }, [filters, search]);

  // useEffect(() => {
  //   const result = paginatedMeals.filter((item: Meal) => {
  //     if (search && !item.name?.toLowerCase().includes(search.toLowerCase())) {
  //       return false;
  //     }
  //     if (filters.category && item.category !== filters.category) {
  //       return false;
  //     }
  //     if (filters.difficulty && item.difficulty !== filters.difficulty) {
  //       return false;
  //     }
  //     if (filters.prepTime) {
  //       const time = getPrepTimeMinutes(item.prepTime);
  //       if (filters.prepTime === "< 5 Mins" && time >= 5) return false;
  //       if (filters.prepTime === "5 - 10 Mins" && (time < 5 || time > 10))
  //         return false;
  //       if (filters.prepTime === "10 - 15 Mins" && (time < 10 || time > 15))
  //         return false;
  //       if (filters.prepTime === "> 15 Mins" && time <= 15) return false;
  //     }
  //     return true;
  //   });
  //   setFilteredMeals(result);
  // }, [paginatedMeals, search, filters]);

  const loadInitialMeals = async () => {
    console.log("Loading initial meals");
    setNormalMeals([]);
    setLastDoc(null);
    setIsEndReached(false);

    fetchMeals(
      (data) => {
        console.log("Initial meals fetched:", data.length);
        if (data.length < PAGE_SIZE) {
          setIsEndReached(true);
        }
        setNormalMeals(data);
        if (data.length > 0) {
          setLastDoc(data[data.length - 1]);
        }
      },
      (error) => {
        console.error("Error fetching initial meals:", error);
      },
      PAGE_SIZE,
      null
    );
  };

  const loadMoreMeals = async () => {
    if (
      isEndReached ||
      loading ||
      isLoadingMore ||
      !lastDoc ||
      hasActiveFilters
    ) {
      console.log("Skipping load more:", {
        isEndReached,
        loading,
        isLoadingMore,
        hasLastDoc: !!lastDoc,
        hasActiveFilters,
      });
      return;
    }

    console.log("Loading more meals");
    setIsLoadingMore(true);

    fetchMeals(
      (data) => {
        console.log("More meals fetched:", data.length);
        if (data.length < PAGE_SIZE) {
          setIsEndReached(true);
        }

        setNormalMeals((prev) => {
          const existingIds = new Set(prev.map((meal: Meal) => meal.id));
          const newMeals = data.filter(
            (meal: Meal) => !existingIds.has(meal.id)
          );
          console.log("New meals to add:", newMeals.length);
          return [...prev, ...newMeals];
        });

        if (data.length > 0) {
          setLastDoc(data[data.length - 1]);
        }
        setIsLoadingMore(false);
      },
      (error) => {
        console.error("Error loading more meals:", error);
        setIsLoadingMore(false);
      },
      PAGE_SIZE,
      lastDoc
    );
  };

  const loadFilteredMeals = async () => {
    console.log("Loading filtered meals with:", { filters, search });
    setIsLoadingFiltered(true);

    searchMealsCombined(
      {
        category: filters.category,
        difficulty: filters.difficulty,
        prepTime: filters.prepTime,
        searchText: search,
      },
      (data) => {
        console.log("Filtered meals fetched:", data.length);
        setFilteredMeals(data);
        setIsLoadingFiltered(false);
      },
      (error) => {
        console.error("Error fetching filtered meals:", error);
        setIsLoadingFiltered(false);
      }
    );
  };

  const handleEndReached = () => {
    console.log("End reached", { isEndReached, loading, isLoadingMore });
    if (!isEndReached && !loading && !isLoadingMore) {
      loadMoreMeals();
    }
  };

  const renderMealCard = ({ item, index }: { item: Meal; index: number }) => (
    <Pressable
      style={{
        backgroundColor: Colors.white,
        borderRadius: moderateScale(8),
        marginTop: moderateScale(8),
        width: itemWidth,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        overflow: "visible",
        marginBottom: verticalScale(8),
        marginRight: index % 2 === 0 ? horizontalScale(14) : 0,
      }}
      onPress={() => {
        console.log("Selected Meal:", item);
        router.push({
          pathname: "/appscreens/MealDetailScreen",
          params: { mealId: item.id },
        });
      }}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : foodimage}
        resizeMode="cover"
        style={{
          width: "99%",
          height: verticalScale(105),
          backgroundColor: Colors.white,
          alignSelf: "center",
          borderTopLeftRadius: moderateScale(8),
          borderTopRightRadius: moderateScale(8),
        }}
      />

      <View style={styles.tagContainer}>
        <Text style={styles.tagText}>{item.category}</Text>
      </View>

      <View style={{ padding: moderateScale(12) }}>
        <Text style={styles.mealNametext} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.timeText}>
          {item.prepTime} • {item.difficulty}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View>
        <View style={styles.topTextParent}>
          <View style={styles.parentMymeal}>
            <View>
              <Text style={styles.title}>
                {isMyMeals ? Strings.meals_myMeals : Strings.meals_browseMeals}
              </Text>
              {!hasActiveFilters && (
                <Text style={styles.subtitle}>
                  {isMyMeals
                    ? Strings.meals_browseMeals
                    : Strings.meals_myMeals}
                </Text>
              )}
            </View>

            {!hasActiveFilters && (
              <TouchableOpacity
                style={{ marginLeft: horizontalScale(6) }}
                onPress={() => setIsMyMeals((prev) => !prev)}
              >
                <Image
                  source={browseicon}
                  resizeMode="contain"
                  style={{
                    width: moderateScale(24),
                    height: moderateScale(26),
                  }}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.snapToIndex(0)}
          >
            <Image
              source={gradientclose}
              resizeMode="contain"
              style={{
                width: moderateScale(56),
                height: moderateScale(56),
                alignSelf: "flex-end",
                marginRight: horizontalScale(-17),
              }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.parentSearchBox}>
          <View style={styles.searchBox}>
            <SearchIcon
              width={verticalScale(22)}
              height={verticalScale(22)}
              color={Colors.tertiary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your meals..."
              placeholderTextColor={Colors.tertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Image
              source={filtericon}
              resizeMode="contain"
              style={{ width: moderateScale(24), height: moderateScale(24) }}
            />
          </TouchableOpacity>
        </View>

        {!hasActiveFilters && isMyMeals ? (
          <View style={{ marginTop: verticalScale(10) }}>
            {!recentMeals && !normalMeals ? (
              <Text style={styles.emptyText}>{Strings.meals_noMealsFound}</Text>
            ) : (
              <View>
                {recentMeals && recentMeals.length > 0 ? (
                  <View>
                    <Text style={styles.recentText}>
                      {Strings.home_recentMeals}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        marginBottom: verticalScale(8),
                      }}
                    >
                      {recentMeals.slice(0, 4).map((item, index) => (
                        <View
                          key={item.id}
                          style={{
                            width: itemWidth,
                            marginBottom: verticalScale(8),
                          }}
                        >
                          {renderMealCard({ item, index })}
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    {Strings.meals_noMealsFound}
                  </Text>
                )}

                {normalMeals && normalMeals.length > 0 && (
                  <View>
                    <Text style={styles.upcomingText}>
                      {Strings.meals_yourMeals}
                    </Text>
                    <View style={{ height: height * 0.3 }}>
                      <FlatList
                        data={normalMeals}
                        renderItem={renderMealCard}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{
                          justifyContent: "space-between",
                          marginBottom: verticalScale(8),
                        }}
                        contentContainerStyle={{
                          paddingBottom: verticalScale(100),
                        }}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={1}
                        ListFooterComponent={
                          !hasActiveFilters &&
                          isLoadingMore &&
                          normalMeals.length > 0 ? (
                            <Loader visible={true} />
                          ) : null
                        }
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1, marginTop: verticalScale(10) }}>
            <Text
              style={[styles.recentText, { marginVertical: verticalScale(10) }]}
            >
              {Strings.meals_allMeals}
            </Text>

            <FlatList
              data={displayMeals}
              renderItem={renderMealCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: verticalScale(8),
              }}
              contentContainerStyle={{ paddingBottom: 160 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {Strings.meals_recentMealsFound}
                </Text>
              }
            />
          </View>
        )}

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onConfirm={(selectedFilters: Filters) => {
            setFilters(selectedFilters);
            setFilterModalVisible(false);
          }}
          onReset={() => {
            setFilters({
              category: null,
              difficulty: null,
              prepTime: null,
            });
          }}
        />
      </View>
      <CreateMealBottomSheet ref={bottomSheetRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(15),
  },

  title: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(21),
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(12),
    color: Colors._667D4C,
    marginTop: verticalScale(3),
  },
  parentMymeal: {
    flexDirection: "row",
    alignItems: "center",
  },
  topTextParent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: moderateScale(30),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(44),
    width: width * 0.6,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
    marginLeft: horizontalScale(8),
  },
  parentSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(8),
    justifyContent: "space-between",
  },
  parentOfRecentMeal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentText: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(4),
  },
  mealNametext: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  timeText: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.tertiary,
  },
  upcomingText: {
    fontSize: moderateScale(21),
    fontWeight: "600",
    color: Colors.primary,
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    marginVertical: verticalScale(14),
  },
  emptyText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    textAlign: "center",
  },
  mealCardContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(8),
    flex: 1,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "visible",
    marginBottom: verticalScale(8),
  },
  mealCardImage: {
    width: "99%",
    height: verticalScale(105),
    backgroundColor: Colors.white,
    alignSelf: "center",
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  mealCardContent: {
    padding: moderateScale(12),
  },
  browseIconContainer: {
    marginLeft: horizontalScale(6),
  },
  browseIcon: {
    width: moderateScale(24),
    height: moderateScale(26),
  },
  gradientCloseImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    alignSelf: "flex-end",
    marginRight: horizontalScale(-17),
  },
  filterIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  recentMealsContainer: {
    height: height * 0.35,
  },
  yourMealsContainer: {
    height: height * 0.3,
  },
  browseMealsContainer: {
    flex: 1,
  },
  allMealsText: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(4),
    marginVertical: verticalScale(10),
  },
  flatListColumnWrapper: {
    justifyContent: "space-between",
    marginBottom: verticalScale(8),
  },
  recentMealsContent: {
    paddingBottom: 60,
  },
  yourMealsContent: {
    paddingBottom: verticalScale(100),
  },
  browseMealsContent: {
    paddingBottom: 160,
  },
  tagContainer: {
    backgroundColor: Colors._FFFFFF97,
    borderRadius: moderateScale(16),
    paddingHorizontal: horizontalScale(12),
    position: "absolute",
    end: 0,
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(8),
    marginRight: horizontalScale(10),
  },
  tagText: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.ROBOTO_REGULAR,
    color: Colors.primary,
  },
});

export default MealsScreen;
