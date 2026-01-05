import { closeIcon, deleteicon } from "@/assets/images";
import { IconMeal, IconPlus } from "@/assets/svg";
import { IconDown } from "@/assets/svg/IconUpDown";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { useLoader } from "@/context/LoaderContext";
import {
  CATEGORY_KEY,
  DESCRIPTION_KEY,
  DIFFICULTY_KEY,
  IMAGEURL_KEY,
  INGREDIENTS_KEY,
  NAME_KEY,
  PREPTIME_KEY,
  SERVINGS_KEY,
  STEPS_KEY,
} from "@/reduxStore/appKeys";
import { useAppSelector } from "@/reduxStore/hooks";
import { fontSize } from "@/utils/Fonts";
import { getUnitOptions } from "@/utils/unitOptions";
import { createMealValidationSchema } from "@/utils/validators/MealValidators";
import { useCreateMealViewModel } from "@/viewmodels/CreateMealViewModel";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { serverTimestamp } from "firebase/firestore";
import { Formik } from "formik";
import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BaseButton from "./BaseButton";
import CustomDropdown from "./CustomDropdown";
import CustomStepper from "./CustomStepper";
import CustomTextInput from "./CustomTextInput";
import ImagePickerModal from "./ImagePickerModal";

export interface CreateMealBottomSheetRef {
  expand: () => void;
  close: () => void;
}
interface CreateMealBottomSheetProps {
  isEdit?: boolean;
  mealData?: any;
}
const CreateMealBottomSheet = forwardRef<
  BottomSheet,
  CreateMealBottomSheetProps
