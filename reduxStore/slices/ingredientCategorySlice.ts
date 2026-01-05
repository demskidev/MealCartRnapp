// reduxStore/slices/ingredientCategorySlice.ts
import { getAllDocuments } from '@/services/firestore';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ING_CAT, INGREDIENT_CATEGORY_SLICE } from '../actionTypes';
import { INGREDIENTS_CATEGORY_COLLECTION } from '../appKeys';

export interface IngredientCategory {
  id: string;
  title: string;
}

interface IngredientCategoryState {
  categories: IngredientCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: IngredientCategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchIngredientCategories = createAsyncThunk(
  ING_CAT,
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching ingredient dd categories...");
      const data = await getAllDocuments(INGREDIENTS_CATEGORY_COLLECTION);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch ingredient categories');
    }
  }
);

const ingredientCategorySlice = createSlice({
  name: INGREDIENT_CATEGORY_SLICE,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredientCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredientCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload as any;
      })
      .addCase(fetchIngredientCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ingredientCategorySlice.reducer;
