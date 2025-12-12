import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  // NEW — gradient colors
  gradientStartColor?: string;
  gradientEndColor?: string;

  // optional gradient direction
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };

  width?: number | "100%";
  backgroundColor?: string;
  textColor?: string;
  rightChild?: React.ReactNode;
  leftChild?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}


const BaseButton = React.memo(
  ({
    title,
    description,
    width,
    gradientButton = false,
    gradientStartColor,
    gradientEndColor,
    gradientStart,
    gradientEnd,
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
          {/* Render gradient if gradientButton is true */}
          {gradientButton ? (
            <LinearGradient
              colors={[
                gradientStartColor || Colors.olive,
                gradientEndColor || Colors.secondaryButtonBackground,
              ]}
              start={gradientStart || { x: 0, y: 0 }}
              end={gradientEnd || { x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity
                onPress={onPress}
                style={[styles.button, { backgroundColor: 'transparent' }]}
                disabled={disabled}
              >
                {leftChild && leftChild}
                <Text style={[styles.text, textColor && { color: textColor }]}> {title} </Text>
                {rightChild && rightChild}
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              onPress={onPress}
              style={[
                styles.button,
                backgroundColor && { backgroundColor },
              ]}
              disabled={disabled}
            >
              {leftChild && leftChild}
              <Text style={[styles.text, textColor && { color: textColor }]}> {title} </Text>
              {rightChild && rightChild}
            </TouchableOpacity>
          )}
          
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
  gradientButton: {

        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 5000,
    },
});

export default BaseButton;
