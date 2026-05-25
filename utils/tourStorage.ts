import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_COMPLETED_KEY = '@mealcart_tour_completed';

export const tourStorage = {
  async hasCompletedTour(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(TOUR_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      return false;
    }
  },

  async setTourCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    } catch (error) {
    }
  },

  async resetTour(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOUR_COMPLETED_KEY);
    } catch (error) {
    }
  },
};