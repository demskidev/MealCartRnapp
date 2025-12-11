import { Dimensions, Platform, StatusBar } from "react-native";

export const screenFullHeight = Dimensions.get("window").height;
export const screenWidth = Dimensions.get("window").width;
const sampleHeight = 932;
const sampleWidth = 430;

export const isAndroid: boolean = Platform.OS !== "ios";
const iPhoneX: boolean = screenFullHeight === 812 && Platform.OS === "ios";

// StatusBar Height
export const STATUSBAR_HEIGHT: number | undefined =
  Platform.OS === "ios" ? (iPhoneX ? 44 : 22) : StatusBar.currentHeight || 0;

// Adjust screen height for the status bar
export const screenHeight: number =
  Dimensions.get("window").height - (STATUSBAR_HEIGHT || 0);

// Logging flag
export const isShowLog: boolean = true;

// Get Width of Screen
export function getWidth(value: number): number {
  return (value / sampleWidth) * screenWidth;
}

// Get Height of Screen
export function getHeight(value: number): number {
  return (value / sampleHeight) * screenHeight;
}

// Scale based on screen width
const scale = (size: number): number => (screenWidth / sampleWidth) * size;

// Horizontal scale (width-based)
export const horizontalScale = (value: number): number => {
  return (screenWidth / sampleWidth) * value;
};

// Vertical scale (height-based)
export const verticalScale = (value: number): number => {
  return (screenHeight / sampleHeight) * value;
};

// Moderate scale (smooth scaling)
export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (horizontalScale(size) - size) * factor;
}

// Reel Heights based on platform
export const iosReelHeight: number = screenFullHeight - getHeight(100);
export const androidReelHeight: number = screenFullHeight - getHeight(70);
