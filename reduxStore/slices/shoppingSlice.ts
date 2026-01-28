// reduxStore/slices/shoppingSlice.ts
import {
  addDocument,
  deleteDocument,
  getDocumentById,
  queryDocuments,
  updateDocument,
} from "@/services/firestore";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ADD_SHOPPING_LIST,
  DELETE_SHOPPING_LIST,
  FETCH_SHOPPING_LIST_BY_ID,
  FETCH_SHOPPING_LISTS,
  SHOPPING_SLICE,
  UPDATE_SHOPPING_LIST,
} from "../actionTypes";
import {
  INGREDIENTS_CATEGORY_COLLECTION,
  MEAL_INGREDIENTS_COLLECTION,
  SHOPPING_LIST_COLLECTION,
} from "../appKeys";

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
      listData,
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


export const fetchShoppingListById = createAsyncThunk(
  FETCH_SHOPPING_LIST_BY_ID,
  async (listId: string, { rejectWithValue }) => {
    try {
      const list = await getDocumentById(SHOPPING_LIST_COLLECTION, listId);
      if (!list) {
        return rejectWithValue("Shopping list not found");
      }
      // Enrich the single list (enrich expects an array)
      const [enrichedList] = await enrichShoppingListsWithDetails([list]);
      return enrichedList;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);



const enrichShoppingListsWithDetails = async (lists: any[]): Promise<any[]> => {
  return Promise.all(
    lists.map(async (list: any) => {
      try {
        return {
          ...list,
          ingredients: await Promise.all(
            list.ingredients?.map(async (ing: any) => {
              let ingredientName = ing.ingredientName;
              let categoryName = ing.categoryName;
              let ingredientUnit = ing.unit; // Use the saved unit from shopping list
              let categoryUnits: string[] = [];

              // Fetch ingredient details from meal's subcollection if mealId and ingredientId exist
              if (ing.mealId && ing.ingredientId) {
                try {
                  const { getSubcollectionDocuments } =
                    await import("@/services/firestore");

                  const ingredientsData = await getSubcollectionDocuments(
                    MEAL_INGREDIENTS_COLLECTION,
                    ing.mealId,
                    "ingredients",
                  );

                  const ingredientDetails: any = ingredientsData.find(
                    (data: any) => data.id === ing.ingredientId,
                  );

                  console.log(
                    `📦 Ingredient from meal subcollection:`,
                    ingredientDetails,
                  );

                  if (ingredientDetails) {
                    // Only fetch the name, preserve the saved unit
                    ingredientName = ingredientDetails.name || ingredientName;
                    // Do NOT override the unit - keep the one saved in shopping list
                    // ingredientUnit is already set from ing.unit above
                  }
                } catch (error) {
                  console.error(
                    `❌ Error fetching ingredient ${ing.ingredientId} from meal ${ing.mealId}:`,
                    error,
                  );
                }
              }

              // Fetch category details if categoryId exists
              if (ing.categoryId) {
                try {
                  const categoryDoc: any = await getDocumentById(
                    INGREDIENTS_CATEGORY_COLLECTION,
                    ing.categoryId,
                  );

                  console.log(
                    `📦 Category doc for ${ing.categoryId}:`,
                    categoryDoc,
                  );

                  categoryName =
                    categoryDoc?.title || categoryDoc?.name || categoryName;

                  // Get category units array
                  if (categoryDoc?.unit && Array.isArray(categoryDoc.unit)) {
                    categoryUnits = categoryDoc.unit;
                  }
                } catch (error) {
                  console.error(
                    `❌ Error fetching category ${ing.categoryId}:`,
                    error,
                  );
                }
              }

              const enrichedIngredient = {
                ...ing,
                ingredientName,
                categoryName,
                unit: ingredientUnit,
                categoryUnits,
              };

              console.log(`✅ Enriched ingredient:`, enrichedIngredient);

              return enrichedIngredient;
            }) || [],
          ),
        };
      } catch (error) {
        console.error(`Error enriching shopping list ${list.id}:`, error);
        return list;
      }
    }),
  );
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
  },
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
  },
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
  },
);

export const fetchUserShoppingLists = createAsyncThunk(
  FETCH_SHOPPING_LISTS,
  async (
    {
      userId,
      limit = 10,
      startAfter = null,
    }: { userId: string; limit?: number; startAfter?: any },
    { rejectWithValue },
  ) => {
    try {
      const options: any = {
        limit,
        // Removed orderBy to avoid composite index requirement
        // To enable ordering, create the index at: Firebase Console > Firestore > Indexes
        // orderBy: "createdAt",
        // orderDirection: "desc",
      };
      if (startAfter) options.startAfter = startAfter;

      const lists = await queryDocuments(
        SHOPPING_LIST_COLLECTION,
        "uid",
        "==",
        userId,
        options,
      );

      console.log("Fetched shopping lists from DB:", lists);

      const enrichedLists = await enrichShoppingListsWithDetails(lists);

      return enrichedLists;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
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
          (list) => list.id === action.payload.id,
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
      })
      // Fetch Shopping Lists
      .addCase(fetchUserShoppingLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserShoppingLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload as ShoppingList[];
      })
      .addCase(fetchUserShoppingLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShoppingLists } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
