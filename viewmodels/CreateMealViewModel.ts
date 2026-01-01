// viewmodels/CreateMealViewModel.ts
import { MEALS_COLLECTION } from '@/reduxStore/appKeys';
import { useAppDispatch, useAppSelector } from '@/reduxStore/hooks';
import { fetchIngredientCategories } from '@/reduxStore/slices/ingredientCategorySlice';
import { addDocument, uploadImageToFirebase } from '@/services/firestore';
import { useEffect } from 'react';



export const useCreateMealViewModel = () => {
  const dispatch = useAppDispatch();
  const ingredientCategories = useAppSelector(state => state.ingredientCategory.categories);
  const ingredientLoading = useAppSelector(state => state.ingredientCategory.loading);
  const ingredientError = useAppSelector(state => state.ingredientCategory.error);


 useEffect(() => {
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = () => {
     
    dispatch(fetchIngredientCategories());
  };


  const addMealToDb = async (mealData: any) => {  
    try {
      const meal = await addDocument(MEALS_COLLECTION, mealData);
      return meal;  
    } catch (error) {
      throw error;
    }
  }

  const addMealImage = async (mealData: string) => {
    // Implement image upload logic here, returning the image URL
    // For example, you might use Firebase Storage or another service
    const imageUri = await uploadImageToFirebase(mealData?.imageUrl, MEALS_COLLECTION);
    mealData.imageUrl = imageUri;
    addMealToDb(mealData);
    
  }


  const addMeal = async (mealData: any) => {
   
    try
    {
      // if(!mealData?.imageUrl.toString().startsWith('http')){
      //   await addMealImage(mealData);
    
      // } else {
       await addMealToDb(mealData);
    // }
    }
    catch (error) {
      throw error;
    }
  };


  

  return {
    
    fetchCategories,
    ingredientCategories,
    ingredientLoading,
    ingredientError,
    addMeal,
  };
};
