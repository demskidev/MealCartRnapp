import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies, } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';

import { IconPlus, MealsLogo } from "@/assets/svg";
import CreateMealBottomSheet from '@/components/CreateMealBottomSheet';
import MealDetail from '@/components/MealDetail';
import { useLoader } from '@/context/LoaderContext';
import { FontFamily } from '@/utils/Fonts';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourGuideZone, useTourGuideController } from 'rn-tourguide';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [showIntroPopup, setShowIntroPopup] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation();
  const mealData = [
    { id: '1', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodA.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '2', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodB.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '3', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodC.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '4', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodD.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '5', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodE.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '6', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodF.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '7', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodG.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '8', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodH.png'), time: '30 min', difficulty: 'Moderate' },
    // ...add more items as needed
  ];

  const [selectedMeal, setSelectedMeal] = useState(null);
  const { hideLoader } = useLoader();

  useEffect(() => {
    hideLoader(); // turn off loader when Home is ready
  }, []);
  interface Meal {
    id: string;
    name: string;
    calories: number;
  }
  const meals: Meal[] = [];
  const {
    canStart,
    start,
    eventEmitter,
  } = useTourGuideController()

  // 🔹 Always start when Home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (canStart) {
        // start()
      }
    }, [canStart])
  )

  React.useEffect(() => {
    const onStop = () => {
      console.log('Tour closed by user')
    }

    eventEmitter?.on('stop', onStop)

    return () => {
      eventEmitter?.off('stop', onStop)
    }
  }, [eventEmitter])


  useEffect(() => {
    setShowIntroPopup(true);
  }, []);

  const handleIntroNext = () => {
    setShowIntroPopup(false);
    setTimeout(() => {
      start();
    }, 200);
  };

  const handleIntroSkip = () => {
    setShowIntroPopup(false);
  };

  const renderMealItem = ({ item }) => (
    <View style={styles.mealCard}>
      <Image
        source={item.image}
        resizeMode="cover"
        style={styles.mealCardImage}
      />
      {/* <View style={styles.mealCardTagContainer}>
        <Text style={styles.mealCardTag}>{item.tag}</Text>
      </View> */}
      <View style={styles.mealCardContent}>
        <View style={styles.mealCardTitleRow}>
          <Text style={styles.mealNametext} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.timeText}>{item.time}  •  {item.difficulty}</Text>
        </View>
        <Text style={styles.mealCardDescription}>Some sort of description etc. Big Card if we want more information here</Text>
        {/* <TouchableOpacity style={styles.mealCardButton}>
          <Text style={styles.mealCardButtonText}>View</Text>
        </TouchableOpacity> */}

        <BaseButton
          title="View"
          gradientButton={false}
          backgroundColor={Colors.white}
          // width={width * 0.41}

          textStyle={[styles.mealCardButton]}
          textStyleText={styles.mealCardButtonText}

          onPress={() => setSelectedMeal(item)}
        />


      </View>
    </View>
  );

  const goNext = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderEmptyList = () => (
    <View>
      <View style={[styles.emptyContainer, { width: width - horizontalScale(40) }]}>
        <Text style={styles.emptyText}>No upcoming meals. Add one!</Text>

      </View>
    </View>
  );
  const renderMealCard = ({ item }) => (
    <View style={{
      backgroundColor: Colors.white,
      borderRadius: moderateScale(8),
      margin: moderateScale(8),
      flex: 1,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'visible'
    }}>
      <Image source={item.image} resizeMode="cover" style={{ width: '99%', height: verticalScale(160), backgroundColor: Colors.white, alignSelf: 'center', borderTopLeftRadius: moderateScale(8), borderTopRightRadius: moderateScale(8) }}
      />
      {/* <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#F5F5F5', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 }}>
        <Text style={styles.mealNametext}>{item.tag}</Text>
      </View> */}
      <View style={{ padding: moderateScale(12) }}>
        <Text style={styles.mealNametext} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.timeText}>{item.time}  •  {item.difficulty}</Text>
      </View>
    </View>
  );

  return (

    <SafeAreaView style={styles.container} edges={['left', 'right']}>

      {selectedMeal ? (
        // 👉 WHEN state changes (View button pressed)
        <MealDetail
          meal={selectedMeal}
          onBack={() => {
            setSelectedMeal(null);


          }}
        />
      ) : (

        <View>
          <LinearGradient
            colors={['#667D4C', '#9DAF89']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.mainMealCartContainer}>
              <View style={styles.emptyView}></View>

              <View style={styles.mealcartLogoParent}>
                <Image
                  source={require("@/assets/images/mealcartLogo.png")}
                  style={{ width: verticalScale(21), height: verticalScale(28) }}
                  resizeMode="contain"
                />

                <Text style={styles.text}>MealCart</Text>
              </View>
              <View style={styles.parentGreetingAvatar}>
                <View>
                  <Text style={styles.greetingText}>Hello there!</Text>
                  <Text style={styles.subgreetingText}>What delicious meal are you planning today?</Text>
                </View>
                <TourGuideZone zone={4} shape="circle" borderRadius={30} >
                  <View style={{ minHeight: moderateScale(70), minWidth: moderateScale(70), justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                      source={require('@/assets/images/userDummy.png')}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                </TourGuideZone>
              </View>
              <View style={styles.upcomingSection}>
                <View style={styles.upcomingHeader}>
                  <TourGuideZone zone={3} shape="circle" borderRadius={16}>

                    <Text style={styles.upcomingText}>Your Next Meal</Text>
                  </TourGuideZone>

                  <TourGuideZone zone={1} shape="circle" borderRadius={100}>

                    <TouchableOpacity onPress={() => console.log('View All pressed')}>
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </TourGuideZone>

                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={mealData}
                  renderItem={renderMealItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingVertical: 0, marginTop: verticalScale(9), paddingLeft: moderateScale(8), paddingRight: moderateScale(8) }}
                />
              </View>
            </View>
          </LinearGradient>
          <View style={styles.parentCreateMeal}>
            <TourGuideZone zone={2} shape="rectangle" borderRadius={10}>
              <BaseButton
                title={'Add New Meal'}
                gradientButton={true}
                width={width * 0.41}
                gradientStartColor="#667D4C"
                gradientEndColor="#9DAF89"
                gradientStart={{ x: 0, y: 0 }}
                gradientEnd={{ x: 1, y: 0 }}
                textColor={Colors.white}
                rightChild={<IconPlus width={verticalScale(21)} height={verticalScale(21)} />}
                textStyle={styles.createMeal}
                onPress={goNext}
                showPressedShadow={true}
              />
            </TourGuideZone>
            <TouchableOpacity
              style={styles.myMeals}
              activeOpacity={0.7}
            >
              <Text style={styles.myMealText}>My Meals</Text>
              <MealsLogo width={verticalScale(21)} height={verticalScale(21)} />
            </TouchableOpacity>
          </View>


          <View style={styles.parentOfRecentMeal}>
            <Text style={styles.recentText}>Recent Meals</Text>
            <TouchableOpacity
              // style={styles.myMeals}
              activeOpacity={0.7}
              onPress={() => setShowAll(!showAll)}
            >
              <Text style={styles.viewText}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={showAll ? mealData : mealData.slice(0, 2)}
            renderItem={renderMealCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 8 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />

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
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'visible',
    marginBottom: moderateScale(8),
  },
  mealCardImage: {
    width: '100%',
    height: verticalScale(120),
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
    backgroundColor: Colors.white,
  },
  mealCardTagContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F5F5F5',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealCardTitle: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.ROBOTO_BLACK,
    color: '#222',
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
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: horizontalScale(5),
    fontFamily: FontFamily.ROBOTO_BLACK
  },
  gradient: {
    borderBottomLeftRadius: horizontalScale(35),
    borderBottomRightRadius: horizontalScale(35),
    overflow: 'hidden',
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
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD

  },
  subgreetingText: {
    color: Colors.buttonBackground,
    fontSize: moderateScale(14),
    fontWeight: "400",
    fontFamily: FontFamily.ROBOTO_REGULAR

  },
  image: {
    width: horizontalScale(52),
    height: horizontalScale(52),
    borderWidth: moderateScale(1),
    borderColor: Colors.white,
    borderRadius: horizontalScale(26)
  },
  parentGreetingAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(24)
  },


  upcomingSection: {
    marginTop: verticalScale(6)

  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(9),

  },
  upcomingText: { fontSize: moderateScale(19), fontWeight: '600', color: Colors.white, fontFamily: FontFamily.ROBOTO_SEMI_BOLD },
  viewAllText: { fontSize: moderateScale(14), color: '#EBEBEB', fontWeight: '500', fontFamily: FontFamily.ROBOTO_MEDIUM },
  emptyText: {
    color: Colors.text,
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: FontFamily.ROBOTO_MEDIUM
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: height * 0.2,
    borderRadius: verticalScale(16),
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  emptyView: {
    height: verticalScale(45)
  },
  createMeal: {
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(8),
    fontWeight: '500',
    fontSize: moderateScale(14),
    color: Colors.white,
    fontFamily: FontFamily.ROBOTO_MEDIUM

  },
  myMeals: {
    backgroundColor: '#F5F9FB',
    borderRadius: moderateScale(8),
    width: width * 0.41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    fontFamily: FontFamily.ROBOTO_MEDIUM



  },
  myMealText: {
    color: "#0F0F0F",
    fontSize: moderateScale(14),
    paddingHorizontal: horizontalScale(12),
    fontWeight: '500',

  },
  parentCreateMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: horizontalScale(18),
    marginVertical: verticalScale(25)
  },
  mealcartLogoParent: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  parentOfRecentMeal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(22)

  },
  recentText: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    color: Colors.primary
  },
  viewText: {
    fontFamily: FontFamily.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.olive
  },
  mealNametext: {

    fontSize: moderateScale(14), fontFamily: FontFamily.ROBOTO_MEDIUM, color: Colors.primary
  },
  timeText: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.tertiary
  }


});

export default HomeScreen;