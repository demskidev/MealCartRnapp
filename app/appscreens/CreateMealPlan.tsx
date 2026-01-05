import { calendaricon, iconback, plusmeal } from '@/assets/images';
import { IconCartWhite } from '@/assets/svg';
import AddItemToList from '@/components/AddItemToList';
import BaseButton from '@/components/BaseButton';
import { APP_ROUTES } from '@/constants/AppRoutes';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useTourStep } from '@/context/TourStepContext';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TourGuideZone, useTourGuideController } from 'rn-tourguide';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window')
export default function CreateMealPlan({ navigation }) {
  const router = useRouter();
  const [zoneReady, setZoneReady] = useState(false);
  const [selectMeal, setSelectMeal] = useState(false);

  const { start, stop } = useTourGuideController();
  const { openMealModal, setOpenMealModal } = useTourStep();

  //   useEffect(() => {
  //     if (selectMeal) {
  //       stop(); // 🔥 removes previous tooltip
  //     }
  //   }, [selectMeal]);
  // useEffect(() => {
  //   if (modalZoneReady) {
  //     setTimeout(() => {
  //       start(7); // 🔥 modal tooltip
  //       setModalZoneReady(false);
  //     }, 300);
  //   }
  // }, [modalZoneReady]);
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (openMealModal) {
  //       setSelectMeal(true);

  //       // ✅ reset so it doesn't reopen again
  //       setOpenMealModal(false);
  //     }
  //   }, [openMealModal])
  // );
  // useEffect(() => {
  //   console.log("openMealModal:", openMealModal);
  //   if (openMealModal) {
  //     console.log("Opening modal!");
  //     setSelectMeal(true);
  //     setOpenMealModal(false);
  //   }
  // }, [openMealModal, setOpenMealModal]);

  const days = [
    {
      title: 'Monday',
      meals: ['Breakfast', 'Lunch', 'Dinner'],
    },
    {
      title: 'Tuesday',
      meals: ['Breakfast', 'Lunch', 'Dinner'],
    },
    {
      title: 'Wednesday',
      meals: ['Breakfast', 'Lunch', 'Dinner'],
    },
    {
      title: 'Thursday',
      meals: ['Breakfast', 'Lunch', 'Dinner'],
    },
  ];

// Start zone 6 when screen is ready
useFocusEffect(
  React.useCallback(() => {
    if (!zoneReady) return;

    const timeout = setTimeout(() => {
      start(6);
    }, 100);

    return () => clearTimeout(timeout);
  }, [zoneReady])
);

// When tour triggers modal opening
useEffect(() => {
  console.log("openMealModal:", openMealModal);
  if (openMealModal) {
    console.log("Opening modal for tour!");
    // start(8);
    // DON'T stop() - let the tour continue from zone 6 to zone 7
    setTimeout(() => {
      setSelectMeal(true);
      setOpenMealModal(false);
    }, 100);
  }
}, [openMealModal, setOpenMealModal]);

// Debug log for selectMeal changes
useEffect(() => {
  console.log("selectMeal changed to:", selectMeal);
}, [selectMeal]);


  // function renderDayCard({ item }) {
  //   return (

  //     <TourGuideZone zone={6} shape="rectangle" maskOffset={10}>

  //       <View style={styles.daySection}  onLayout={() => setZoneReady(true)} collapsable={false}  >
  //         <View style={styles.dayHeader}>
  //           <Text style={styles.dayTitle}>{item.title}</Text>
  //           <Text style={styles.dayDate}>[Date]</Text>
  //         </View>
  //         <View style={styles.mealRow}>
  //           {item.meals.map((meal, idx) => (
  //             <View key={meal + idx} style={styles.mealCol}>
  //               <Text style={styles.mealLabel}>{meal}</Text>
  //               <TouchableOpacity style={styles.mealBox}>
  //                 <Image
  //                   source={plusmeal}
  //                   resizeMode="contain"
  //                   style={styles.plusMealIcon}
  //                 />

  //               </TouchableOpacity>
  //             </View>
  //           ))}
  //         </View>
  //       </View>
  //     </TourGuideZone>

  //   );
  // }
  function renderDayCard({ item, index }) {
    const Content = (


      <View
        style={styles.daySection}
        onLayout={() => index === 0 && setZoneReady(true)}
        collapsable={false}
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{item.title}</Text>
          <Text style={styles.dayDate}>[Date]</Text>
        </View>

        <View style={styles.mealRow}>
          {item.meals.map((meal, idx) => (
            <View key={meal + idx} style={styles.mealCol}>
              <Text style={styles.mealLabel}>{meal}</Text>
              <TouchableOpacity style={styles.mealBox} onPress={() => setSelectMeal(true)}>
                <Image
                  source={plusmeal}
                  resizeMode="contain"
                  style={styles.plusMealIcon}
                />
              </TouchableOpacity>
            </View>

          ))}
        </View>
      </View>
    );

    // ✅ Only first item gets highlighted
    if (index === 0) {
      return (
        <TourGuideZone zone={6} shape="rectangle" maskOffset={10}>
          {Content}
        </TourGuideZone>
      );
    }

    return Content;
  }


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={iconback}
            resizeMode="contain"
            style={styles.backIconImage}
          />
        </TouchableOpacity>
        <Text style={styles.backText}>{Strings.createMealPlan_backToPlans}</Text>
      </View>
      <Text style={styles.label}>{Strings.createMealPlan_yourMealPlan}</Text>
      <TextInput
        style={styles.input}
        value={Strings.createMealPlan_mySpecialMealPlan}
        editable={false}
      />

      <Text style={styles.label}>{Strings.createMealPlan_startingDate}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.dateInput}
          value="4/10/2025"
          editable={false}
        />
        <Image
          source={calendaricon}
          style={styles.calendarIcon}
          resizeMode="contain"
        />
      </View>

      <FlatList
        data={days}
        keyExtractor={item => item.title}
        renderItem={renderDayCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.parentOfConfirmButton}>
        <BaseButton
          title={Strings.createMealPlan_discard}
          gradientButton={false}
          backgroundColor={Colors.white}
          width={width * 0.28}
          textStyle={styles.discardButton}
          textColor={Colors.error}
          textStyleText={styles.discardText}
          onPress={() => router.push(APP_ROUTES.LISTS)}
        />
        <BaseButton
          title={Strings.createMealPlan_save}
          gradientButton={true}
          width={width * 0.65}
          gradientStartColor={Colors._667D4C}
          gradientEndColor={Colors._9DAF89}
          gradientStart={{ x: 0, y: 0 }}
          gradientEnd={{ x: 1, y: 0 }}
          textColor={Colors.white}
          rightChild={<IconCartWhite width={verticalScale(21)} height={verticalScale(21)} />}
          textStyle={[styles.confirmButton,]}
          textStyleText={styles.saveShopping}
          onPress={() => router.push(APP_ROUTES.LISTS)}
        />
      </View>
      <AddItemToList
        visible={selectMeal}
        onClose={() => setSelectMeal(false)}
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

  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: moderateScale(14),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginLeft: horizontalScale(30),
  },

  label: {
    fontSize: moderateScale(12),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    marginBottom: verticalScale(6),
    marginTop: verticalScale(8),
  },
  input: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    height: verticalScale(50)
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingVertical: verticalScale(12),
    paddingRight: horizontalScale(10),
    height: verticalScale(50)


  },
  calendarIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
  },
  daySection: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(12),
    elevation: 4,

    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  dayTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
  },
  dayDate: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealCol: {

  },
  mealLabel: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    marginBottom: verticalScale(6),
  },
  mealBox: {
    width: width * 0.25,
    height: moderateScale(40),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    borderColor: Colors.tertiary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  plus: {
    fontSize: moderateScale(22),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
  },
  cancelButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,

    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  parentOfConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(55),
    marginHorizontal: moderateScale(-5)
  },
  discardText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error
  },
  saveShopping: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(16),
    color: Colors.white
  },
  confirmButton: {
    color: Colors.white,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(13)
  },
  plusMealIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: 'center',
  },
  backIconImage: {
    width: moderateScale(24),
    height: moderateScale(24),
    alignSelf: 'flex-end',
    marginRight: horizontalScale(-11),
  },
  dateInput: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(4),
    paddingHorizontal: horizontalScale(12),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    height: verticalScale(50),
    flex: 1,
    paddingVertical: 0,
  },
  flatListContent: {
    paddingBottom: 32,
  },
  discardButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    color: Colors.error,
  },
});