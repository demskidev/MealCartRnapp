import { gradientclose } from '@/assets/images';
import BaseButton from '@/components/BaseButton';
import CreateNewListBottomSheet, { CreateNewListBottomSheetRef } from '@/components/CreateNewListBottomSheet';
import { APP_ROUTES } from '@/constants/AppRoutes';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const shoppingLists = [
  { id: '1', name: 'Test Plan', created: 'October 2, 2025', meals: '8 meals' },
  { id: '2', name: 'Test Plan 2', created: 'October 1, 2025', meals: '24 meals' },
];
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window')

const ListsScreen: React.FC = () => {
  const router = useRouter();


  const createNewListRef = useRef<CreateNewListBottomSheetRef>(null);


  const renderShoppingList = ({ item }) => (
    <View style={styles.listCard}>
      <Text style={styles.listTitle}>{item.name}</Text>

      <View style={styles.listItem}>
        <View>
          <Text style={styles.listDate}>{Strings.lists_created} {item.created}</Text>

        </View>

        <Text style={styles.listDate}> {item.meals}</Text>



      </View>
      <View style={styles.dividerRow} />
      <View style={styles.parentOfMarkDone}>
        <BaseButton
          title={Strings.lists_markDone}
          gradientButton={false}
          textColor={Colors.background}
          width={width * 0.43}
          textStyle={styles.addButton}
          textStyleText={styles.addButtonText}

        />
        <BaseButton
          title={Strings.lists_viewList}
          gradientButton={false}
          textColor="#fff"
          width={width * 0.43}
          textStyle={styles.addButton}
          textStyleText={styles.addButtonText}
          onPress={() => router.push(APP_ROUTES.TestPlanShopping)}

        />



      </View>

    </View>
  )



  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.parentMymeal}>
        <Text style={styles.title}>{Strings.lists_shoppingLists}</Text>
        <TouchableOpacity style={styles.addNewListButton} onPress={() => createNewListRef.current?.expand()}  >
          <Image source={gradientclose} resizeMode="contain" style={styles.gradientCloseImage} />

        </TouchableOpacity>

      </View>

      <FlatList
        data={shoppingLists}
        keyExtractor={item => item.id}
        renderItem={renderShoppingList}



      />
      <CreateNewListBottomSheet ref={createNewListRef} />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20)
  },
  text: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  parentMymeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20)
  },
  title: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(21),
    color: Colors.primary,
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
    marginVertical: verticalScale(18)

  },
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    marginVertical: verticalScale(6),
    paddingHorizontal: moderateScale(9),
    marginHorizontal: horizontalScale(2),
    paddingVertical: verticalScale(11),

    elevation: 4,

    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  parentOfMarkDone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  addNewListButton: {
    marginLeft: horizontalScale(6),
  },
  gradientCloseImage: {
    width: moderateScale(56),
    height: moderateScale(56),
    alignSelf: 'flex-end',
    marginRight: horizontalScale(-17),
  },
});

export default ListsScreen;
