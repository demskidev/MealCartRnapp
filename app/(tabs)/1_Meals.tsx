import {
  browseicon,
  closeIcon,
  filtericon,
  foodimage,
  gradientclose,
} from "@/assets/images";

import { SearchIcon } from "@/assets/svg";
import FilterModal from "@/components/FilterModal";
import { hideLoader, showLoader } from "@/components/Loader";
import { APP_ROUTES } from "@/constants/AppRoutes";
import {
  horizontalScale,
  isAndroid,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Filters } from "@/constants/interfaces";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { Meal } from "@/reduxStore/slices/mealsSlice";
import { FontFamily } from "@/utils/Fonts";
import { pushNavigation } from "@/utils/Navigation";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");
const MealsScreen: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const itemWidth = (width - horizontalScale(50)) / 2;

  const [isMyMeals, setIsMyMeals] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    meals,
    recentMeals,
  } = useMealsViewModel();

  const [normalMeals, setNormalMeals] = useState<Meal[]>([]);
  const [normalLastDoc, setNormalLastDoc] = useState<any>(null);
  const [normalIsEndReached, setNormalIsEndReached] = useState(false);
  const [normalIsLoadingMore, setNormalIsLoadingMore] = useState(false);
  const NORMAL_PAGE_SIZE = 2;

  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [filteredLastDoc, setFilteredLastDoc] = useState<any>(null);
  const [filteredIsEndReached, setFilteredIsEndReached] = useState(false);
  const [filteredIsLoadingMore, setFilteredIsLoadingMore] = useState(false);
  const FILTERED_PAGE_SIZE = 10;

  const hasActiveFilters =
    filters.category || filters.difficulty || filters.prepTime || search;

  const displayMeals = hasActiveFilters ? filteredMeals : normalMeals;

  useEffect(() => {
    const loadData = async () => {
      showLoader();
      await Promise.all([
        new Promise<void>((resolve) => {
          fetchMeals(
            (data) => {
              if (data.length < NORMAL_PAGE_SIZE) {
                setNormalIsEndReached(true);
              }
              setNormalMeals(data);
              if (data.length > 0) {
                setNormalLastDoc(data[data.length - 1]);
              }
              resolve();
            },
            (error) => {
              resolve();
            },
            NORMAL_PAGE_SIZE,
            null,
          );
        }),
        new Promise<void>((resolve) => {
          fetchTheRecentMeals(
            () => resolve(),
            () => resolve(),
          );
        }),
      ]);
      hideLoader();
    };

    loadData();
  }, []);

  useEffect(() => {
    if (hasActiveFilters) {
      setFilteredMeals([]);
      setFilteredLastDoc(null);
      setFilteredIsEndReached(false);
      loadFilteredMeals(true);
    }
  }, [filters, search]);

  useEffect(() => {
    if (!hasActiveFilters && meals.length > 0) {
      // Sync normalMeals with all Redux meals (includes newly added meals)
      setNormalMeals(meals);
      if (meals.length > 0) {
        setNormalLastDoc(meals[meals.length - 1]);
      }
      // Don't mark as end reached if we have Redux meals
      setNormalIsEndReached(false);
    }
  }, [meals, hasActiveFilters]);

  const loadInitialMeals = async () => {
    setNormalMeals([]);
    setNormalLastDoc(null);
    setNormalIsEndReached(false);

    fetchMeals(
      (data) => {
        if (data.length < NORMAL_PAGE_SIZE) {
          setNormalIsEndReached(true);
        }
        setNormalMeals(data);
        if (data.length > 0) {
          setNormalLastDoc(data[data.length - 1]);
        }
      },
      (error) => {},
      NORMAL_PAGE_SIZE,
      null,
    );
  };

  const loadMoreNormalMeals = async () => {
    if (
      normalIsEndReached ||
      loading ||
      normalIsLoadingMore ||
      !normalLastDoc ||
      hasActiveFilters
    ) {
      return;
    }

    setNormalIsLoadingMore(true);

    fetchMeals(
      (data) => {
        if (data.length < NORMAL_PAGE_SIZE) {
          setNormalIsEndReached(true);
        }

        setNormalMeals((prev) => {
          const existingIds = new Set(prev.map((meal: Meal) => meal.id));
          const newMeals = data.filter(
            (meal: Meal) => !existingIds.has(meal.id),
          );
          return [...prev, ...newMeals];
        });

        if (data.length > 0) {
          setNormalLastDoc(data[data.length - 1]);
        }
        setNormalIsLoadingMore(false);
      },
      (error) => {
        setNormalIsLoadingMore(false);
      },
      NORMAL_PAGE_SIZE,
      normalLastDoc,
    );
  };

  const loadFilteredMeals = async (isInitial: boolean = false) => {
    if (!isInitial && (filteredIsEndReached || filteredIsLoadingMore)) {
      return;
    }

    setFilteredIsLoadingMore(true);

    showLoader();
    searchMealsCombined(
      {
        category: filters.category,
        difficulty: filters.difficulty,
        prepTime: filters.prepTime,
        searchText: search,
        limit: FILTERED_PAGE_SIZE,
        startAfter: isInitial ? null : filteredLastDoc,
      },
      (data) => {
        if (data.length < FILTERED_PAGE_SIZE) {
          setFilteredIsEndReached(true);
        }

        if (isInitial) {
          setFilteredMeals(data);
        } else {
          setFilteredMeals((prev) => {
            const existingIds = new Set(prev.map((meal: Meal) => meal.id));
            const newMeals = data.filter(
              (meal: Meal) => !existingIds.has(meal.id),
            );
            return [...prev, ...newMeals];
          });
        }
        if (data.length > 0) {
          setFilteredLastDoc(data[data.length - 1]);
        }
        setFilteredIsLoadingMore(false);
        hideLoader();
      },
      (error) => {
        hideLoader();
        setFilteredIsLoadingMore(false);
      },
    );
  };

  const handleScrollViewScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (
      isCloseToBottom &&
      !normalIsEndReached &&
      !loading &&
      !normalIsLoadingMore
    ) {
      loadMoreNormalMeals();
    }
  };

  const handleFilteredEndReached = () => {
    if (!filteredIsEndReached && !loading && !filteredIsLoadingMore) {
      loadFilteredMeals(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    if (hasActiveFilters) {
      // Refresh filtered meals
      setFilteredMeals([]);
      setFilteredLastDoc(null);
      setFilteredIsEndReached(false);

      searchMealsCombined(
        {
          category: filters.category,
          difficulty: filters.difficulty,
          prepTime: filters.prepTime,
          searchText: search,
          limit: FILTERED_PAGE_SIZE,
          startAfter: null,
        },
        (data) => {
          if (data.length < FILTERED_PAGE_SIZE) {
            setFilteredIsEndReached(true);
          }
          setFilteredMeals(data);
          if (data.length > 0) {
            setFilteredLastDoc(data[data.length - 1]);
          }
          setRefreshing(false);
        },
        (error) => {
          setRefreshing(false);
        },
      );
    } else {
      // Refresh normal meals and recent meals
      setNormalMeals([]);
      setNormalLastDoc(null);
      setNormalIsEndReached(false);

      fetchMeals(
        (data) => {
          if (data.length < NORMAL_PAGE_SIZE) {
            setNormalIsEndReached(true);
          }
          setNormalMeals(data);
          if (data.length > 0) {
            setNormalLastDoc(data[data.length - 1]);
          }
          fetchTheRecentMeals();
          setRefreshing(false);
        },
        (error) => {
          setRefreshing(false);
        },
        NORMAL_PAGE_SIZE,
        null,
      );
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
      }}
      onPress={() => {
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
      <View style={{ flex: 1 }}>
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
            onPress={() =>
              pushNavigation(APP_ROUTES.CREATE_MEAL, { mode: "create" })
            }
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
              placeholder={Strings.meals_searchPlaceholder}
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: verticalScale(10) }}
            onScroll={handleScrollViewScroll}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          >
            {!recentMeals && !normalMeals ? (
              <Text style={styles.emptyText}>{Strings.meals_noMealsFound}</Text>
            ) : (
              <View style={{ flex: 1, marginTop: verticalScale(10) }}>
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
                            marginHorizontal: horizontalScale(2),
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

                    <FlatList
                      data={normalMeals}
                      renderItem={renderMealCard}
                      keyExtractor={(item) => item.id}
                      numColumns={2}
                      columnWrapperStyle={{
                        justifyContent: "space-between",
                        marginBottom: verticalScale(8),
                      }}
                      scrollEnabled={false}
                      contentContainerStyle={{
                        paddingBottom: verticalScale(100),
                        marginHorizontal: horizontalScale(2),
                      }}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}

                {normalIsLoadingMore && normalMeals.length > 0 && (
                  <View style={{ paddingVertical: verticalScale(20) }}>
                    {/* <Loader visible={true} /> */}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, marginTop: verticalScale(10) }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: verticalScale(10),
              }}
            >
              <Text style={styles.recentText}>{Strings.meals_allMeals}</Text>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(6),
                }}
                onPress={() => {
                  setFilters({
                    category: null,
                    difficulty: null,
                    prepTime: null,
                  });
                  setSearch("");
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontFamily: FontFamilies.ROBOTO_MEDIUM,
                    color: Colors.tertiary,
                  }}
                >
                  {Strings.clearFilters}
                </Text>
                <Image
                  source={closeIcon}
                  resizeMode="contain"
                  style={{
                    width: moderateScale(16),
                    height: moderateScale(16),
                  }}
                />
              </TouchableOpacity>
            </View>

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
              onEndReached={handleFilteredEndReached}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {Strings.meals_recentMealsFound}
                </Text>
              }
              ListFooterComponent={
                hasActiveFilters &&
                filteredIsLoadingMore &&
                filteredMeals.length > 0 ? (
                  <></>
                ) : // <Loader visible={true} />
                null
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20),
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
    height: isAndroid ? verticalScale(50) : verticalScale(44),
    paddingHorizontal: horizontalScale(12),
    width: width * 0.6,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
    textAlignVertical: "center",
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
