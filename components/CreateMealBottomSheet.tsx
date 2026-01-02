import { closeIcon, deleteicon } from '@/assets/images';
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

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
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

    const [ingredients, setIngredients] = useState([
    ]);

    const { showLoader, hideLoader } = useLoader();


    const [steps, setSteps] = useState(
      isEdit
        ? Array(6).fill({ text: '' })
        : [{ text: '' }]
    );


    const [showImagePickerModal, setShowImagePickerModal] = useState(false);


    useEffect(() => {
      if (loading)
        showLoader();
      else
        hideLoader();
    }, [loading]);


    const updateIngredientsCategprory = (category: any, index: number) => {

      const updated = ingredients.map((ing, i) => {
        if (i === index) {
          return { ...ing, unit: category?.unit?.[0] ?? '', category };
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



    const renderIngredientItem = ({ item, index }) => (
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



            <View style={styles.rowItem}>
              <Text style={styles.label}>Category</Text>

              <CustomDropdown value={ingredientCategory} options={['Fruit', 'Vegetable',]} onSelect={setIngredientCategory} icon={require("@/assets/images/icondown.png")} />






            </View>

            <TouchableOpacity
              style={styles.deleteButton}
            >
              <Image
                source={deleteicon}
                style={styles.deleteIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

        </View> :
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Count</Text>
              <CustomStepper value={item?.count} onIncrement={() => {
                updateCount(String(Number(item?.count) + 1), index);
              }
              } onDecrement={() => {
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
                    updateUnit(unitWeightOptions[unitWeightIndex + 1], index);
                  }
                }}
                onDecrement={() => {
                  const unitWeightOptions = item?.category?.unit;
                  const unitWeightIndex = unitWeightOptions.indexOf(item?.unit);

                  if (unitWeightIndex > 0) {
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
                source={deleteicon}
                style={styles.deleteIconImage}
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



    const renderInstructionItem = ({ item, index }) => (
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{index + 1}.</Text>

        <CustomTextInput
          style={isEdit ? styles.instructionInputEdit : styles.instructionInput}
          placeholder={
            isEdit
              ? "Heat olive oil in large pan. saute diced onion and garlic"
              : 'A short summary of the meal...'
          }
          multiline

          value={item?.text}
          onChangeText={(text) => {
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
            source={closeIcon}
            style={styles.closeIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity> : <></>}
      </View>
    );

    const handleCreateMeal = async () => {
      try {
        const mappedIngredients = ingredients.map(ing => ({
          ...ing,
          category: typeof ing.category === 'object' && ing.category.id ? ing.category.id : ing.category
        }));
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
        >

          <View style={styles.emptyView}></View>
          <View style={styles.parentCreateMealText}>
            <Text style={styles.header}>{isEdit ? Strings.createMeal_editMeal : Strings.createMeal_createMeal}</Text>
            <TouchableOpacity onPress={() => ref && typeof ref !== 'function' && ref.current?.close()}  >
              <Image
                source={closeIcon}
                style={styles.closeIconImageLarge}
                resizeMode="contain"
              />
            </TouchableOpacity>


          </View>

          <BottomSheetScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{Strings.createMeal_basicInfo}</Text>
              <Text style={styles.label}>{Strings.createMeal_mealName}</Text>
              <CustomTextInput placeholder={Strings.createMeal_mealName_placeholder} value={mealName} onChangeText={setMealName} />

              <Text style={styles.label}>{Strings.createMeal_mealDescription}</Text>
              <CustomTextInput
                style={styles.descriptionInput}
                placeholder={isEdit ? Strings.createMeal_mealDescription_edit_placeholder : Strings.createMeal_mealDescription_placeholder}
                multiline={true}
                value={mealDescription}
                numberOfLines={4}
                onChangeText={setMealDescription}
              />

              <Text style={styles.label}>{Strings.createMeal_imageUrl}</Text>
              <View style={styles.imageUrlContainer}>
                <CustomTextInput style={styles.imageUrlInput} placeholder={isEdit ? Strings.createMeal_imageUrl_edit_placeholder : Strings.createMeal_imageUrl_placeholder} value={imageUrl} onChangeText={setImageUrl} />
                <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                  <Text style={styles.uploadButtonText}>{isEdit ? Strings.createMeal_remove : Strings.createMeal_upload}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>{Strings.createMeal_prepTime}</Text>

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
                  <Text style={styles.label}>{Strings.createMeal_servings}</Text>
                  <CustomStepper value={servings} onIncrement={() => setServings(s => String(Number(s) + 1))} onDecrement={() => setServings(s => String(Math.max(1, Number(s) - 1)))} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>{Strings.createMeal_difficulty}</Text>
                  <CustomDropdown value={difficulty} options={['Easy', 'Medium', 'Hard']} onSelect={setDifficulty} icon={require("@/assets/images/icondown.png")} />

                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.label}>{Strings.createMeal_category}</Text>
                  <CustomDropdown value={category} options={['Dinner', 'Lunch', 'Breakfast']} onSelect={setCategory} icon={require("@/assets/images/icondown.png")} />

                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{Strings.createMeal_ingredients}</Text>

              <FlatList
                data={ingredients}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                renderItem={renderIngredientItem}
              />

              <TouchableOpacity style={styles.addIngredient} onPress={handleAddIngredient}>
                <IconPlus width={verticalScale(21)} height={verticalScale(21)} color="black" />
                <Text style={styles.plusicon}>+</Text>
                <Text style={styles.addIngredientText}>{Strings.createMeal_addIngredient}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{Strings.createMeal_instruction}</Text>



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
                <Text style={styles.addIngredientText}>{Strings.createMeal_addStep}</Text>
              </TouchableOpacity>

            </View>
            <View style={styles.parentOfConfirmButton}>
              <BaseButton
                title={isEdit ? Strings.createMeal_discard : Strings.createMeal_cancel}
                gradientButton={false}
                backgroundColor={Colors.white}
                width={isEdit ? width * 0.28 : width * 0.41}
                textStyle={isEdit ? styles.cancelButtonError : styles.cancelButton}
                textColor={isEdit ? Colors.error : Colors.primary}
              />
              <BaseButton
                title={isEdit ? Strings.createMeal_updateMeal : Strings.createMeal_confirm}
                gradientButton={true}
                width={isEdit ? width * 0.65 : width * 0.41}
                gradientStartColor={Colors._667D4C}
                gradientEndColor={Colors._9DAF89}
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

  },
  sectionTitle: { fontSize: moderateScale(12), fontFamily: FontFamilies.ROBOTO_SEMI_BOLD, color: Colors.primary, marginBottom: verticalScale(10) },
  label: { fontSize: moderateScale(12), marginTop: moderateScale(8), marginBottom: moderateScale(4), fontFamily: FontFamilies.ROBOTO_REGULAR, color: Colors.primary },

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
  deleteIconImage: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  instructionInput: {
    height: verticalScale(60),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.greysoft,
    paddingHorizontal: horizontalScale(10),
    paddingTop: moderateScale(15),
    marginTop: moderateScale(-5),
    width: width * 0.8,
    marginBottom: verticalScale(15),
  },
  instructionInputEdit: {
    height: verticalScale(60),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.greysoft,
    paddingHorizontal: horizontalScale(10),
    paddingTop: moderateScale(15),
    marginTop: moderateScale(-5),
    width: width * 0.7,
    marginBottom: verticalScale(15),
  },
  closeIconImage: {
    width: verticalScale(22),
    height: verticalScale(22),
  },
  closeIconImageLarge: {
    width: verticalScale(24),
    height: verticalScale(24),
  },
  scrollViewContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(30),
  },
  descriptionInput: {
    height: verticalScale(80),
    borderRadius: moderateScale(4),
    backgroundColor: Colors.greysoft,
    paddingHorizontal: horizontalScale(10),
  },
  imageUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageUrlInput: {
    flex: 1,
  },
  cancelButtonError: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.error,
    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },

});
