import { IconMeal, IconPlus } from '@/assets/svg';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Strings } from '@/constants/Strings';
import { Colors, FontFamilies } from '@/constants/Theme';
import { useLoader } from '@/context/LoaderContext';
import { useAppSelector } from '@/reduxStore/hooks';
import { useCreateMealViewModel } from '@/viewmodels/CreateMealViewModel';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { serverTimestamp } from "firebase/firestore";
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BaseButton from './BaseButton';
import CustomDropdown from './CustomDropdown';
import CustomStepper from './CustomStepper';
import CustomTextInput from './CustomTextInput';
import ImagePickerModal from './ImagePickerModal';


export interface CreateMealBottomSheetRef {
  expand: () => void;
  close: () => void;
}
interface CreateMealBottomSheetProps {
  isEdit?: boolean;
  mealData?: {

  };
}
const CreateMealBottomSheet = forwardRef<BottomSheet, CreateMealBottomSheetProps>(
  ({ isEdit = false, mealData }, ref) => {

    const user = useAppSelector(state => state.auth.user);

    const { ingredientCategories, loading, error, addMealData } = useCreateMealViewModel();

    const snapPoints = useMemo(() => ['100%'], []);
    const [mealName, setMealName] = useState('');
    const [mealDescription, setMealDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [prepTime, setPrepTime] = useState('5 Mins');
    const [servings, setServings] = useState('1');
    const [difficulty, setDifficulty] = useState('Easy');
    const [category, setCategory] = useState('Dinner');
    const [ingredientCount, setIngredientCount] = useState('1');
    const [ingredientCategory, setIngredientCategory] = useState('Fruit');
    const { height } = Dimensions.get('window');
    const { width } = Dimensions.get('window')

    const prepTimeOptions = ['5 Mins', '10 Mins', '15 Mins'];
    const prepTimeIndex = prepTimeOptions.indexOf(prepTime);
    const unitWeightOptions = ['100grm', '200grm', '1kg'];

    const [ingredients, setIngredients] = useState([
    ]);

     const { showLoader, hideLoader } = useLoader();


    const [steps, setSteps] = useState(
      isEdit
        ? Array(6).fill({ text: '' }) // when editing → 6 blank instructions
        : [{ text: '' }]              // when creating → 1 blank instruction
    );

    // Modal for image picker
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);


    useEffect(() => { 
      if(loading)
        showLoader();
      else
        hideLoader();
    }, [loading]);


    const updateIngredientsCategprory = (category : any, index : number) => {

      const updated = ingredients.map((ing, i) => {
        if (i === index) {
          return { ...ing, unit : category?.unit?.[0] ?? '', category };
        }
        return ing;
      });
      setIngredients(updated);

    }

    const updateUnit = (unit: any, index: number) => {
      const updated = ingredients.map((ing, i) => {
        if (i === index) {
          return { ...ing, unit };
        }
        return ing;
      });
      setIngredients(updated);

    }

    const updateCount = (count: any, index: number) => {
      const updated = ingredients.map((ing, i) => {
        if (i === index) {
          return { ...ing, count };
        }
        return ing;
      });
      setIngredients(updated);

    }

    const updateName = (name: any, index: number) => {
      const updated = ingredients.map((ing, i) => {
        if (i === index) {
          return { ...ing, name };
        }
        return ing;
      });
      setIngredients(updated);

    }

    const handleAddIngredient = () => {

      setIngredients((prev) => [
        ...prev,
        { name: '', count: '1', unit: ingredientCategories.length > 0 ? ingredientCategories[0]?.unit?.[0] ?? '' : '', category: ingredientCategories.length > 0 ? ingredientCategories[0] : '' },
      ]);
    };



    // Ingredient item renderer
    const renderIngredientItem = ({ item, index }) => (
      // <View style={styles.ingredientItem}>
      <View >

        <Text style={styles.label}>Ingredient Name</Text>
        <CustomTextInput
          placeholder="e.g. Tomato"
          value={item.name}
          onChangeText={(text) =>
            updateName(text, index)}
        />

        {isEdit ? <View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Count</Text>
              <CustomStepper value={ingredientCount} onIncrement={() => setIngredientCount(c => String(Number(c) + 1))} onDecrement={() => setIngredientCount(c => String(Math.max(1, Number(c) - 1)))} />


            </View>

            {/* <View style={styles.rowItem}>
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


            </View> */}

            <View style={styles.rowItem}>
              <Text style={styles.label}>Category</Text>

              <CustomDropdown value={ingredientCategory} options={['Fruit', 'Vegetable',]} onSelect={setIngredientCategory} icon={require("@/assets/images/icondown.png")} />






            </View>

            <TouchableOpacity
              style={styles.deleteButton}
            // onPress={() => handleDeleteIngredient(index)}
            >
              <Image
                source={require("@/assets/images/delete.png")}
                style={{ width: verticalScale(24), height: verticalScale(24) }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

        </View> :
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Count</Text>
              <CustomStepper value={item?.count} onIncrement={() => {
                // setIngredientCount(c => String(Number(c) + 1))
                updateCount(String(Number(item?.count) + 1), index);
              }
              } onDecrement={() => {
                //  setIngredientCount(c => String(Math.max(1, Number(c) - 1)))
                updateCount(String(Math.max(1, Number(item?.count) - 1)), index);
              }
              } />


            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Unit (weight)</Text>

              <CustomStepper
                value={item?.unit}
                onIncrement={() => {
                  const unitWeightOptions = item?.category?.unit;
                  const unitWeightIndex = unitWeightOptions.indexOf(item?.unit);
                  if (unitWeightIndex < unitWeightOptions.length - 1) {
                    //setUnitweight(unitWeightOptions[unitWeightIndex + 1]);
                    updateUnit(unitWeightOptions[unitWeightIndex + 1], index);
                  }
                }}
                onDecrement={() => {
                 const unitWeightOptions = item?.category?.unit;
                  const unitWeightIndex = unitWeightOptions.indexOf(item?.unit);

                  if (unitWeightIndex > 0) {
                    //setUnitweight(unitWeightOptions[unitWeightIndex - 1]);
                    updateUnit(unitWeightOptions[unitWeightIndex - 1], index);

                  }
                }}
              />


            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>Category</Text>

              <CustomDropdown value={item?.category} options={ingredientCategories} onSelect={(category) => updateIngredientsCategprory(category, index)} icon={require("@/assets/images/icondown.png")} />

            </View>

            <TouchableOpacity
              style={styles.deleteButton}
           onPress={() => handleDeleteIngredient(index)}
            >
              <Image
                source={require("@/assets/images/delete.png")}
                style={{ width: verticalScale(24), height: verticalScale(24) }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        }
      </View>
    );


    const handleUpload = () => {
      setShowImagePickerModal(true);
    };
    const handleDeleteIngredient = (index) => {
      const updated = ingredients.filter((_, i) => i !== index);
      setIngredients(updated);
    };

    // const renderInstructionItem = ({ item, index }) => (

    //   <View style={styles.row}>
    //     <Text style={styles.sectionTitle}>1.</Text>

    //     <CustomTextInput
    //       style={{ height: verticalScale(60), borderRadius: moderateScale(4), backgroundColor: Colors.greysoft, paddingHorizontal: horizontalScale(10), marginTop: moderateScale(-5), width: width * 0.8, }}

    //       placeholder="A short summary of the meal..."
    //       multiline
    //       value={mealDescription}
    //       onChangeText={setMealDescription}
    //     />

    //   </View>
    // )

    const renderInstructionItem = ({ item, index }) => (
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{index + 1}.</Text>

        <CustomTextInput
          style={{
            height: verticalScale(60),
            borderRadius: moderateScale(4),
            backgroundColor: Colors.greysoft,
            paddingHorizontal: horizontalScale(10),
            paddingTop: moderateScale(15),
            marginTop: moderateScale(-5),
            width: isEdit ? width * 0.7 : width * 0.8,
            marginBottom: verticalScale(15)
          }}
          placeholder={
            isEdit
              ? "Heat olive oil in large pan. saute diced onion and garlic"
              : 'A short summary of the meal...'
          }
          multiline
          // value={item.text}
          // onChangeText={(text) => handleUpdateStep(index, text)}
          value={item?.text}
          onChangeText={(text)=>
          {
            const updated = steps.map((step, i) => {
              if (i === index) {
                return { ...step, text };
              }
              return step;
            });
            setSteps(updated);
          }
          }
        />

        {isEdit ? <TouchableOpacity onPress={() => ref && typeof ref !== 'function' && ref.current?.close()}>
          <Image
            source={require("@/assets/images/close-icon.png")}
            style={{ width: verticalScale(22), height: verticalScale(22) }}
            resizeMode="contain"
          />
        </TouchableOpacity> : <></>}
      </View>
    );

    const handleCreateMeal = async () => {
      try {
        // Map ingredients to only include category id
        const mappedIngredients = ingredients.map(ing => ({
          ...ing,
          category: typeof ing.category === 'object' && ing.category.id ? ing.category.id : ing.category
        }));
        // Map steps to string array
        const mappedSteps = steps.map(step => step.text);
        const mealData = {
          name: mealName,
          description: mealDescription,
          imageUrl,
          prepTime,
          servings,
          difficulty,
          category,
          ingredients: mappedIngredients,
          steps: mappedSteps,
          createdAt: serverTimestamp(),
          uid: user?.id
        };
        addMealData(
          mealData,
          () => {
            alert(Strings.mealAdded);
            if (ref && typeof ref !== 'function' && ref.current?.close) {
              ref.current.close();
            }
          },
          (error) => {
            alert(Strings.error_creating_meal + error);
          }
        );
      } catch (error) {
        alert(Strings.error_creating_meal + error);
      }
    };

    return (
      <>

      {/* Image Picker Modal (Reusable) */}
      <ImagePickerModal
        visible={showImagePickerModal}
        onClose={() => setShowImagePickerModal(false)}
        onImagePicked={setImageUrl}
      />

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
          <Text style={styles.header}>{isEdit ? "Edit Meal" : "Create Meal"}</Text>
          <TouchableOpacity onPress={() => ref && typeof ref !== 'function' && ref.current?.close()}  >
            <Image
              source={require("@/assets/images/close-icon.png")}
              style={{ width: verticalScale(24), height: verticalScale(24) }}
              resizeMode="contain"
            />
          </TouchableOpacity>


        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: moderateScale(20), paddingBottom: verticalScale(30) }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.label}>Meal Name</Text>
            <CustomTextInput placeholder="e.g. Classic Spaghetti" value={mealName} onChangeText={setMealName} />

            <Text style={styles.label}>Meal Description</Text>
            <CustomTextInput
              style={{ height: verticalScale(80), borderRadius: moderateScale(4), backgroundColor: Colors.greysoft, paddingHorizontal: horizontalScale(10) }}
              placeholder={isEdit ? "A rich and meaty sauce served over a bed of perfectly cooked spaghetti. A timeless family favorite that everyone will love." : "A short summary of the meal..."}
              multiline={true}
              value={mealDescription}
              numberOfLines={4}
              onChangeText={setMealDescription}
            />

            <Text style={styles.label}>Image URL</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CustomTextInput style={{ flex: 1 }} placeholder={isEdit ? "https://myfood.com/image/Classic Spaghetti Bolognese" : "https://..."} value={imageUrl} onChangeText={setImageUrl} />
              <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                <Text style={styles.uploadButtonText}>{isEdit ? "Remove" : "Upload"}</Text>
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
            {/* <Text style={styles.label}>Ingredient Name</Text>
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


          </View> */}
            <FlatList
              data={ingredients}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              renderItem={renderIngredientItem}
            />

            <TouchableOpacity style={styles.addIngredient} onPress={handleAddIngredient}>
              <IconPlus width={verticalScale(21)} height={verticalScale(21)} color="black" />
              <Text style={styles.plusicon}>+</Text>
              <Text style={styles.addIngredientText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Instruction</Text>
            {/* <View style={styles.row}>
            <Text style={styles.sectionTitle}>1.</Text>

            <CustomTextInput
              style={{ height: verticalScale(60), borderRadius: moderateScale(4), backgroundColor: Colors.greysoft, paddingHorizontal: horizontalScale(10), marginTop: moderateScale(-5), width: width * 0.8 }}

              placeholder="A short summary of the meal..."
              multiline
              value={mealDescription}
              onChangeText={setMealDescription}
            />

          </View> */}


            <FlatList
              data={steps}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              renderItem={renderInstructionItem}
            />

            <TouchableOpacity
              style={styles.addIngredient}
              onPress={() => setSteps(prev => [...prev, { text: '' }])}
            >
              <Text style={styles.plusicon}>+</Text>
              <Text style={styles.addIngredientText}>Add Step</Text>
            </TouchableOpacity>

          </View>
          <View style={styles.parentOfConfirmButton}>
            <BaseButton
              title={isEdit ? "Discard" : "Cancel"}
              gradientButton={false}
              backgroundColor={Colors.white}
              width={isEdit ? width * 0.28 : width * 0.41}

              textStyle={[styles.cancelButton, { color: isEdit ? Colors.error : Colors.primary }]}
              textColor={isEdit ? Colors.error : Colors.primary}

            // onPress={handleCancel}
            />
            <BaseButton
              title={isEdit ? "Update Meal" : "Confirm"}
              gradientButton={true}
              width={isEdit ? width * 0.65 : width * 0.41}
              gradientStartColor="#667D4C"
              gradientEndColor="#9DAF89"
              gradientStart={{ x: 0, y: 0 }}
              gradientEnd={{ x: 1, y: 0 }}
              textColor={Colors.white}
              rightChild={isEdit ? <IconMeal width={verticalScale(21)} height={verticalScale(21)} /> : null}
              textStyle={[styles.confirmButton,]}
              onPress={handleCreateMeal}
            />

          </View>
          <View style={styles.emptybottom}></View>
        </BottomSheetScrollView>

      </BottomSheet>
      </>
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
    // color: Colors.primary,

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
  emptybottom: {
    height: verticalScale(140)
  },

});
