import BaseButton from '@/components/BaseButton';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';

import { IconPlus, MealsLogo } from "@/assets/svg";
import CreateMealBottomSheet from '@/components/CreateMealBottomSheet';
import { FontFamily } from '@/utils/Fonts';
import BottomSheet from '@gorhom/bottom-sheet';
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
        start()
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

  const renderMealItem = () => (
    <View>
      <Text>'Hello'</Text>
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

  return (

    <SafeAreaView style={styles.container} edges={['left', 'right']}>
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
              <View style={{minHeight:moderateScale(70), minWidth:moderateScale(70), justifyContent:'center', alignItems:'center'} }>
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
              data={meals}
              renderItem={renderMealItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyList}
              contentContainerStyle={{ paddingVertical: 0, marginTop: verticalScale(9) }}
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
      <CreateMealBottomSheet ref={bottomSheetRef} />
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
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
    paddingBottom: verticalScale(20)
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

  }


});

export default HomeScreen;