// reduxStore/slices/shoppingSlice.ts
import { addDocument, deleteDocument, updateDocument } from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    ADD_SHOPPING_LIST,
    DELETE_SHOPPING_LIST,
    SHOPPING_SLICE,
    UPDATE_SHOPPING_LIST,
} from "../actionTypes";
import { SHOPPING_LIST_COLLECTION } from "../appKeys";

export interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  categoryName: string;
  categoryId: string;
  mealName?: string;
  mealId?: string;
  isChecked?: boolean;
}

export interface ShoppingList {
  id: string;
  listName: string;
  shoppingDay: string;
  items: ShoppingListItem[];
  createdAt: Date;
  uid: string;
}

export interface ShoppingListState {
  lists: ShoppingList[];
  loading: boolean;
  error: any;
}

const initialState: ShoppingListState = {
  lists: [],
  loading: false,
  error: null,
};

const addShoppingListToDb = async (listData: any) => {
  try {
    const list = await addDocument(SHOPPING_LIST_COLLECTION, listData);
    return list;
  } catch (error) {
    throw error;
  }
};

const updateShoppingListInDb = async (listData: any) => {
  try {
    const list = await updateDocument(
      SHOPPING_LIST_COLLECTION,
      listData.id,
      listData
    );
    return list;
  } catch (error) {
    throw error;
  }
};

const deleteShoppingListFromDb = async (listId: string) => {
  try {
    await deleteDocument(SHOPPING_LIST_COLLECTION, listId);
  } catch (error) {
    throw error;
  }
};

export const addShoppingList = createAsyncThunk(
  ADD_SHOPPING_LIST,
  async (listData: any, { rejectWithValue }) => {
    try {
      const list = await addShoppingListToDb(listData);
      return list;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateShoppingList = createAsyncThunk(
  UPDATE_SHOPPING_LIST,
  async (listData: any, { rejectWithValue }) => {
    try {
      const list = await updateShoppingListInDb(listData);
      return list;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteShoppingList = createAsyncThunk(
  DELETE_SHOPPING_LIST,
  async (listId: string, { rejectWithValue }) => {
    try {
      await deleteShoppingListFromDb(listId);
      return listId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const shoppingListSlice = createSlice({
  name: SHOPPING_SLICE,
  initialState,
  reducers: {
    clearShoppingLists: (state) => {
      state.lists = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Shopping List
      .addCase(addShoppingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShoppingList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists.push(action.payload as ShoppingList);
      })
      .addCase(addShoppingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Shopping List
      .addCase(updateShoppingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShoppingList.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lists.findIndex(
          (list) => list.id === action.payload.id
        );
        if (index !== -1) {
          state.lists[index] = action.payload as ShoppingList;
        }
      })
      .addCase(updateShoppingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Shopping List
      .addCase(deleteShoppingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = state.lists.filter((list) => list.id !== action.payload);
      })
      .addCase(deleteShoppingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShoppingLists } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
