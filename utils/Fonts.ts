import { moderateScale } from '@/constants/Constants';
import * as Font from 'expo-font';

/**
 * Font enumeration for type-safe font usage throughout the app
 */
export enum FontFamily {
  ROBOTO_REGULAR = 'Roboto-Regular',
  ROBOTO_MEDIUM = 'Roboto-Medium',
  ROBOTO_SEMI_BOLD = 'Roboto-SemiBold',
  ROBOTO_BLACK = 'Roboto-Black',
  ROBOTO_LIGHTWEIGHT = 'Roboto-Light',
}


/**
 * Scale a font size using moderateScale
 * @param size - Font size in pixels
 * @returns Scaled font size
 * 
 * Usage: fontSize: scaleFontSize(16)
 */
export const fontSize = (size: number): number => {
  return moderateScale(size);
};

/**
 * Font loading configuration
 */
const FONTS_TO_LOAD = {
  [FontFamily.ROBOTO_REGULAR]: require('@/assets/fonts/Roboto-Regular.ttf'),
  [FontFamily.ROBOTO_MEDIUM]: require('@/assets/fonts/Roboto-Medium.ttf'),
  [FontFamily.ROBOTO_SEMI_BOLD]: require('@/assets/fonts/Roboto-SemiBold.ttf'),
  [FontFamily.ROBOTO_BLACK]: require('@/assets/fonts/Roboto-Black.ttf'),
};

let fontsLoaded = false;

/**
 * Load all custom fonts
 * @throws {Error} If font loading fails
 * @returns Promise that resolves when all fonts are loaded
 */
export const loadCustomFonts = async (): Promise<void> => {
  try {
    if (fontsLoaded) {
      return; // Already loaded
    }

    await Font.loadAsync(FONTS_TO_LOAD);
    fontsLoaded = true;
  } catch (error) {
    console.error('Failed to load fonts:', error);
    throw new Error('Font loading failed');
  }
};

/**
 * Check if fonts are loaded
 */
export const areFontsLoaded = (): boolean => {
  return fontsLoaded;
};

/**
 * Reset font loading state (useful for testing)
 */
export const resetFontState = (): void => {
  fontsLoaded = false;
};

/**
 * Get font object for styling
 * Usage: fontFamily: getFontFamily(FontFamily.ROBOTO_MEDIUM)
 */
export const getFontFamily = (font: FontFamily): string => {
  return font;
};

/**
 * Get combined font style object
 * Usage: ...getTextStyle(FontFamily.ROBOTO_MEDIUM, FontSize.LARGE)
 */
export const getTextStyle = (
  fontFamily: FontFamily = FontFamily.ROBOTO_REGULAR,
) => {
  return {
    fontFamily,
  };
};

