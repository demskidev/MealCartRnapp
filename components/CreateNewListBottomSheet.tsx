import { IconCartWhite } from '@/assets/svg';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddItemToList from './AddItemToList';
import BaseButton from './BaseButton';
import CustomTextInput from './CustomTextInput';


export interface CreateNewListBottomSheetRef {
  expand: () => void;
  close: () => void;
}
interface CreateNewListBottomSheetProps {
}
// const CreateNewListBottomSheet = forwardRef<BottomSheet, CreateNewListBottomSheetProps>(
//   ({ isEdit = false, mealData }, ref) => {
const CreateNewListBottomSheet = forwardRef<
  CreateNewListBottomSheetRef,
  {}
>(
  (props: {}, ref: React.Ref<CreateNewListBottomSheetRef>) => {
    const snapPoints = useMemo(() => ['100%'], []);
    const [mealName, setMealName] = useState('');
    const [mealDescription, setMealDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [prepTime, setPrepTime] = useState('5 Mins');
    const [servings, setServings] = useState('1');
    const [difficulty, setDifficulty] = useState('Easy');
    const [category, setCategory] = useState('Dinner');
    const [ingredientName, setIngredientName] = useState('');
    const [ingredientCount, setIngredientCount] = useState('1');
    const [ingredientUnit, setIngredientUnit] = useState('100grm');
    const [ingredientCategory, setIngredientCategory] = useState('Fruit');
    const { height } = Dimensions.get('window');
    const { width } = Dimensions.get('window')
    const prepTimeOptions = ['5 Mins', '10 Mins', '15 Mins'];
    const prepTimeIndex = prepTimeOptions.indexOf(prepTime);
    const [unitWeight, setUnitweight] = useState('100 grms');
    const unitWeightOptions = ['100grm', '200grm', '1kg'];
    const unitWeightIndex = unitWeightOptions.indexOf(unitWeight);
    const [ingredients, setIngredients] = useState([
      { name: '', count: '1', unit: '100grm', category: 'Fruit' }
    ]);
    const [isAddItemVisible, setIsAddItemVisible] = useState(false);

    // Imperative handle for parent ref
    const bottomSheetRef = useRef<BottomSheet>(null);
    useImperativeHandle(ref, () => ({
      expand: () => {
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const data = [
      { id: '1', category: 'Category', name: 'Spaghetti', amount: '400 grams' },
      { id: '2', category: 'Category', name: 'Ground Beef', amount: '500 grams' },
      { id: '3', category: 'Category', name: 'Ground Beef', amount: '500 grams' },
    ];

    const renderIngredientItem = ({ item }: { item: { id: string; category: string; name: string; amount: string } }) => (
      <View>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.dividerRow} />
        <View style={styles.cardCategory}>
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          </View>
        </View>
      </View>
    );

    return (

      
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          topInset={0}
          handleComponent={() => null}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
            />
          )}
        // containerStyle={{ flex: 1 }}
        >

          <View style={styles.emptyView}></View>
          <View style={styles.parentCreateMealText}>
            <Text style={styles.header}>Create New List</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <Image
                source={require("@/assets/images/close-icon.png")}
                style={{ width: verticalScale(25), height: verticalScale(25) }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: moderateScale(20) }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>List Details</Text>
              <Text style={styles.label}>List Name</Text>
              <CustomTextInput placeholder="Classic Spaghetti" value={mealName} onChangeText={setMealName} />

              <Text style={styles.label}>Shopping Day</Text>
              <CustomTextInput placeholder="date" value={mealName} onChangeText={setMealName} />

            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Items</Text>
              <View style={styles.dividerRow} />

              <Text style={styles.label}>imported from [Meal Name]</Text>
              <BaseButton
                title="Add extra items"
                gradientButton={false}
                backgroundColor={Colors.white}
                textStyle={[styles.addExtraButton]}
                textStyleText={styles.addExtra}
                onPress={() => setIsAddItemVisible(true)}
              />

              <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={renderIngredientItem}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.parentOfConfirmButton}>
              <BaseButton
                title="Discard"
                gradientButton={false}
                backgroundColor={Colors.white}
                width={width * 0.28}
                textStyle={[styles.cancelButton, { color: Colors.error }]}
                textColor={Colors.error}
                textStyleText={styles.discardText}
              />
              <BaseButton
                title="Save Shopping List"
                gradientButton={true}
                width={width * 0.65}
                gradientStartColor="#667D4C"
                gradientEndColor="#9DAF89"
                gradientStart={{ x: 0, y: 0 }}
                gradientEnd={{ x: 1, y: 0 }}
                textColor={Colors.white}
                rightChild={<IconCartWhite width={verticalScale(21)} height={verticalScale(21)} />}
                textStyle={[styles.confirmButton,]}
                textStyleText={styles.saveShopping}
              />
            </View>
          </BottomSheetScrollView>
           <AddItemToList
          visible={isAddItemVisible}
          onClose={() => setIsAddItemVisible(false)}
        />
        </BottomSheet>

       
     
    );


  });

export default CreateNewListBottomSheet;

const styles = StyleSheet.create({
  header: { fontSize: moderateScale(21), color: Colors.primary, fontFamily: FontFamilies.ROBOTO_SEMI_BOLD },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginBottom: verticalScale(10),
    elevation: 2,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

  },
  sectionTitle: { fontSize: moderateScale(12), fontFamily: FontFamilies.ROBOTO_SEMI_BOLD, color: Colors.primary, marginBottom: verticalScale(10) },
  label: { fontSize: moderateScale(12), marginTop: moderateScale(8), marginBottom: moderateScale(4), fontFamily: FontFamilies.ROBOTO_REGULAR, color: Colors.primary },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  uploadButton: {
    marginLeft: 8,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  uploadButtonText: { fontFamily: FontFamilies.ROBOTO_MEDIUM, color: Colors.primary, fontSize: moderateScale(14) },
  row: { flexDirection: 'row', justifyContent: 'flex-start', gap: 8, },
  rowItem: { flex: 1, minWidth: 80, },
  deleteButton: {

    alignSelf: 'flex-end',
    marginBottom: verticalScale(18)
  },
  parentCreateMealText: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: verticalScale(20), marginHorizontal: moderateScale(20)
  },
  emptyView: {
    height: verticalScale(35)
  },
  placeholderText: {
    color: Colors.tertiary,
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR
  },
  addIngredientText: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    fontSize: moderateScale(14)

  },
  addIngredient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(10),
  },
  confirmButton: {
    color: Colors.white,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(13)
  },
  cancelButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    // color: Colors.primary,

    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  parentOfConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: verticalScale(15),
    marginHorizontal: moderateScale(-5)
  },
  plusicon: {
    color: Colors.primary,
    fontSize: moderateScale(22),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginRight: moderateScale(8)

  },
  addExtra: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary
  },
  addExtraButton: {
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginHorizontal: moderateScale(-7),
    marginVertical: verticalScale(3)
  },
  dividerRow: {
    height: moderateScale(1),
    backgroundColor: Colors.divider,
    flex: 1,

    marginBottom: verticalScale(10)

  },

  category: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: '#222',
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 4,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardCategory: {








    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginBottom: verticalScale(10),
    elevation: 2,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginHorizontal: moderateScale(3)
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
  }

});
