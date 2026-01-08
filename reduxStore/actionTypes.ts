// store/actionTypes.ts
// Action type and key constants for Redux

export const AUTH_SLICE = 'auth';
export const HOME_SLICE = 'home';
export const MEALS_SLICE = 'meals';
export const INGREDIENT_CATEGORY_SLICE = 'ingredientCategory';
export const PROFILE_SLICE = 'profile';
export const LOGOUT = 'LOGOUT';
export const ROOT = 'root';
export const LOGIN = 'auth/login';
export const REGISTER = 'auth/register';
export const ING_CAT = 'ingredientCategory/fetchAll'
export const ADD_MEAL = 'meals/addMeal';
export const UPDATE_MEAL = 'meals/updateMeal';
export const DELETE_MEAL = 'meals/deleteMeal';
export const FETCH_MEALS = 'meals/fetchMeals';
export const UPDATE_USER = 'auth/updateUser';
export const FETCH_DIETARY_PREFERENCES = 'dietaryPreferences/fetchAll';
export const ADD_MEAL_PLAN = 'profile/addMealPlan';
export const DELETE_MEAL_PLAN = 'profile/deleteMealPlan';
export const UPDATE_MEAL_PLANS_BATCH = 'profile/updateMealPlansBatch';
export const FETCH_MEAL_PLANS = 'profile/fetchMealPlans';
export const ADD_PLAN = "plans/addPlan";
export const UPDATE_PLAN = "plans/updatePlan";
export const DELETE_PLAN = "plans/deletePlan";
export const FETCH_PLANS = "plans/fetchPlans";
export const CHANGE_PASSWORD = 'auth/changePassword';
export const FETCH_ACTIVE_PLAN = "plans/fetchActivePlan";
export const FETCH_MEAL_WITH_INGREDIENTS = "meals/fetchMealWithIngredients";
export const FILTER_N_SEARCH_MEALS = "meals/searchMeals";
export const FETCH_RECENT_MEALS = "meals/fetchRecentMeals";

