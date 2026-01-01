import { addDocument, uploadImageToFirebase } from '@/services/firestore';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ADD_MEAL, MEALS_SLICE } from '../actionTypes';
import { MEAL_IMAGE_FOLDER, MEALS_COLLECTION } from '../appKeys';


 const addMealToDb = async (mealData: any) => {  
    try {
      const meal = await addDocument(MEALS_COLLECTION, mealData);
      return meal;  
    } catch (error) {
      throw error;
    }
  }

  const addMealImage = async (mealData: any) => {
    
    try{
    const imageUri = await uploadImageToFirebase(mealData?.imageUrl, MEAL_IMAGE_FOLDER+Date.now().toString());
    mealData.imageUrl = imageUri;
  const meal = await addMealToDb(mealData);
    return meal;
    }
    catch(error){
      throw error;
    }
    
  }



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

const mealsSlice = createSlice({
  name: MEALS_SLICE,
  initialState: {
   
    loading: false,
    error: null as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        state.loading = false;
       
      })
      .addCase(addMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mealsSlice.reducer;
