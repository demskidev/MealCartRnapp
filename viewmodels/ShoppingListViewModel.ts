// viewmodels/ShoppingListViewModel.ts
import { useAppDispatch, useAppSelector } from "@/reduxStore/hooks";
import {
    addShoppingList,
    deleteShoppingList,
    updateShoppingList,
} from "@/reduxStore/slices/shoppingSlice";

export const useShoppingListViewModel = () => {
  const dispatch = useAppDispatch();
  const shoppingLists = useAppSelector((state) => state.shopping.lists);
  const loading = useAppSelector((state) => state.shopping.loading);
  const error = useAppSelector((state) => state.shopping.error);

  const addShoppingListData = async (
    listData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(addShoppingList(listData));
    if (addShoppingList.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const updateShoppingListData = async (
    listData: any,
    onSuccess?: (payload: any) => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(updateShoppingList(listData));
    if (updateShoppingList.fulfilled.match(resultAction)) {
      onSuccess?.(resultAction.payload);
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  const deleteShoppingListData = async (
    listId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const resultAction = await dispatch(deleteShoppingList(listId));
    if (deleteShoppingList.fulfilled.match(resultAction)) {
      onSuccess?.();
    } else {
      onError?.(resultAction.payload as string);
    }
  };

  return {
    shoppingLists,
    loading,
    error,
    addShoppingListData,
    updateShoppingListData,
    deleteShoppingListData,
  };
};
