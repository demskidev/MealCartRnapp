// Combined search and filter meals

import {
  addDocument,
  compoundQueryDocuments,
  deleteDocument,
  queryDocuments,
  updateDocument,
  uploadImageToFirebase,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import {
  ADD_MEAL,
  DELETE_MEAL,
  FETCH_MEALS,
  MEALS_SLICE,
  UPDATE_MEAL,
} from "../actionTypes";
import { MEAL_IMAGE_FOLDER, MEALS_COLLECTION } from "../appKeys";

export interface MealIngredient {
  name: string;
  unit: string;
  category?: string;
  count?: string;
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

const updateMealInDb = async (mealData: any) => {
  try {
    const meal = await updateDocument(MEALS_COLLECTION, mealData.id, mealData);
    return meal;
  } catch (error) {
    throw error;
  }
};

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
      return meals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchRecentMeals = createAsyncThunk(
  "meals/fetchRecentMeals",
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
        orderBy: "lastViewedAt", // <-- order by lastViewedAt
        orderDirection: "desc",
      };
      if (startAfter) options.startAfter = startAfter;

      // Compound query: userId and lastViewedAt >= twoDaysAgo (optional)
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
      return meals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const searchMeals = createAsyncThunk(
  "meals/searchMeals",
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
      // Prep time filter (client-side, as Firestore can't do range on string)
      // We'll filter after fetching
      if (searchText && searchText.trim()) {
        // For prefix search, assuming you have a nameCharacters array in each meal
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
      // Prep time filter (client-side)
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
      return meals;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

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
