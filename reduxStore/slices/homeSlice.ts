// store/slices/homeSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllDocuments } from '../../services/firestore';

export interface HomeItem {
  id: string;
  [key: string]: any;
}

interface HomeState {
  items: HomeItem[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchHomeItems = createAsyncThunk(
  'home/fetchHomeItems',
  async (collectionName: string, { rejectWithValue }) => {
    try {
      const data = await getAllDocuments(collectionName);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch data');
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchHomeItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default homeSlice.reducer;
