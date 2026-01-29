import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ThemeGradientButtonProps {
  title: string;
  description?: string;
  width?: number | "100%";
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  rightChild?: React.ReactNode;
  leftChild?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  showPressedShadow?: boolean;
  buttonGradient?: any;
}

const ThemeGradientButton: React.FC<ThemeGradientButtonProps> = ({
  title,
  description,
  width,
  gradientStartColor,
  gradientEndColor,
  gradientStart,
  gradientEnd,
  leftChild,
  rightChild,
  onPress,
  disabled,
  containerStyle,
  textStyle,
  showPressedShadow,
  buttonGradient,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.gradientButton,
      containerStyle,

      buttonGradient,
      showPressedShadow && styles.pressedBorder,
    ]}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[
        gradientStartColor || Colors.olive,
        gradientEndColor || Colors.secondaryButtonBackground,
      ]}
      start={gradientStart || { x: 0, y: 0 }}
      end={gradientEnd || { x: 1, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.button}>
      {leftChild}
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {rightChild}
    </View>
    {description && <Text style={styles.description}>{description}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradientButton: {
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 5000,
    minHeight: verticalScale(50),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
    width: "100%", // <-- Add this line
    flex: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(6),
    borderRadius: moderateScale(4),
    gap: horizontalScale(10),
    minHeight: verticalScale(50),
    width: "100%", // <-- Add this line
    flex: 1, //
  },
  description: {
    textAlign: "center",
    color: Colors.tertiary,
    fontSize: moderateScale(12),
  },
  text: {
    letterSpacing: fontSize(0.5),
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_MEDIUM,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: fontSize(14),
  },
  pressedBorder: {
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
  },
});

export default ThemeGradientButton;
