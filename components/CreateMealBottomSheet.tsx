import { IconPlus } from '@/assets/svg';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BaseButton from './BaseButton';
import CustomDropdown from './CustomDropdown';
import CustomStepper from './CustomStepper';
import CustomTextInput from './CustomTextInput';
const CreateMealBottomSheet = forwardRef<BottomSheet>((_, ref) => {
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

  const handleUpload = () => {
    // Implement upload logic here
    alert('Upload clicked!');
  };
  const handleDeleteIngredient = () => {
    setIngredientName('');
    setIngredientCount('1');
    setIngredientUnit('100grm');
    setIngredientCategory('Fruit');
  };

  return (
    <BottomSheet
      ref={ref}
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
        <Text style={styles.header}>Create Meal</Text>
        <TouchableOpacity onPress={() => ref && typeof ref !== 'function' && ref.current?.close()}>
          <Image
            source={require("@/assets/images/close-icon.png")}
            style={{ width: verticalScale(44), height: verticalScale(44) }}
            resizeMode="contain"
          />
        </TouchableOpacity>


      </View>

      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: moderateScale(20) }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.label}>Meal Name</Text>
          <CustomTextInput placeholder="e.g. Classic Spaghetti" value={mealName} onChangeText={setMealName} />

          <Text style={styles.label}>Meal Description</Text>
          <CustomTextInput
            style={{ height: verticalScale(60), borderRadius: moderateScale(4), backgroundColor: Colors.greysoft, paddingHorizontal: horizontalScale(10) }}
            placeholder="A short summary of the meal..."
            multiline
            value={mealDescription}
            onChangeText={setMealDescription}
          />

          <Text style={styles.label}>Image URL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomTextInput style={{ flex: 1 }} placeholder="https://..." value={imageUrl} onChangeText={setImageUrl} />
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Prep Time (min)</Text>

              <CustomStepper
                value={prepTime}
                onIncrement={() => {
                  if (prepTimeIndex < prepTimeOptions.length - 1) {
                    setPrepTime(prepTimeOptions[prepTimeIndex + 1]);
                  }
                }}
                onDecrement={() => {
                  if (prepTimeIndex > 0) {
                    setPrepTime(prepTimeOptions[prepTimeIndex - 1]);
                  }
                }}
                showUp={true}
                showDown={true}
              />

            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Servings</Text>
              <CustomStepper value={servings} onIncrement={() => setServings(s => String(Number(s) + 1))} onDecrement={() => setServings(s => String(Math.max(1, Number(s) - 1)))} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Difficulty</Text>
              <CustomDropdown value={difficulty} options={['Easy', 'Medium', 'Hard']} onSelect={setDifficulty} icon={require("@/assets/images/icondown.png")} />

            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Category</Text>
              <CustomDropdown value={category} options={['Dinner', 'Lunch', 'Breakfast']} onSelect={setCategory} icon={require("@/assets/images/icondown.png")} />

            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.label}>Ingredient Name</Text>
          <CustomTextInput placeholder="e.g. Tomato" value={ingredientName} onChangeText={setIngredientName} />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Count</Text>
              <CustomStepper value={ingredientCount} onIncrement={() => setIngredientCount(c => String(Number(c) + 1))} onDecrement={() => setIngredientCount(c => String(Math.max(1, Number(c) - 1)))} />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Unit (weight)</Text>

              <CustomStepper
                value={unitWeight}
                onIncrement={() => {
                  if (unitWeightIndex < unitWeightOptions.length - 1) {
                    setUnitweight(unitWeightOptions[unitWeightIndex + 1]);
                  }
                }}
                onDecrement={() => {
                  if (unitWeightIndex > 0) {
                    setUnitweight(unitWeightOptions[unitWeightIndex - 1]);
                  }
                }}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Category</Text>
              <CustomDropdown value={ingredientCategory} options={['Fruit', 'Vegetable',]} onSelect={setIngredientCategory} icon={require("@/assets/images/icondown.png")} />

            </View >

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteIngredient}>

              <Image
                source={require("@/assets/images/delete.png")}
                style={{ width: verticalScale(24), height: verticalScale(24) }}
                resizeMode="contain"

              />
            </TouchableOpacity>


          </View>
          <View style={styles.addIngredient}>
            {/* <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: verticalScale(20), height: verticalScale(20), marginRight: 8 }}
              resizeMode="contain"
            /> */}
            <IconPlus width={verticalScale(21)} height={verticalScale(21)} color="black" />
            <Text style={styles.plusicon}>+</Text>

            <Text style={styles.addIngredientText}>Add Ingredient</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instruction</Text>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>1.</Text>

            <CustomTextInput
              style={{ height: verticalScale(60), borderRadius: moderateScale(4), backgroundColor: Colors.greysoft, paddingHorizontal: horizontalScale(10), marginTop: moderateScale(-5), width: width * 0.8 }}

              placeholder="A short summary of the meal..."
              multiline
              value={mealDescription}
              onChangeText={setMealDescription}
            />

          </View>
          <View style={styles.addIngredient}>
            <Text style={styles.plusicon}>+</Text>

            <Text style={styles.addIngredientText}>Add Step</Text>

          </View>

        </View>
        <View style={styles.parentOfConfirmButton}>
          <BaseButton
            title="Cancel"
            gradientButton={false}
            backgroundColor={Colors.white}
            width={width * 0.41}

            textStyle={[styles.cancelButton]}


          // onPress={handleCancel}
          />
          <BaseButton
            title={'Confirm'}
            gradientButton={true}
            width={width * 0.41}
            gradientStartColor="#667D4C"
            gradientEndColor="#9DAF89"
            gradientStart={{ x: 0, y: 0 }}
            gradientEnd={{ x: 1, y: 0 }}
            textColor={Colors.white}
            // rightChild={<IconPlus width={verticalScale(21)} height={verticalScale(21)} />}
            textStyle={[styles.confirmButton,]}
          // onPress={goNext}
          // showPressedShadow={true}
          />

        </View>
      </BottomSheetScrollView>

    </BottomSheet>
  );
});

export default CreateMealBottomSheet;

const styles = StyleSheet.create({
  header: { fontSize: moderateScale(21), color: Colors.primary, fontFamily: FontFamilies.ROBOTO_SEMI_BOLD },
  card: {
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
    fontSize: moderateScale(12)
  },
  cancelButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,

    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  parentOfConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: verticalScale(15)
  },
  plusicon: {
    color: Colors.primary,
    fontSize: moderateScale(22),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginRight: moderateScale(8)

  },
  rowItemDelete: {

  }
});
