import {
  addDocument,
  deleteDocument,
  queryDocuments,
  updateDocument,
  uploadImageToFirebase,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ADD_MEAL,
  DELETE_MEAL,
  FETCH_MEALS,
  MEALS_SLICE,
  UPDATE_MEAL,
} from "../actionTypes";
import { MEAL_IMAGE_FOLDER, MEALS_COLLECTION } from "../appKeys";

interface MealsState {
  meals: any[];
  loading: boolean;
  error: any;
}

const initialState: MealsState = {
  meals: [],
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
      //  if(mealData?.imageUrl && !mealData?.imageUrl?.toString().startsWith(HTTPPREFIX)){
      //   const meal =  await addMealImage(mealData);
      //   return meal;

      //   } else {
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
  async (userId: string, { rejectWithValue }) => {
    try {
      const meals = await queryDocuments(MEALS_COLLECTION, "uid", "==", userId);
      console.log("Fetched meals from DB:", meals);
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
        state.meals = action.payload;
        console.log("Meals fetched:", action.payload);
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
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mealsSlice.reducer;
