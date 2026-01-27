// Shared callback for meal selection between screens
let mealSelectCallback: ((meal: any) => void) | null = null;

export const setMealSelectCallback = (callback: (meal: any) => void) => {
  mealSelectCallback = callback;
};

export const getMealSelectCallback = () => mealSelectCallback;

export const clearMealSelectCallback = () => {
  mealSelectCallback = null;
};
