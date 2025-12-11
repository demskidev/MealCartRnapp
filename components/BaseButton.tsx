import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/**
 * BaseButton Component
 *
 * A highly reusable and customizable button component.
 * It supports:
 *  - Title text
 *  - Optional description text below the button
 *  - Optional left & right child components (icons, loaders, etc.)
 *  - Customizable background and text colors
 *
 * Common use cases:
 *  - Primary / secondary buttons
 *  - Buttons with icons
 *  - Buttons with small helper description underneath
 */
interface BaseButtonProps {
  title: string;
  description?: string;
  gradientButton?: boolean;
  width?: number | "100%";
  backgroundColor?: string;
  textColor?: string;
  rightChild?: React.ReactNode; // Icon or element rendered on right
  leftChild?: React.ReactNode; // Icon or element rendered on left
  onPress?: () => void;
  disabled?: boolean;
}

const BaseButton = React.memo(
  ({
    title,
    description,
    width,
    gradientButton = false,
    backgroundColor,
    textColor,
    leftChild,
    rightChild,
    onPress,
    disabled = false,
  }: BaseButtonProps) => {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          { width: width || "100%", opacity: disabled ? 0.5 : 1 },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {/* Main Pressable Button */}
        <View style={styles.buttonWrapper}>
          {/* Render gradient if backgroundColor not provided */}
          {gradientButton && (
            <Svg
              width="100%"
              height="100%"
              style={StyleSheet.absoluteFill} // Fill entire button
            >
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0." stopColor={Colors.olive} />
                  <Stop
                    offset="1"
                    stopColor={Colors.secondaryButtonBackground}
                  />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx={moderateScale(8)}
                fill="url(#grad)"
              />
            </Svg>
          )}

          {/* Touchable content */}
          <TouchableOpacity
            onPress={onPress}
            style={[
              styles.button,
              gradientButton
                ? { backgroundColor: "transparent" }
                : backgroundColor && { backgroundColor },
            ]}
          >
            {/* Optional left component (usually an icon) */}
            {leftChild && leftChild}

            {/* Button title text */}
            <Text style={[styles.text, textColor && { color: textColor }]}>
              {title}
            </Text>

            {/* Optional right component (icon, arrow, loader, etc.) */}
            {rightChild && rightChild}
          </TouchableOpacity>
        </View>

        {/* Optional description below button */}
        {description && <Text style={styles.description}>{description}</Text>}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    gap: verticalScale(10),
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.buttonBackground,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderRadius: moderateScale(8),
    gap: horizontalScale(10),
  },

  buttonWrapper: {
    borderRadius: moderateScale(8),
    overflow: "hidden",
    boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.15)",
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
    fontSize: fontSize(16),
  },
});

export default BaseButton;
