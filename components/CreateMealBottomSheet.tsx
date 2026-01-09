import { closeIcon, deleteicon, iconMeal } from "@/assets/images";
import { IconPlus } from "@/assets/svg";
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
// import { getUnitOptions } from "@/utils/unitOptions";
import { generateFirebaseId } from "@/services/firestore";
import { createMealValidationSchema } from "@/utils/validators/MealValidators";
import { useCreateMealViewModel } from "@/viewmodels/CreateMealViewModel";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
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

  const prepTimeOptions = [
    Strings._5_mins,
    Strings._10_mins,
    Strings._15_mins,
    Strings._20_mins,
    Strings._25_mins,
    Strings._30_mins,
    Strings._35_mins,
    Strings._40_mins,
    Strings._45_mins,
    Strings._50_mins,
    Strings._55_mins,
    Strings._60_mins,
  ];

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
        ingredients: mealData.ingredients,
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

  // Helper to get units for a given category (object or id)
  // Helper to get units for a given category (object or id)
  const getUnitsForCategory = (category) => {
    if (!category) return [];

    // If category is an object with id
    if (typeof category === "object" && category.id) {
      const found = ingredientCategories.find((cat) => cat.id === category.id);
      return found && Array.isArray(found.unit) ? found.unit : [];
    }

    // If category is a string (id)
    if (typeof category === "string") {
      const found = ingredientCategories.find((cat) => cat.id === category);
      return found && Array.isArray(found.unit) ? found.unit : [];
    }

    return [];
  };

  const renderIngredientItem =
    (ingredients, setFieldValue, errors, touched, setTouched) =>
    ({ item, index }) => {
      // Check if the current unit is tablespoon (or similar volume measurements)
      const isVolumeUnit =
        item?.unit?.toLowerCase().includes(Strings.units.tablespoon) ||
        item?.unit?.toLowerCase().includes(Strings.units.teaspoon) ||
        item?.unit?.toLowerCase().includes(Strings.units.cup);

      // Get units - use categoryUnits if available (edit mode), otherwise get from ingredientCategories
      const unitOptions =
        item?.categoryUnits && Array.isArray(item.categoryUnits)
          ? item.categoryUnits
          : getUnitsForCategory(item?.category || item?.categoryId);

      console.log("Item:", item);
      console.log("Unit Options:", unitOptions);

      return (
        <View>
          <Text style={styles.label}>{Strings.createMeal_ingredientName}</Text>
          <CustomTextInput
            placeholder={Strings.createMeal_ingredientName_placeholder}
            value={item.ingredientName}
            onChangeText={(text) => {
              const updated = [...ingredients];
              updated[index] = { ...updated[index], ingredientName: text };
              setFieldValue(INGREDIENTS_KEY, updated);
              if (
                touched.ingredients?.[index]?.ingredientName &&
                errors.ingredients?.[index]?.ingredientName
              ) {
                const updatedTouched = { ...touched };
                if (Array.isArray(updatedTouched.ingredients)) {
                  updatedTouched.ingredients[index] = {
                    ...updatedTouched.ingredients[index],
                    ingredientName: false,
                  };
                  setTouched(updatedTouched);
                }
              }
            }}
            error={
              touched.ingredients?.[index]?.ingredientName &&
              errors.ingredients?.[index]?.ingredientName
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
                {Strings.createMeal_count}
              </Text>
              <CustomStepper
                value={isVolumeUnit ? item?.count : "0"}
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
                  const unitWeightIndex = unitOptions.indexOf(item?.unit);
                  if (unitWeightIndex < unitOptions.length - 1) {
                    const updated = [...ingredients];
                    const newUnit = unitOptions[unitWeightIndex + 1];
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
                  const unitWeightIndex = unitOptions.indexOf(item?.unit);
                  if (unitWeightIndex > 0) {
                    const updated = [...ingredients];
                    const newUnit = unitOptions[unitWeightIndex - 1];
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
                value={item?.categoryName || item?.category} // Show categoryName (edit) or category object (create)
                options={ingredientCategories}
                onSelect={(category) => {
                  const updated = [...ingredients];
                  const newUnitOptions = getUnitsForCategory(category);
                  updated[index] = {
                    ...updated[index],
                    unit: newUnitOptions[0] ?? "",
                    categoryId: category.id,
                    categoryName: category.title,
                    categoryUnits: category.unit, // Store categoryUnits
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

  // Add this helper function before handleCreateMeal
  const prepareMealData = (values, isEdit = false) => {
    // Map ingredients - include all data needed for subcollection
    const mappedIngredients = values.ingredients.map((ing) => {
      // Get the categoryId properly
      const categoryId =
        ing.categoryId ||
        (typeof ing.category === "object" && ing.category?.id
          ? ing.category.id
          : ing.category);

      // Parse count - it's always a string from the stepper
      const countValue = parseInt(ing.count || "0", 10);

      const ingredient = {
        ingredientId: ing.ingredientId || generateFirebaseId(),
        name: ing.ingredientName,
        ingredientName: ing.ingredientName,
        unit: ing.unit,
        category: categoryId,
        categoryId: categoryId,
      };

      // Only add count if it's greater than 0
      if (countValue > 0) {
        ingredient.count = countValue.toString();
      }

      return ingredient;
    });

    // Filter out any ingredients with undefined category before sending
    const validIngredients = mappedIngredients.filter(
      (ing) =>
        ing.category !== undefined &&
        ing.category !== null &&
        ing.category !== ""
    );

    // Filter and map steps - only include non-empty steps
    const mappedSteps = values.steps
      .map((step) => step.text?.trim())
      .filter((text) => text && text.length > 0);

    // Build meal data
    const mealData = {
      name: values.name.trim(),
      description: values.description,
      imageUrl: values.imageUrl,
      prepTime: values.prepTime,
      servings: values.servings,
      difficulty: values.difficulty,
      category: values.category,
      ingredients: validIngredients,
      uid: user?.id,
    };

    // Add id for edit mode
    if (isEdit) {
      mealData.id = values.id;
    } else {
      // Add nameCharacters for create mode
      const nameCharacters = [];
      const name = values.name.trim();
      for (let i = 1; i <= name.length; i++) {
        nameCharacters.push(name.substring(0, i).toLowerCase());
      }
      mealData.nameCharacters = nameCharacters;
    }

    // Only add steps if there are valid steps
    if (mappedSteps.length > 0) {
      mealData.steps = mappedSteps;
    }

    return { mealData, validIngredients, mappedIngredients };
  };

  const handleCreateMeal = async (values) => {
    try {
      const { mealData, validIngredients, mappedIngredients } = prepareMealData(
        values,
        false
      );

      if (validIngredients.length !== mappedIngredients.length) {
        alert("Please select a category for all ingredients");
        return;
      }

      console.log(
        "Creating meal with data:",
        JSON.stringify(mealData, null, 2)
      );

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
    console.log("Editing meal with values:", values);
    try {
      const { mealData, validIngredients, mappedIngredients } = prepareMealData(
        values,
        true
      );

      if (validIngredients.length !== mappedIngredients.length) {
        alert("Please select a category for all ingredients");
        return;
      }

      console.log("Updating meal with data:", mealData);

      updateMealData(
        {
          mealData: mealData,
          updateWithIngredients: true,
        },
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
        console.log("Formik Values:", values),
        (
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
                  <Text style={styles.label}>
                    {Strings.createMeal_mealName}
                  </Text>
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

                  <Text style={styles.label}>
                    {Strings.createMeal_imageUrl}
                  </Text>
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
                          const index = prepTimeOptions.indexOf(
                            values.prepTime
                          );
                          if (index < prepTimeOptions.length - 1) {
                            setFieldValue(
                              PREPTIME_KEY,
                              prepTimeOptions[index + 1]
                            );
                          }
                        }}
                        onDecrement={() => {
                          const index = prepTimeOptions.indexOf(
                            values.prepTime
                          );
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
                          Strings.filterModal_challenging,
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
                      const unitOptions = getUnitsForCategory(firstCategory);

                      setFieldValue(INGREDIENTS_KEY, [
                        ...values.ingredients,
                        {
                          ingredientName: "",
                          count: "0",
                          unit: unitOptions[0] ?? "",
                          categoryId: firstCategory?.id ?? "",
                          categoryName: firstCategory?.title ?? "",
                          // category: firstCategory ?? "",
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
                    textStyleText={styles.discardText}
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
                        <Image
                          source={iconMeal}
                          style={{
                            width: verticalScale(21),
                            height: verticalScale(21),
                            tintColor: Colors.white,
                          }}
                          resizeMode="contain"
                        />
                      ) : null
                    }
                    textStyle={[styles.confirmButton]}
                    onPress={async () => {
                      const formErrors = await validateForm();
                      console.log("Validation errors:", formErrors);

                      if (Object.keys(formErrors).length > 0) {
                        // Mark all fields as touched to show validation errors
                        const ingredientsTouched = values.ingredients.map(
                          () => ({
                            name: true,
                            count: true,
                            unit: true,
                            category: true,
                          })
                        );

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
        )
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
    fontSize: moderateScale(16),
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
  discardText: {
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    // color: Colors.primary,

    fontSize: moderateScale(14),
  },
});
