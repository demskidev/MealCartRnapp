// reduxStore/appKeys.ts
// Firestore collection keys for consistency

export const USERS_COLLECTION = 'users';
export const INGREDIENTS_CATEGORY_COLLECTION = 'ingredientCategory';
export const MEAL_INGREDIENTS_COLLECTION = 'mealIngredients';
export const INGREDIENTS_COLLECTION = 'ingredients';
export const MEALS_COLLECTION = 'meals';
// Sentinel uid assigned to global meals so they never match a real user's
// "my meals" query (uid == userId), while still living in MEALS_COLLECTION.
export const GLOBAL_MEALS_UID = 'global';
export const IS_GLOBAL_KEY = 'isGlobal';
export const PLANS_COLLECTION = 'plans';
export const LISTS_COLLECTION = 'lists';
export const DIETARY_PREFERENCES_COLLECTION = 'dietryPreferences';
export const MEAL_PLAN_COLLECTION = 'mealPlan';
export const SHOPPING_LIST_COLLECTION = 'shoppingList';

// Add more collection keys as needed


export const MEAL_IMAGE_FOLDER = 'mealImages/';
export const USER_IMAGE_FOLDER = 'userImages/';


export const HTTPPREFIX = 'http://';

// Field keys for forms
export const EMAIL_KEY = 'email';
export const NAME_KEY = 'name';
export const ZIP_KEY = 'zip';
export const DESCRIPTION_KEY = 'description';
export const PASSWORD_KEY = 'password';
export const CONFIRM_PASSWORD_KEY = 'confirmPassword';
export const INGREDIENTS_KEY = 'ingredients';
export const STEPS_KEY = 'steps';
export const IMAGEURL_KEY = 'imageUrl';
export const CATEGORY_KEY = 'category';
export const PREPTIME_KEY = 'prepTime';
export const SERVINGS_KEY = 'servings';
export const DIFFICULTY_KEY = 'difficulty';
export const DIETARY_PREFERENCES_KEY = 'dietaryPreferences';

export enum MealStatus{
    CREATED = "created",
    STARTED = "started",
    RESUMED = "resumed",
    PAUSED = "paused",
    COMPLETED = "completed"
}

export enum SocialLoginProvider{
    GOOGLE = "google",
    APPLE = "apple"
}


//prop keys
export const CREATE_MEAL_PLAN = "createMealPlan"
export const SHOPPING_LIST = "shoppingList"







