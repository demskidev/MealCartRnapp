// Combined search and filter meals

import {
  addDocument,
  compoundQueryDocuments,
  deleteDocument,
  getDocumentById,
  getSubcollectionDocuments,
  queryDocuments,
  updateDocument,
  updateSubcollectionDocument,
  uploadImageToFirebase,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import {
  ADD_MEAL,
  DELETE_MEAL,
  FETCH_MEALS,
  FETCH_RECENT_MEALS,
  FILTER_N_SEARCH_MEALS,
  MEALS_SLICE,
  UPDATE_MEAL,
} from "../actionTypes";
import {
  INGREDIENTS_CATEGORY_COLLECTION,
  MEAL_IMAGE_FOLDER,
  MEAL_INGREDIENTS_COLLECTION,
  MEALS_COLLECTION,
} from "../appKeys";

export interface MealIngredient {
  categoryName: string;
  unit: string;
  categoryId?: string;
  cagtegoryUnits?: string[];
  count?: string;
  ingredientId: string;
  ingredientName?: string;
}

export interface Meal {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
  prepTime?: string;
  difficulty?: string;
  createdAt?: Date;
  description?: string;
  servings?: string;
  steps?: string[];
  lastViewedAt?: Date;
  ingredients?: MealIngredient[];
  uid: string;
  // Add other fields as needed
}

export interface MealsState {
  meals: Meal[];
  recentMeals: Meal[];
  loading: boolean;
  error: any;
}

const initialState: MealsState = {
  meals: [],
  recentMeals: [],
  loading: false,
  error: null,
};

const addMealToDb = async (mealData: any) => {
  try {
    const meal = await addDocument(MEALS_COLLECTION, mealData);
    return meal;
  } catch (error) {
    throw error;
  }
};

// const updateMealInDb = async (mealData: any) => {
//   try {
//     const meal = await updateDocument(MEALS_COLLECTION, mealData.id, mealData);
//     return meal;
//   } catch (error) {
//     throw error;
//   }
// };

const deleteMealFromDb = async (mealId: string) => {
  try {
    await deleteDocument(MEALS_COLLECTION, mealId);
  } catch (error) {
    throw error;
  }
};

const addMealImage = async (mealData: any) => {
  try {
    const imageUri = await uploadImageToFirebase(
      mealData?.imageUrl,
      MEAL_IMAGE_FOLDER + Date.now().toString()
    );
    mealData.imageUrl = imageUri;
    const meal = await addMealToDb(mealData);
    return meal;
  } catch (error) {
    throw error;
  }
};

export const addMeal = createAsyncThunk(
  ADD_MEAL,
  async (mealData: any, { rejectWithValue }) => {
    try {
      const meal = await addMealToDb(mealData);
      return meal;
      // }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateMeal = createAsyncThunk(
  UPDATE_MEAL,
  async (mealData: any, { rejectWithValue }) => {
    try {
      //  if(mealData?.imageUrl && !mealData?.imageUrl?.toString().startsWith(HTTPPREFIX)){
      //   const meal =  await addMealImage(mealData);
      //   return meal;

      //   } else {
      const meal = await updateMealInDb(mealData);
      return meal;
      // }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteMeal = createAsyncThunk(
  DELETE_MEAL,
  async (mealId: string, { rejectWithValue }) => {
    try {
      await deleteMealFromDb(mealId);
      return mealId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const enrichMealsWithIngredients = async (meals: any[]): Promise<any[]> => {
  return Promise.all(
    meals.map(async (meal: any) => {
      try {
        const mealIngredientsDoc = await getDocumentById(
          MEAL_INGREDIENTS_COLLECTION,
          meal.id
        );

        if (!mealIngredientsDoc) {
          return meal;
        }

        const ingredientsData = await getSubcollectionDocuments(
          MEAL_INGREDIENTS_COLLECTION,
          meal.id,
          "ingredients"
        );

        return {
          ...meal,
          ingredients: await Promise.all(
            meal.ingredients?.map(async (ing: any) => {
              const ingredientDetails: any = ingredientsData.find(
                (data: any) => data.id === ing.ingredientId
              );

              let categoryName = ing.categoryName;
              let categoryUnits = ing.categoryName;
              if (ing.categoryId) {
                try {
                  const categoryDoc: any = await getDocumentById(
                    INGREDIENTS_CATEGORY_COLLECTION,
                    ing.categoryId
                  );
                  categoryName = categoryDoc?.title || categoryName;
                  categoryUnits = categoryDoc?.unit || categoryUnits;
                } catch (error) {
                  console.error(
                    `Error fetching category ${ing.categoryId}:`,
                    error
                  );
                }
              }

              return {
                categoryId: ing.categoryId,
                ingredientId: ing.ingredientId,
                count: ing.count,
                ingredientName: ingredientDetails?.name,
                unit: ingredientDetails?.unit,
                categoryName: categoryName,
                categoryUnits: categoryUnits,
              };
            }) || []
          ),
        };
      } catch (error) {
        console.error(`Error fetching ingredients for meal ${meal.id}:`, error);
        return meal;
      }
    })
  );
};

export const fetchUserMeals = createAsyncThunk(
  FETCH_MEALS,
  async (
    {
      userId,
      limit = 10,
      startAfter = null,
    }: { userId: string; limit?: number; startAfter?: any },
    { rejectWithValue }
  ) => {
    try {
      const options: any = {
        limit,
        orderBy: "createdAt",
        orderDirection: "desc",
      };
      if (startAfter) options.startAfter = startAfter;

      const meals = await queryDocuments(
        MEALS_COLLECTION,
        "uid",
        "==",
        userId,
        options
      );

      console.log("Fetched meals from DB:", meals);

      const enrichedMeals = await enrichMealsWithIngredients(meals);

      return enrichedMeals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchRecentMeals = createAsyncThunk(
  FETCH_RECENT_MEALS,
  async (
    {
      userId,
      limit = 4,
      startAfter = null,
    }: { userId: string; limit?: number; startAfter?: any },
    { rejectWithValue }
  ) => {
    try {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const options: any = {
        limit,
        orderBy: "lastViewedAt",
        orderDirection: "desc",
      };
      if (startAfter) options.startAfter = startAfter;

      const meals = await compoundQueryDocuments(
        MEALS_COLLECTION,
        [
          { field: "uid", op: "==", value: userId },
          {
            field: "lastViewedAt",
            op: ">=",
            value: Timestamp.fromDate(twoDaysAgo),
          },
        ],
        options
      );

      console.log("Fetched recent meals from DB:", meals);

      const enrichedMeals = await enrichMealsWithIngredients(meals);

      return enrichedMeals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const searchMeals = createAsyncThunk(
  FILTER_N_SEARCH_MEALS,
  async (
    {
      userId,
      category = null,
      difficulty = null,
      prepTime = null,
      searchText = "",
      limit = 10,
      startAfter = null,
    }: {
      userId: string;
      category?: string | null;
      difficulty?: string | null;
      prepTime?: string | null;
      searchText?: string;
      limit?: number;
      startAfter?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const filters: any[] = [{ field: "uid", op: "==", value: userId }];
      if (category) {
        filters.push({ field: "category", op: "==", value: category });
      }
      if (difficulty) {
        filters.push({ field: "difficulty", op: "==", value: difficulty });
      }
      if (searchText && searchText.trim()) {
        filters.push({
          field: "nameCharacters",
          op: "array-contains",
          value: searchText.trim().toLowerCase(),
        });
      }
      const options: any = {
        limit,
        orderBy: "createdAt",
        orderDirection: "desc",
      };
      if (startAfter) options.startAfter = startAfter;

      let meals = await compoundQueryDocuments(
        MEALS_COLLECTION,
        filters,
        options
      );

      if (prepTime) {
        meals = meals.filter((meal: any) => {
          const prep = meal.prepTime || "";
          const minutes = parseInt(prep.match(/\d+/)?.[0] || "0");
          if (prepTime === "< 5 Mins") return minutes < 5;
          if (prepTime === "5 - 10 Mins") return minutes >= 5 && minutes <= 10;
          if (prepTime === "10 - 15 Mins")
            return minutes >= 10 && minutes <= 15;
          if (prepTime === "> 15 Mins") return minutes > 15;
          return true;
        });
      }

      const enrichedMeals = await enrichMealsWithIngredients(meals);

      return enrichedMeals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Helper function to update meal ingredients in subcollection
const updateMealIngredientsSubcollection = async (
  mealId: string,
  ingredients: any[]
) => {
  try {
    // Get the mealIngredients document
    const mealIngredientsDoc = await getDocumentById(
      MEAL_INGREDIENTS_COLLECTION,
      mealId
    );

    if (!mealIngredientsDoc) {
      console.log("No mealIngredients document found for meal:", mealId);
      return;
    }

    // Update each ingredient in the subcollection
    for (const ing of ingredients) {
      if (ing.ingredientId && ing.ingredientName && ing.unit) {
        try {
          // Update the ingredient document in the subcollection
          await updateSubcollectionDocument(
            MEAL_INGREDIENTS_COLLECTION,
            mealId,
            "ingredients",
            ing.ingredientId,
            {
              name: ing.ingredientName,
              unit: ing.unit,
            }
          );
        } catch (error) {
          console.error(
            `Error updating ingredient ${ing.ingredientId}:`,
            error
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating meal ingredients subcollection:", error);
  }
};

const updateMealInDb = async (mealData: any) => {
  try {
    console.log("=== UPDATE MEAL START ===");
    console.log("Raw mealData received:", JSON.stringify(mealData, null, 2));

    // Clean ingredients for main meal document - only store IDs (no count)
    const cleanedIngredients = mealData.ingredients?.map((ing: any) => {
      console.log("Processing ingredient:", JSON.stringify(ing, null, 2));
      return {
        categoryId: ing.categoryId,
        ingredientId: ing.ingredientId,
      };
    });

    console.log(
      "Cleaned ingredients:",
      JSON.stringify(cleanedIngredients, null, 2)
    );

    // Build clean meal data object with only valid Firestore fields
    const cleanedMealData: any = {
      name: mealData.name,
      description: mealData.description,
      imageUrl: mealData.imageUrl,
      prepTime: mealData.prepTime,
      servings: mealData.servings,
      difficulty: mealData.difficulty,
      category: mealData.category,
      ingredients: cleanedIngredients,
      steps: mealData.steps,
      uid: mealData.uid,
    };

    // Only add lastViewedAt if it exists
    if (mealData.lastViewedAt) {
      cleanedMealData.lastViewedAt = mealData.lastViewedAt;
    }

    console.log(
      "Final cleanedMealData before update:",
      JSON.stringify(cleanedMealData, null, 2)
    );

    // Check for undefined values
    Object.keys(cleanedMealData).forEach((key) => {
      if (cleanedMealData[key] === undefined) {
        console.error(`WARNING: undefined value found in key: ${key}`);
      }
      if (Array.isArray(cleanedMealData[key])) {
        cleanedMealData[key].forEach((item: any, idx: number) => {
          Object.keys(item).forEach((itemKey) => {
            if (item[itemKey] === undefined) {
              console.error(
                `WARNING: undefined value in ${key}[${idx}].${itemKey}`
              );
            }
          });
        });
      }
    });

    // Update the main meal document
    console.log("Updating meal document with ID:", mealData.id);
    const meal = await updateDocument(
      MEALS_COLLECTION,
      mealData.id,
      cleanedMealData
    );
    console.log("Meal document updated successfully");

    // Update ingredient details in subcollection (name and unit)
    if (mealData.ingredients && mealData.ingredients.length > 0) {
      console.log("Starting subcollection update...");
      await updateMealIngredientsSubcollection(
        mealData.id,
        mealData.ingredients
      );
      console.log("Subcollection update completed");
    }

    console.log("=== UPDATE MEAL END ===");
    const enrichedMeals = await enrichMealsWithIngredients([meal]);
    return enrichedMeals[0];
  } catch (error) {
    console.error("=== UPDATE MEAL ERROR ===");
    console.error("Error details:", error);
    throw error;
  }
};

const mealsSlice = createSlice({
  name: MEALS_SLICE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMeals.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(searchMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        state.loading = false;
        const newMeal = action.payload;
        state.meals.push(newMeal);
      })
      .addCase(addMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMeals.fulfilled, (state, action) => {
        state.loading = false;
        const fetchedMeals = action.payload;

        // Only add meals that don't already exist
        const existingIds = new Set(state.meals.map((meal) => meal.id));
        const newMeals = fetchedMeals.filter(
          (meal) => !existingIds.has(meal.id)
        );

        state.meals = [...state.meals, ...newMeals] as Meal[];
        console.log("Meals fetched:", state.meals);
      })
      .addCase(fetchUserMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedMeal = action.payload;
        const index = state.meals.findIndex(
          (meal) => meal.id === updatedMeal.id
        );
        if (index !== -1) {
          state.meals[index] = updatedMeal;
        }
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.loading = false;
        const deletedMealId = action.payload;
        state.meals = state.meals.filter((meal) => meal.id !== deletedMealId);
        state.recentMeals = state.recentMeals.filter(
          (meal) => meal.id !== deletedMealId
        );
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.recentMeals = action.payload as Meal[];
      })
      .addCase(fetchRecentMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mealsSlice.reducer;