>(({ isEdit = false, mealData }, ref) => {
  const user = useAppSelector((state) => state.auth.user);

  const { ingredientCategories, loading, error, addMealData, updateMealData } =
    useCreateMealViewModel();

  const snapPoints = useMemo(() => ["100%"], []);
  const { width } = Dimensions.get("window");

  const prepTimeOptions = [Strings._5_mins, Strings._10_mins, Strings._15_mins];

  const { showLoader, hideLoader } = useLoader();
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const initialValues = useMemo(() => {
    if (isEdit && mealData) {
      return {
        id: mealData.id || "",
        name: mealData.name || "",
        description: mealData.description || "",
        imageUrl: mealData.imageUrl || "",
        prepTime: mealData.prepTime || Strings._5_mins,
        servings: String(mealData.servings || "1"),
        difficulty: mealData.difficulty || Strings.filterModal_easy,
        category: mealData.category || Strings.plans_breakfast,
        ingredients: (mealData.ingredients || []).map((ing) => {
          const category =
            typeof ing.category === "string"
              ? ingredientCategories.find((cat) => cat.id === ing.category)
              : ing.category;

          return {
            name: ing.name || "",
            count: ing.count || "1",
            unit: ing.unit || "",
            category: category || ingredientCategories[0] || null,
          };
        }),
        steps: mealData.steps?.map((text) => ({ text })) || [{ text: "" }],
      };
    }

    return {
      name: "",
      description: "",
      imageUrl: "",
      prepTime: Strings._5_mins,
      servings: "1",
      difficulty: Strings.filterModal_easy,
      category: Strings.plans_breakfast,
      ingredients: [],
      steps: [{ text: "" }],
    };
  }, [isEdit, mealData]);

  useEffect(() => {
    if (loading) showLoader();
    else hideLoader();
  }, [loading]);

  const renderIngredientItem =
    (ingredients, setFieldValue, errors, touched, setTouched) =>
    ({ item, index }) => {
      // Check if the current unit is tablespoon (or similar volume measurements)
      const isVolumeUnit =
        item?.unit?.toLowerCase().includes(Strings.units.tablespoon) ||
        item?.unit?.toLowerCase().includes(Strings.units.teaspoon) ||
        item?.unit?.toLowerCase().includes(Strings.units.cup);

      return (
        <View>
          <Text style={styles.label}>Ingredient Name</Text>
          <CustomTextInput
            placeholder={Strings.createMeal_ingredientName_placeholder}
            value={item.name}
            onChangeText={(text) => {
              const updated = [...ingredients];
              updated[index] = { ...updated[index], name: text };
              setFieldValue(INGREDIENTS_KEY, updated);
              if (
                touched.ingredients?.[index]?.name &&
                errors.ingredients?.[index]?.name
              ) {
                const updatedTouched = { ...touched };
                if (Array.isArray(updatedTouched.ingredients)) {
                  updatedTouched.ingredients[index] = {
                    ...updatedTouched.ingredients[index],
                    name: false,
                  };
                  setTouched(updatedTouched);
                }
              }
            }}
            error={
              touched.ingredients?.[index]?.name &&
              errors.ingredients?.[index]?.name
            }
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text
                style={[
                  styles.label,
                  !isVolumeUnit && { color: Colors.tertiary },
                ]}
              >
                Count
              </Text>
              <CustomStepper
                value={isVolumeUnit ? item?.count : "0"}
                disabled={!isVolumeUnit}
                onIncrement={() => {
                  if (!isVolumeUnit) return;
                  const updated = [...ingredients];
                  updated[index] = {
                    ...updated[index],
                    count: String(Number(item?.count || 0) + 1),
                  };
                  setFieldValue(INGREDIENTS_KEY, updated);
                }}
                onDecrement={() => {
                  if (!isVolumeUnit) return;
                  const updated = [...ingredients];
                  updated[index] = {
                    ...updated[index],
                    count: String(Math.max(1, Number(item?.count || 1) - 1)),
                  };
                  setFieldValue(INGREDIENTS_KEY, updated);
                }}
              />
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>{Strings.createMeal_unit}</Text>

              <CustomStepper
                value={item?.unit}
                onIncrement={() => {
                  const unitWeightOptions = getUnitOptions(item?.category); // USE getUnitOptions
                  const unitWeightIndex = unitWeightOptions.indexOf(item?.unit);
                  if (unitWeightIndex < unitWeightOptions.length - 1) {
                    const updated = [...ingredients];
                    const newUnit = unitWeightOptions[unitWeightIndex + 1];
                    updated[index] = {
                      ...updated[index],
                      unit: newUnit,
                      // Reset count if switching from volume to non-volume unit
                      count:
                        newUnit
                          ?.toLowerCase()
                          .includes(Strings.units.tablespoon) ||
                        newUnit
                          ?.toLowerCase()
                          .includes(Strings.units.teaspoon) ||
                        newUnit?.toLowerCase().includes(Strings.units.cup)
                          ? updated[index].count
                          : "0",
                    };
                    setFieldValue(INGREDIENTS_KEY, updated);
                  }
                }}
                onDecrement={() => {
                  const unitWeightOptions = getUnitOptions(item?.category); // USE getUnitOptions
                  const unitWeightIndex = unitWeightOptions.indexOf(item?.unit);
                  if (unitWeightIndex > 0) {
                    const updated = [...ingredients];
                    const newUnit = unitWeightOptions[unitWeightIndex - 1];
                    updated[index] = {
                      ...updated[index],
                      unit: newUnit,
                      // Reset count if switching from volume to non-volume unit
                      count:
                        newUnit
                          ?.toLowerCase()
                          .includes(Strings.units.tablespoon) ||
                        newUnit
                          ?.toLowerCase()
                          .includes(Strings.units.teaspoon) ||
                        newUnit?.toLowerCase().includes(Strings.units.cup)
                          ? updated[index].count
                          : "0",
                    };
                    setFieldValue(INGREDIENTS_KEY, updated);
                  }
                }}
              />
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>{Strings.createMeal_category}</Text>

              <CustomDropdown
                value={item?.category}
                options={ingredientCategories}
                onSelect={(category) => {
                  const updated = [...ingredients];
                  const newUnitOptions = getUnitOptions(category); // USE getUnitOptions
                  updated[index] = {
                    ...updated[index],
                    unit: newUnitOptions[0] ?? "", // Use first unit from getUnitOptions
                    category,
                    // Reset count when category changes
                    count: "0",
                  };
                  setFieldValue(INGREDIENTS_KEY, updated);
                }}
                icon={IconDown}
              />
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                const updated = ingredients.filter((_, i) => i !== index);
                setFieldValue(INGREDIENTS_KEY, updated);
              }}
            >
              <Image
                source={deleteicon}
                style={{
                  width: verticalScale(24),
                  height: verticalScale(24),
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    };
  const handleUpload = (setFieldValue) => {
    setShowImagePickerModal(true);
  };

  const renderInstructionItem =
    (steps, setFieldValue) =>
    ({ item, index }) =>
      (
        <View style={{ marginBottom: verticalScale(15) }}>
          <View style={[styles.row, { alignItems: "flex-start" }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  marginTop: verticalScale(5),
                  marginRight: horizontalScale(8),
                },
              ]}
            >
              {index + 1}.
            </Text>

            <View style={{ flex: 1 }}>
              <CustomTextInput
                style={{
                  height: verticalScale(60),
                  borderRadius: moderateScale(4),
                  backgroundColor: Colors.greysoft,
                  paddingHorizontal: horizontalScale(10),
                  paddingTop: moderateScale(10),
                  textAlignVertical: "top",
                }}
                placeholder={Strings.createMeal_mealDescription_placeholder}
                multiline
                value={item?.text}
                onChangeText={(text) => {
                  const updated = [...steps];
                  updated[index] = { ...updated[index], text };
                  setFieldValue(STEPS_KEY, updated);
                }}
              />
            </View>

            {isEdit ? (
              <TouchableOpacity
                onPress={() => {
                  const updated = steps.filter((_, i) => i !== index);
                  setFieldValue(STEPS_KEY, updated);
                }}
                style={{
                  marginTop: verticalScale(5),
                  marginLeft: horizontalScale(8),
                }}
              >
                <Image
                  source={closeIcon}
                  style={{
                    width: verticalScale(22),
                    height: verticalScale(22),
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      );
  const handleCreateMeal = async (values) => {
    try {
      const mappedIngredients = values.ingredients.map((ing) => {
        const isVolumeUnit =
          ing.unit?.toLowerCase().includes(Strings.units.tablespoon) ||
          ing.unit?.toLowerCase().includes(Strings.units.teaspoon) ||
          ing.unit?.toLowerCase().includes(Strings.units.cup);

        return {
          name: ing.name,
          unit: ing.unit,
          // Only include count if it's a volume unit
          ...(isVolumeUnit && { count: ing.count }),
          category:
            typeof ing.category === "object" && ing.category.id
              ? ing.category.id
              : ing.category,
        };
      });
      const mappedSteps = values.steps.map((step) => step.text);
      const mealData = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        prepTime: values.prepTime,
        servings: values.servings,
        difficulty: values.difficulty,
        category: values.category,
        ingredients: mappedIngredients,
        steps: mappedSteps,
        createdAt: serverTimestamp(),
        uid: user?.id,
      };
      addMealData(
        mealData,
        () => {
          alert(Strings.mealAdded);
          if (ref && typeof ref !== "function" && ref.current?.close) {
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

  const handleEditMeal = async (values) => {
    try {
      const mappedIngredients = values.ingredients.map((ing) => {
        const isVolumeUnit =
          ing.unit?.toLowerCase().includes(Strings.units.tablespoon) ||
          ing.unit?.toLowerCase().includes(Strings.units.teaspoon) ||
          ing.unit?.toLowerCase().includes(Strings.units.cup);

        return {
          name: ing.name,
          unit: ing.unit,
          // Only include count if it's a volume unit
          ...(isVolumeUnit && { count: ing.count }),
          category:
            typeof ing.category === "object" && ing.category.id
              ? ing.category.id
              : ing.category,
        };
      });
      const mappedSteps = values.steps.map((step) => step.text);
      const mealData = {
        id: values.id,
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        prepTime: values.prepTime,
        servings: values.servings,
        difficulty: values.difficulty,
        category: values.category,
        ingredients: mappedIngredients,
        steps: mappedSteps,
        uid: user?.id,
      };
      updateMealData(
        mealData,
        () => {
          alert(Strings.mealUpdated);
          if (ref && typeof ref !== "function" && ref.current?.close) {
            ref.current.close();
          }
        },
        (error) => {
          alert(Strings.error_updating_meal + error);
        }
      );
    } catch (error) {
      alert(Strings.error_updating_meal + error);
    }
  };

  return (
    <Formik
      key={isEdit && mealData ? JSON.stringify(mealData) : "create"}
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={createMealValidationSchema}
      onSubmit={isEdit ? handleEditMeal : handleCreateMeal}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({
        values,
        setFieldValue,
        handleSubmit,
        errors,
        touched,
        setTouched,
        validateForm,
        resetForm,
      }) => (
        <>
          <ImagePickerModal
            visible={showImagePickerModal}
            onClose={() => setShowImagePickerModal(false)}
            onImagePicked={(url) => setFieldValue("imageUrl", url)}
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
            onClose={() => {
              resetForm();
            }}
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
              <Text style={styles.header}>
                {isEdit
                  ? Strings.createMeal_editMeal
                  : Strings.createMeal_createMeal}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  ref && typeof ref !== "function" && ref.current?.close()
                }
              >
                <Image
                  source={closeIcon}
                  style={{
                    width: verticalScale(24),
                    height: verticalScale(24),
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <BottomSheetScrollView
              contentContainerStyle={{
                paddingHorizontal: moderateScale(20),
                paddingBottom: verticalScale(30),
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {Strings.createMeal_basicInfo}
                </Text>
                <Text style={styles.label}>{Strings.createMeal_mealName}</Text>
                <CustomTextInput
                  placeholder={Strings.createMeal_mealName_placeholder}
                  value={values.name}
                  onChangeText={(text) => {
                    setFieldValue(NAME_KEY, text);
                    if (touched.name && errors.name) {
                      setTouched({ ...touched, name: false });
                    }
                  }}
                  error={touched.name && errors.name}
                />

                <Text style={styles.label}>
                  {Strings.createMeal_mealDescription}
                </Text>
                <CustomTextInput
                  style={{
                    height: verticalScale(80),
                    borderRadius: moderateScale(4),
                    backgroundColor: Colors.greysoft,
                    paddingHorizontal: horizontalScale(10),
                    marginBottom: moderateScale(8),
                  }}
                  placeholder={Strings.createMeal_mealDescription_placeholder}
                  multiline={true}
                  value={values.description}
                  numberOfLines={4}
                  onChangeText={(text) => {
                    setFieldValue(DESCRIPTION_KEY, text);
                    if (touched.description && errors.description) {
                      setTouched({ ...touched, description: false });
                    }
                  }}
                  error={touched.description && errors.description}
                />

                <Text style={styles.label}>{Strings.createMeal_imageUrl}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: moderateScale(8),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: moderateScale(8),
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <CustomTextInput
                        style={{ marginBottom: 0 }}
                        placeholder={Strings.createMeal_imageUrl_placeholder}
                        value={values.imageUrl}
                        onChangeText={(text) =>
                          setFieldValue(IMAGEURL_KEY, text)
                        }
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleUpload(setFieldValue)}
                    >
                      <Text style={styles.uploadButtonText}>
                        {isEdit
                          ? Strings.createMeal_remove
                          : Strings.createMeal_upload}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>
                      {Strings.createMeal_prepTime}
                    </Text>

                    <CustomStepper
                      value={values.prepTime}
                      onIncrement={() => {
                        const index = prepTimeOptions.indexOf(values.prepTime);
                        if (index < prepTimeOptions.length - 1) {
                          setFieldValue(
                            PREPTIME_KEY,
                            prepTimeOptions[index + 1]
                          );
                        }
                      }}
                      onDecrement={() => {
                        const index = prepTimeOptions.indexOf(values.prepTime);
                        if (index > 0) {
                          setFieldValue(
                            PREPTIME_KEY,
                            prepTimeOptions[index - 1]
                          );
                        }
                      }}
                      showUp={true}
                      showDown={true}
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>
                      {Strings.createMeal_servings}
                    </Text>
                    <CustomStepper
                      value={values.servings}
                      onIncrement={() =>
                        setFieldValue(
                          SERVINGS_KEY,
                          String(Number(values.servings) + 1)
                        )
                      }
                      onDecrement={() =>
                        setFieldValue(
                          SERVINGS_KEY,
                          String(Math.max(1, Number(values.servings) - 1))
                        )
                      }
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>
                      {Strings.createMeal_difficulty}
                    </Text>
                    <CustomDropdown
                      value={values.difficulty}
                      options={[
                        Strings.testMealPlan_easy,
                        Strings.testMealPlan_medium,
                        Strings.testMealPlan_hard,
                      ]}
                      onSelect={(val) => setFieldValue(DIFFICULTY_KEY, val)}
                      icon={IconDown}
                    />
                  </View>
                  <View style={styles.rowItem}>
                    <Text style={styles.label}>
                      {Strings.createMeal_category}
                    </Text>
                    <CustomDropdown
                      value={values.category}
                      options={[
                        Strings.plans_breakfast,
                        Strings.plans_lunch,
                        Strings.plans_dinner,
                      ]}
                      onSelect={(val) => setFieldValue(CATEGORY_KEY, val)}
                      icon={IconDown}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {Strings.createMeal_ingredients}
                </Text>

                <FlatList
                  data={values.ingredients}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={renderIngredientItem(
                    values.ingredients,
                    setFieldValue,
                    errors,
                    touched,
                    setTouched
                  )}
                />
                {touched.ingredients &&
                  errors.ingredients &&
                  typeof errors.ingredients === "string" && (
                    <Text style={styles.errorText}>{errors.ingredients}</Text>
                  )}

                <TouchableOpacity
                  style={styles.addIngredient}
                  onPress={() => {
                    const firstCategory =
                      ingredientCategories.length > 0
                        ? ingredientCategories[0]
                        : null;
                    const unitOptions = getUnitOptions(firstCategory);

                    setFieldValue(INGREDIENTS_KEY, [
                      ...values.ingredients,
                      {
                        name: "",
                        count: "1",
                        unit: unitOptions[0] ?? "",
                        category: firstCategory ?? "",
                      },
                    ]);
                    if (touched.ingredients && errors.ingredients) {
                      setTouched({ ...touched, ingredients: false });
                    }
                  }}
                >
                  <IconPlus
                    width={verticalScale(21)}
                    height={verticalScale(21)}
                    color={Colors.primary}
                  />
                  <Text style={styles.plusicon}>+</Text>
                  <Text style={styles.addIngredientText}>
                    {Strings.createMeal_addIngredient}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {Strings.createMeal_instruction}
                </Text>

                <FlatList
                  data={values.steps}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={renderInstructionItem(
                    values.steps,
                    setFieldValue
                  )}
                />
                <TouchableOpacity
                  style={styles.addIngredient}
                  onPress={() =>
                    setFieldValue(STEPS_KEY, [...values.steps, { text: "" }])
                  }
                >
                  <Text style={styles.plusicon}>+</Text>
                  <Text style={styles.addIngredientText}>
                    {Strings.createMeal_addStep}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.parentOfConfirmButton}>
                <BaseButton
                  title={
                    isEdit
                      ? Strings.createMeal_discard
                      : Strings.createMeal_cancel
                  }
                  gradientButton={false}
                  backgroundColor={Colors.white}
                  width={isEdit ? width * 0.28 : width * 0.41}
                  textStyle={[
                    styles.cancelButton,
                    { color: isEdit ? Colors.error : Colors.primary },
                  ]}
                  textColor={isEdit ? Colors.error : Colors.primary}
                  onPress={() => ref?.current?.close()}
                />
                <BaseButton
                  title={
                    isEdit
                      ? Strings.createMeal_updateMeal
                      : Strings.createMeal_confirm
                  }
                  gradientButton={true}
                  width={isEdit ? width * 0.65 : width * 0.41}
                  gradientStartColor={Colors._667D4C}
                  gradientEndColor={Colors._9DAF89}
                  gradientStart={{ x: 0, y: 0 }}
                  gradientEnd={{ x: 1, y: 0 }}
                  textColor={Colors.white}
                  rightChild={
                    isEdit ? (
                      <IconMeal
                        width={verticalScale(21)}
                        height={verticalScale(21)}
                      />
                    ) : null
                  }
                  textStyle={[styles.confirmButton]}
                  onPress={async () => {
                    const formErrors = await validateForm();
                    console.log("Validation errors:", formErrors);

                    if (Object.keys(formErrors).length > 0) {
                      // Mark all fields as touched to show validation errors
                      const ingredientsTouched = values.ingredients.map(() => ({
                        name: true,
                        count: true,
                        unit: true,
                        category: true,
                      }));

                      const stepsTouched = values.steps.map(() => true);

                      setTouched(
                        {
                          name: true,
                          description: true,
                          imageUrl: true,
                          prepTime: true,
                          servings: true,
                          difficulty: true,
                          category: true,
                          ingredients: ingredientsTouched,
                          steps: stepsTouched,
                        },
                        false
                      ); // false means don't validate, just set touched

                      return;
                    }
                    handleSubmit();
                  }}
                />
              </View>
              <View style={styles.emptybottom}></View>
            </BottomSheetScrollView>
          </BottomSheet>
        </>
      )}
    </Formik>
  );
});

export default CreateMealBottomSheet;

const styles = StyleSheet.create({
  header: {
    fontSize: moderateScale(21),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    marginBottom: verticalScale(10),
    elevation: moderateScale(3),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: moderateScale(0.15),
    shadowRadius: moderateScale(4),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(10),
  },
  label: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(8),
    marginBottom: moderateScale(4),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors._F6F6F6,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: fontSize(14),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  uploadButton: {
    marginLeft: horizontalScale(8),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  uploadButtonText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  row: { flexDirection: "row", justifyContent: "flex-start", gap: 8 },
  rowItem: { flex: 1, minWidth: moderateScale(80) },
  deleteButton: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(18),
  },
  parentCreateMealText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: verticalScale(20),
    marginHorizontal: moderateScale(20),
  },
  emptyView: {
    height: verticalScale(35),
  },
  placeholderText: {
    color: Colors.tertiary,
    fontSize: moderateScale(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  addIngredientText: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    fontSize: moderateScale(14),
  },
  addIngredient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: verticalScale(10),
  },
  confirmButton: {
    color: Colors.white,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    fontSize: moderateScale(12),
  },
  cancelButton: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    // color: Colors.primary,

    fontSize: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  parentOfConfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: verticalScale(15),
  },
  plusicon: {
    color: Colors.primary,
    fontSize: moderateScale(22),
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    marginRight: moderateScale(8),
  },
  emptybottom: {
    height: verticalScale(140),
  },
  errorText: {
    fontSize: fontSize(14),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.error,
    marginTop: verticalScale(-4),
    marginBottom: verticalScale(8),
  },
});
