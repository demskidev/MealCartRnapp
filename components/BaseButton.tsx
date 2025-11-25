import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/constants";
import { Colors } from "@/constants/theme";
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
  width?: string | number;
  backgroundColor?: string;
  textColor?: string;
  rightChild?: React.ReactNode; // Icon or element rendered on right
  leftChild?: React.ReactNode; // Icon or element rendered on left
  onPress?: () => void;
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
  }: BaseButtonProps) => {
    return (
      <TouchableOpacity style={[styles.container, { width: width || "100%" }]} onPress={onPress}>
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
                  <Stop offset="0.4" stopColor={Colors.olive} />
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
  // Wrapper to provide spacing between button and description
  container: {
    gap: verticalScale(10),
    },

  // Main button layout and styling
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.buttonBackground,
    padding: verticalScale(18),
    borderRadius: moderateScale(8),

    gap: horizontalScale(10),

    shadowColor: Colors.buttonShadow,
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4), 
    // Android shadow 
    elevation: moderateScale(5),
  },

  buttonWrapper: {
    borderRadius: moderateScale(8),
    overflow: "hidden",
  },

  // Optional description text below the button
  description: {
    textAlign: "center",
    color: Colors.secondaryText,
    fontSize: moderateScale(12),
  },

  // Default button text styling
  text: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: moderateScale(16),
  },
});

export default BaseButton;
