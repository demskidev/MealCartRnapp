/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  text: "#08120F",
  secondaryText: '#696F77',
  background: '#fff',
  buttonBackground: "#F8FAFC",
  borderColor: "#DBE0D7",
  secondaryButtonBackground: "#9DAF89",
  white: "#FFFFFF",
  black: "#000000",
  divider:"#E6F0DF",
  olive: "#667D4C",
  buttonShadow:"#073B2A33",
  error:'#ED1717',
  primary: "#9DAF89",
  lightGray: "#F5F5F5",
};

export const Fonts = Platform.select({
  ios: {
    /** System fonts with variants for iOS */
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
    /** Roboto weights if available via custom font */
    robotoRegular: "Roboto-Regular",
    robotoMedium: "Roboto-Medium",
    robotoSemiBold: "Roboto-SemiBold",
    robotoBlack: "Roboto-Black",
  },
  default: {
    /** Android & default system fonts */
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
    robotoRegular: "Roboto-Regular",
    robotoMedium: "Roboto-Medium",
    robotoSemiBold: "Roboto-SemiBold",
    robotoBlack: "Roboto-Black",
  },
  web: {
    /** Web system fonts with Roboto weights included */
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    robotoRegular: "'Roboto', sans-serif",
    robotoMedium: "'Roboto Medium', sans-serif",
    robotoSemiBold: "'Roboto SemiBold', sans-serif",
    robotoBlack: "'Roboto Black', sans-serif",
  },
});