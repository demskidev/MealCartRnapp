import BaseButton from '@/components/BaseButton';
import ConfirmationModal from '@/components/ConfirmationModal';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window')

const shoppingLists = [
  { id: '1', name: 'Test Plan', created: 'October 2, 2025', meals: '8 meals' },
  { id: '2', name: 'Test Plan 2', created: 'October 1, 2025', meals: '24 meals' },
];
const PlansScreen: React.FC = () => {
  const [pausePlan, setPausePlan] = useState(false);
  const [showResumePlan, setShowResumePlan] = useState(false);
  const router = useRouter();
  const renderShoppingList = ({ item }) => (
    <View style={styles.listCard}>
      <Text style={styles.listTitle}>{item.name}</Text>

      <View style={styles.listItem}>
        <View>
          <Text style={styles.listDate}>{showResumePlan ? "Started :" : "Created:"} {item.created}</Text>

        </View>

        <Text style={styles.listDate}> {item.meals}</Text>



      </View>
      <View style={styles.dividerRow} />
      <View style={styles.parentOfMarkDone}>
        <BaseButton
          title={ "View Plan"}
          gradientButton={false}
          // backgroundColor={Colors.olive}
          textColor="#fff"
          width={width * 0.43}
          textStyle={styles.addButton}
          textStyleText={styles.addButtonText}
          onPress={() => router.push('/appscreens/TestMealPlan')}
        />
        <BaseButton
          title={ " Start Plan"  }
          gradientButton={false}
          // backgroundColor={Colors.olive}
          textColor="#fff"
          width={width * 0.43}
          textStyle={styles.addButton}
          textStyleText={styles.addButtonText}

        // onPress={handleEditPress}
        />



      </View>

    </View>
  )


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>



      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>





        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Meal Plans</Text>
          <TouchableOpacity onPress={() => router.push('/appscreens/CreateMealPlan')}>
            <Image source={require("@/assets/images/gradientclose.png")} resizeMode="contain" style={{ width: moderateScale(56), height: moderateScale(56), alignSelf: 'flex-end', marginRight: horizontalScale(-11), }} />

          </TouchableOpacity>
        </View>

        {showResumePlan ?
          <>
            <View style={styles.noActivePlan}>

              <Text style={styles.noActiveText}>No Active Plan</Text>


            </View>
            <View style={[styles.dividerRow, { marginVertical: verticalScale(20) }]} />
          </>

          :
          <View style={styles.activeCard}>
            <View style={styles.activeBadge}>
              {/* <Text style={styles.activeBadgeText}>ACTIVE</Text> */}
              <Image source={require("@/assets/images/activeImage.png")} resizeMode="contain" style={{ width: moderateScale(56), height: moderateScale(56), alignSelf: 'flex-end', marginRight: horizontalScale(-11), }} />

            </View>
            <Text style={styles.planTitle}>Test Plan</Text>
            <Text style={styles.planSubTitle}>Day 3 of 7</Text>
            <View style={styles.mealBox}>
              <Text style={styles.mealBoxTitle}>Todaxy's Meal:</Text>
              <View style={styles.mealRow}>



                <View style={{ flex: 1, }}>
                  <Text style={styles.mealLabelTop}>Breakfast</Text>
                  <Text style={styles.mealValue}>Avocado Toast with...</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealLabelTop}>Launch</Text>
                  <Text style={styles.mealLabel}>Not planned</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealLabelTop}>Dinner</Text>
                  <Text style={styles.mealLabel}>Not planned</Text>
                </View>
              </View>
            </View>
            <View style={styles.footer}>


              <BaseButton
                title="Get Shopping List"
                gradientButton={true}
                // backgroundColor={Colors.olive}
                textColor="#fff"
                width={width * 0.53}
                textStyle={styles.createButtonText}
                rightChild={
                  <Image source={require("@/assets/images/createlist.png")} resizeMode="contain" style={{ width: moderateScale(18), height: moderateScale(18), }} />

                }
                onPress={() => router.push('/(tabs)/3_Lists')}
              // onPress={() => {

              //     createNewListRef.current?.expand();
              // }}
              />
              <BaseButton
                title="View Plan"
                gradientButton={false}
                textColor="#fff"
                width={width * 0.3}
                textStyle={styles.confirmButton}
                textStyleText={styles.confirmButtonText}
                onPress={() => router.push('/appscreens/TestMealPlan')}
              />

            </View>
            {/* <Pressable> */}
            <TouchableOpacity style={styles.pauseButton} onPress={() => setPausePlan(true)}>
              <Text style={styles.pauseText}>Pause Plan</Text>
            </TouchableOpacity>
            {/* </Pressable> */}
          </View>
        }
        {/* Other Plans */}
        <Text style={styles.sectionTitle}>Your Other Plans</Text>

        <FlatList
          data={shoppingLists}
          keyExtractor={item => item.id}
          renderItem={renderShoppingList}
          scrollEnabled={false}


        //     ItemSeparatorComponent={() => <View style={styles.separator} />

        // }
        />


        {/* <View style={styles.otherCard}>
          <View style={styles.otherCardRow}>
            <Text style={styles.otherPlanTitle}>Test Plan 1</Text>
            <Text style={styles.otherPlanMeals}>4 meals</Text>
          </View>
          <Text style={styles.otherPlanDate}>Starts:  October 2, 2025</Text>
          <View style={styles.otherBtnRow}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>View Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtnOutline}>
              <Text style={styles.primaryBtnOutlineText}>Start Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.otherCard}>
          <View style={styles.otherCardRow}>
            <Text style={styles.otherPlanTitle}>Test Plan 2</Text>
            <Text style={styles.otherPlanMeals}>24 meals</Text>
          </View>
          <Text style={styles.otherPlanDate}>Starts:  October 2, 2025</Text>
          <View style={styles.otherBtnRow}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>View Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtnOutline}>
              <Text style={styles.primaryBtnOutlineText}>Start Plan</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </ScrollView>

      <ConfirmationModal
        visible={pausePlan}
        title="Pause Meal Plan?"
        description="You can always resume the meal plan whenever you like to."
        cancelText="Cancel"
        confirmText="Pause"
        onCancel={() => setPausePlan(false)}
        onConfirm={() => {
          setShowResumePlan(true);
          setPausePlan(false)

        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // container: {

  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: Colors.background,
  // },
  text: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    // paddingTop: 32,
    paddingHorizontal: horizontalScale(20),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    // backgroundColor:'red'
  },
  headerTitle: {
    fontSize: moderateScale(21),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD

  },
  addBtn: {
    backgroundColor: '#E6EEDB',
    borderRadius: 50,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  activeCard: {
    borderRadius: moderateScale(16),
    borderWidth: moderateScale(1),
    borderColor: '#667D4C',
    padding: horizontalScale(18),
    marginBottom: verticalScale(20),
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 4 },
    // position: 'relative',
  },
  activeBadge: {
    position: 'absolute',
    top: moderateScale(-20),
    right: moderateScale(-6),
    // backgroundColor:,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    zIndex: 2,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 14,
    // fontFamily: ,
    letterSpacing: 1,
  },
  planTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    marginBottom: 2,
  },
  planSubTitle: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    marginTop: verticalScale(8),


    marginBottom: verticalScale(12),
  },
  mealBox: {
    backgroundColor: Colors.boxbackground,
    borderRadius: moderateScale(8),
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(18),
    // marginBottom: 16,
  },
  mealBoxTitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    // fontFamily: FONT_FAMILY,
    // color: TITLE_COLOR,
    marginBottom: 6,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width * 0.9
    // backgroundColor: 'red'
  },
  mealLabelTop: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    marginVertical: verticalScale(8)
    // color: SUBTITLE_COLOR,
    // fontFamily: FONT_FAMILY_REGULAR,
  },
  mealLabel: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
    // marginVertical:verticalScale(8)
    // color: SUBTITLE_COLOR,
    // fontFamily: FONT_FAMILY_REGULAR,
  },
  mealValue: {
    fontSize: moderateScale(12),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    // color: TITLE_COLOR,
    // fontFamily: FONT_FAMILY_REGULAR,
    // marginBottom: 2,
  },
  cardBtnRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  primaryBtn: {
    flex: 1,
    // backgroundColor: BTN_COLOR,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
  },
  primaryBtnText: {
    // color: BTN_TEXT_COLOR,
    fontSize: 16,
    // fontFamily: FONT_FAMILY,
  },
  secondaryBtn: {
    flex: 1,
    // backgroundColor: BTN_SECONDARY_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    // color: BTN_SECONDARY_TEXT,
    fontSize: 16,
    // fontFamily: FONT_FAMILY,
  },
  pauseText: {
    // color: PAUSE_COLOR,
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: moderateScale(21),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: moderateScale(10),
  },
  otherCard: {
    // backgroundColor: BG_COLOR,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    // shadowColor: CARD_SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#F2F3F4',
  },
  otherCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  otherPlanTitle: {
    fontSize: 16,
    // fontFamily: FONT_FAMILY,
    // color: TITLE_COLOR,
  },
  otherPlanMeals: {
    fontSize: 13,
    // color: SUBTITLE_COLOR,
    // fontFamily: FONT_FAMILY_REGULAR,
  },
  otherPlanDate: {
    fontSize: 13,
    // color: SUBTITLE_COLOR,
    // fontFamily: FONT_FAMILY_REGULAR,
    marginBottom: 10,
  },
  otherBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  primaryBtnOutline: {
    flex: 1,
    backgroundColor: '#E6EEDB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
  },
  primaryBtnOutlineText: {
    // color: BTN_COLOR,
    fontSize: 16,
    // fontFamily: FONT_FAMILY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    marginRight: horizontalScale(8),
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  confirmButton: {
    //  flex: 1,
    // backgroundColor: '#9DAF89',
    borderRadius: moderateScale(8),
    // paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor

    // marginLeft: horizontalScale(8),
  },
  confirmButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  createButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.white,
    fontSize: moderateScale(16),
  },
  pauseButton: {
    marginTop: verticalScale(10)
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(3)

  },
  listTitle: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(14),
    color: Colors.primary,
  },
  listDate: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.tertiary,
    marginTop: verticalScale(4),
  },
  addButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(3),
    paddingHorizontal: horizontalScale(4),

  },
  addButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),

  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,
    // width:width*0.9,
    // marginHorizontal: horizontalScale(12),
    marginVertical: verticalScale(10),
    marginTop: verticalScale(15)
    // marginHorizontal: 8 

    // marginBottom: moderateScale(8),
  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(6), // top + bottom spacing
    paddingHorizontal: moderateScale(9),
    marginHorizontal: horizontalScale(2),
    paddingVertical: verticalScale(11),

    // Android
    elevation: 4,

    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  parentOfMarkDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  noActivePlan: {
    // width: width * 0.25,
    // height: moderateScale(40),
    borderRadius: moderateScale(4),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: verticalScale(35)
  },
  noActiveText: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.tertiary

  }
});

export default PlansScreen;
