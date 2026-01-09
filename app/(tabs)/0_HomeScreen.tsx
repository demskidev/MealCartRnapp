import BaseButton from "@/components/BaseButton";
import {
  getCurrentMealCategory,
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";

import { foodimage, mealcartLogo, mealfoodH, userDummy } from "@/assets/images";
import { IconPlus, MealsLogo } from "@/assets/svg";
import CreateMealBottomSheet from "@/components/CreateMealBottomSheet";
import MealDetail from "@/components/MealDetail";
import { APP_ROUTES } from "@/constants/AppRoutes";
import { Strings } from "@/constants/Strings";
import { useLoader } from "@/context/LoaderContext";
import { Meal } from "@/reduxStore/slices/mealsSlice";
import { FontFamily } from "@/utils/Fonts";
import { pushNavigation } from "@/utils/Navigation";
import { useMealsViewModel } from "@/viewmodels/MealsViewModel";
import { usePlanViewModel } from "@/viewmodels/PlanViewModel";
import BottomSheet from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";

const { height } = Dimensions.get("window");
const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const { enrichedActivePlan, fetchActivePlan } = usePlanViewModel();
  const { recentMeals, fetchTheRecentMeals } = useMealsViewModel();
  const [activePlan, setActivePlan] = useState(enrichedActivePlan);
  const itemWidth = (width - horizontalScale(40) - horizontalScale(8)) / 2;

  useEffect(() => {
    fetchActivePlan();
    fetchTheRecentMeals();
  }, []);

  useEffect(() => {
    if (enrichedActivePlan) {
      setActivePlan(enrichedActivePlan);
      console.log("Active Plan in HomeScreen:", enrichedActivePlan);
    }
  }, [enrichedActivePlan]);

  const mealData = recentMeals;

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const { hideLoader } = useLoader();

  useEffect(() => {
    hideLoader();
  }, []);

  const { canStart, start, eventEmitter } = useTourGuideController();

  useFocusEffect(
    React.useCallback(() => {
      if (canStart) {
        // start()
      }
    }, [canStart])
  );

  // React.useEffect(() => {
  //   const onStop = () => {
  //     console.log('Tour closed by user')
  //   }

  //   eventEmitter?.on('stop', onStop)

  //   return () => {
  //     eventEmitter?.off('stop', onStop)
  //   }
  // }, [eventEmitter])

  useEffect(() => {
    setShowIntroPopup(true);
  }, []);

  const handleIntroNext = () => {
    setShowIntroPopup(false);
    setTimeout(() => {
      // start();
    }, 200);
  };

  const handleIntroSkip = () => {
    setShowIntroPopup(false);
  };

  const getTodayMeals = () => {
    if (!activePlan || !activePlan.days) return [];
    const todayName = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const todayObj = activePlan.days.find(
      (day) => day.dayTitle.toLowerCase() === todayName.toLowerCase()
    );
    if (!todayObj) return [];

    const currentMealCategory = getCurrentMealCategory();
    console.log("Current Meal Category:", todayObj);
    const filteredMeals = todayObj.mealSlots
      .filter((slot) => {
        const mealPlanName = slot.mealPlan?.name || "";
        console.log("Comparing:", mealPlanName, "with", currentMealCategory);
        return mealPlanName.toLowerCase() === currentMealCategory.toLowerCase();
      })
      .map((slot) => slot.meal)
      .filter(Boolean);

      console.log("Filtered Meals for Today:", filteredMeals);
    return filteredMeals;
  };

  const todayMeals = getTodayMeals();
  console.log("Today's Meals:", todayMeals);

  const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={styles.mealCard}>
      <Image
        source={item.imageUrl === "string" ? { uri: item.imageUrl } : mealfoodH}
        resizeMode="cover"
        style={styles.mealCardImage}
      />

      <View style={styles.mealCardContent}>
        <View style={styles.mealCardTitleRow}>
          <Text style={styles.mealNametext} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timeText}>
            {item.prepTime} • {item.difficulty}
          </Text>
        </View>
        <Text style={styles.mealCardDescription}>{item.description}</Text>

        <BaseButton
          title={Strings.home_view}
          gradientButton={false}
          backgroundColor={Colors.white}
          textStyle={[styles.mealCardButton]}
          textStyleText={styles.mealCardButtonText}
          onPress={() => navigateToMealDetail(item)}
        />
      </View>
    </View>
  );

  const goNext = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderEmptyList = () => (
    <View>
      <View
        style={[styles.emptyContainer, { width: width - horizontalScale(40) }]}
      >
        <Text style={styles.emptyText}>{Strings.home_noUpcomingMeals}</Text>
      </View>
    </View>
  );

  const navigateToMealDetail = (meal: Meal) => {
    router.push({
      pathname: "/appscreens/MealDetailScreen",
      params: { mealId: meal.id },
    });
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
        navigateToMealDetail(item);
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
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {selectedMeal ? (
        <MealDetail
          meal={selectedMeal}
          onBack={() => {
            setSelectedMeal(null);
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            extraScrollHeight={20}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={[Colors._667D4C, Colors._9DAF89]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.mainMealCartContainer}>
                <View style={styles.emptyView}></View>

                <View style={styles.mealcartLogoParent}>
                  <Image
                    source={mealcartLogo}
                    style={styles.mealcartLogoImage}
                    resizeMode="contain"
                  />

                  <Text style={styles.text}>{Strings.home_mealCart}</Text>
                </View>
                <View style={styles.parentGreetingAvatar}>
                  <View>
                    <Text style={styles.greetingText}>
                      {Strings.home_greeting}
                    </Text>
                    <Text style={styles.subgreetingText}>
                      {Strings.home_subgreeting}
                    </Text>
                  </View>
                  <TourGuideZone zone={4} shape="circle" borderRadius={30}>
                    <View style={styles.avatarContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(APP_ROUTES.ProfileScreen as any)
                        }
                      >
                        <Image
                          source={userDummy}
                          style={styles.image}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </TourGuideZone>
                </View>
                {todayMeals && todayMeals.length > 0 && (
                  <View style={styles.upcomingSection}>
                    <View style={styles.upcomingHeader}>
                      <TourGuideZone zone={3} shape="circle" borderRadius={16}>
                        <Text style={styles.upcomingText}>
                          {Strings.home_nextMeal}
                        </Text>
                      </TourGuideZone>

                      <TourGuideZone zone={1} shape="circle" borderRadius={100}>
                        <TouchableOpacity
                          onPress={() =>
                            pushNavigation(APP_ROUTES.TestMealPlan)
                          }
                        >
                          <Text style={styles.viewAllText}>
                            {Strings.home_viewAll}
                          </Text>
                        </TouchableOpacity>
                      </TourGuideZone>
                    </View>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={todayMeals}
                      renderItem={renderMealItem}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={styles.upcomingListContent}
                    />
                  </View>
                )}
              </View>
            </LinearGradient>

            <View style={styles.parentCreateMeal}>
              <TourGuideZone zone={2} shape="rectangle" borderRadius={10}>
                <BaseButton
                  title={Strings.home_addNewMeal}
                  gradientButton={true}
                  width={width * 0.41}
                  gradientStartColor={Colors._667D4C}
                  gradientEndColor={Colors._9DAF89}
                  gradientStart={{ x: 0, y: 0 }}
                  gradientEnd={{ x: 1, y: 0 }}
                  textColor={Colors.white}
                  rightChild={
                    <IconPlus
                      width={verticalScale(21)}
                      height={verticalScale(21)}
                    />
                  }
                  textStyle={styles.createMeal}
                  onPress={goNext}
                />
              </TourGuideZone>
              <TouchableOpacity
                style={styles.myMeals}
                activeOpacity={0.7}
                onPress={() => pushNavigation(APP_ROUTES.MEALS)}
              >
                <Text style={styles.myMealText}>{Strings.home_myMeals}</Text>
                <MealsLogo
                  width={verticalScale(21)}
                  height={verticalScale(21)}
                />
              </TouchableOpacity>
            </View>

            {mealData && mealData.length > 0 ? (
              <View style={styles.recentMealsContent}>
                <View style={styles.parentOfRecentMeal}>
                  <Text style={styles.recentText}>
                    {Strings.home_recentMeals}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAll(!showAll)}
                  >
                    <Text style={styles.viewText}>
                      {Strings.home_viewAllRecent}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginVertical: verticalScale(8),
                  }}
                >
                  {mealData.slice(0, 4).map((item, index) => (
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {Strings.meals_noMealsFound}
                </Text>
              </View>
            )}
          </KeyboardAwareScrollView>
          <CreateMealBottomSheet ref={bottomSheetRef} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    marginRight: moderateScale(16),
    width: width * 0.75,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: "visible",
    marginBottom: moderateScale(8),
  },
  mealCardImage: {
    width: "100%",
    height: verticalScale(120),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
    backgroundColor: Colors.white,
  },
  mealCardTagContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  mealCardTag: {
    fontSize: moderateScale(13),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  mealCardContent: {
    padding: moderateScale(12),
  },
  mealCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealCardTitle: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.ROBOTO_BLACK,
    color: "#222",
    flex: 1,
  },
  mealCardInfo: {
    fontSize: moderateScale(12),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.tertiary,
    marginLeft: 8,
  },
  mealCardDescription: {
    fontSize: moderateScale(10),
    color: Colors.tertiary,
    fontFamily: FontFamily.ROBOTO_REGULAR,
    marginTop: moderateScale(8),
  },
  mealCardButton: {
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(8),
    marginTop: moderateScale(16),
    paddingVertical: moderateScale(10),
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  mealCardButtonText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: moderateScale(25),
    fontWeight: "bold",
    color: Colors.white,
    marginLeft: horizontalScale(5),
    fontFamily: FontFamily.ROBOTO_BLACK,
  },
  gradient: {
    borderBottomLeftRadius: horizontalScale(35),
    borderBottomRightRadius: horizontalScale(35),
    overflow: "hidden",
  },
  mainMealCartContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(25),
    paddingBottom: verticalScale(20),
  },
  greetingText: {
    color: Colors.white,
    fontSize: moderateScale(28),
    fontWeight: 600,
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
  },
  subgreetingText: {
    color: Colors.buttonBackground,
    fontSize: moderateScale(14),
    fontWeight: "400",
    fontFamily: FontFamily.ROBOTO_REGULAR,
  },
  image: {
    width: horizontalScale(52),
    height: horizontalScale(52),
    borderWidth: moderateScale(1),
    borderColor: Colors.white,
    borderRadius: horizontalScale(26),
  },
  parentGreetingAvatar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(20),
    marginBottom: verticalScale(24),
  },

  upcomingSection: {
    marginTop: verticalScale(6),
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(9),
  },
  upcomingText: {
    fontSize: moderateScale(19),
    fontWeight: "600",
    color: Colors.white,
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: Colors.background,
    fontWeight: "500",
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  emptyText: {
    color: Colors.text,
    fontSize: moderateScale(14),
    fontWeight: "500",
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: height * 0.2,
    borderRadius: verticalScale(16),
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  emptyView: {
    height: verticalScale(45),
  },
  createMeal: {
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(8),
    fontWeight: "500",
    fontSize: moderateScale(14),
    color: Colors.white,
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  myMeals: {
    backgroundColor: Colors._F5F9FB,
    borderRadius: moderateScale(8),
    width: width * 0.41,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: moderateScale(12),
    fontFamily: FontFamily.ROBOTO_MEDIUM,
  },
  myMealText: {
    color: Colors.textBlack,
    fontSize: moderateScale(14),
    paddingHorizontal: horizontalScale(12),
    fontWeight: "500",
  },
  parentCreateMeal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: horizontalScale(18),
    marginVertical: verticalScale(25),
  },
  mealcartLogoParent: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  viewText: {
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.olive,
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
  mealCardContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    margin: moderateScale(8),
    flex: 1,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "visible",
  },
  mealCardMiniImage: {
    width: "99%",
    height: verticalScale(160),
    backgroundColor: Colors.white,
    alignSelf: "center",
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  mealCardMiniContent: {
    padding: moderateScale(12),
  },
  mealcartLogoImage: {
    width: verticalScale(21),
    height: verticalScale(28),
  },
  avatarContainer: {
    minHeight: moderateScale(70),
    minWidth: moderateScale(70),
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingListContent: {
    paddingVertical: 0,
    marginTop: verticalScale(9),
    paddingLeft: moderateScale(8),
    paddingRight: moderateScale(8),
  },
  recentMealsColumnWrapper: {
    justifyContent: "space-between",
    marginHorizontal: 8,
  },
  recentMealsContent: {
    paddingBottom: 16,
    marginHorizontal: horizontalScale(20),
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

export default HomeScreen;
