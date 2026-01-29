import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ThemeNormalButtonProps {
  title: string;
  description?: string;
  width?: number | "100%";
  backgroundColor?: string;
  textColor?: string;
  rightChild?: React.ReactNode;
  leftChild?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  showPressedShadow?: boolean;
  showElevation?: boolean; // <-- Add this prop
}

const ThemeNormalButton: React.FC<ThemeNormalButtonProps> = ({
  title,
  description,
  width,
  backgroundColor,
  textColor,
  leftChild,
  rightChild,
  onPress,
  disabled,
  containerStyle,
  textStyle,
  showPressedShadow,
  showElevation = true, 
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      {
        backgroundColor: backgroundColor || Colors.white,
        opacity: disabled ? 0.5 : 1,
      },
      containerStyle,
      showPressedShadow && styles.pressedBorder,
      !showElevation && styles.noElevation, // <-- Conditionally remove elevation
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {leftChild}
    <Text
      style={[styles.text, { color: textColor || Colors.primary }, textStyle]}
    >
      {title}
    </Text>
    {rightChild}
    {description && <Text style={styles.description}>{description}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: moderateScale(6),
    borderRadius: moderateScale(10),
    gap: horizontalScale(10),
    minHeight: verticalScale(50),
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  noElevation: {
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
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
    fontSize: fontSize(16),
  },
  pressedBorder: {
    borderColor: Colors.borderColor,
    borderWidth: moderateScale(1),
  },
});

export default ThemeNormalButton;
