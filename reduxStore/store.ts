// store/index.ts
// Redux store setup using Redux Toolkit

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { AUTH_SLICE, LOGOUT, ROOT } from "./actionTypes";
import authReducer from "./slices/authSlice";
import ingredientCategoryReducer from "./slices/ingredientCategorySlice";
import MealReducer from "./slices/mealsSlice";
import profileReducer from "./slices/profileSlice";


const persistConfig = {
  key: ROOT,
  storage: AsyncStorage,
  whitelist: [AUTH_SLICE],
};

const appReducer = combineReducers({
 auth : authReducer,
 ingredientCategory: ingredientCategoryReducer,
 meal : MealReducer,
 profile: profileReducer,
 // home: homeReducer,
});

// Root reducer that resets all state on LOGOUT
const rootReducer = (state: any, action: any) => {
  if (action.type === LOGOUT) {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
