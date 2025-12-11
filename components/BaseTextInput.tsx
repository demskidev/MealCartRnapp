import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/constants";
import { Colors } from "@/constants/theme";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEvent,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * BaseTextInput Component
 *
 * A customizable input field that supports:
 *  - Secure text entry (for passwords)
 *  - Optional right-side icon (e.g., eye icon to toggle password visibility)
 *  - Dynamic focus border color and text color
 *  - Custom keyboard types
 *
 * Common use cases:
 *  - Email, phone number, password, general text input
 *
 * Props:
 *  - value: Controlled input value
 *  - onChangeText: Callback for text updates
 *  - placeholder: Placeholder text
 *  - secureTextEntry: Boolean to enable password masking
 *  - rightIcon: Optional icon component rendered on the right
 *  - keyboardType: Keyboard type (email, numeric, default, etc.)
 *  - maxLength: Optional max length of input
 *  - width: Optional width for input container
 *  - errorMsg: Optional error message displayed below input
 */
interface BaseTextInputProps {
  value: string | null;
  maxLength?: number;
  width?: number;
  onChangeText?: (text: string) => void;
  onKeyPress?: (e: TextInputKeyPressEvent) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string;
}

const BaseTextInput = React.memo(
  React.forwardRef<TextInput, BaseTextInputProps>(
    (
      {
        value = "",
        onChangeText,
        placeholder,
        secureTextEntry = false,
        rightIcon,
        keyboardType = "default",
        onKeyPress,
        maxLength,
        width,
        error,
        onBlur,
      },
      ref
    ) => {
      // Local state to toggle password visibility if secureTextEntry is true
      const [showPassword, setShowPassword] = React.useState(secureTextEntry);

      // Track focus state for border/text color change
      const isFocused = React.useRef(false);

      const toggleShowPassword = () => {
        setShowPassword(!showPassword);
      };

      return (
        <View style={styles.mainContainer}>
          {/* Input container with dynamic border color and width */}
          <View
            style={[
              styles.container,
              {
                borderColor: isFocused.current
                  ? Colors.secondaryButtonBackground // Highlight border when focused
                  : Colors.borderColor, // Default border color
                width: width || "100%",
              },
            ]}
          >
            <TextInput
              ref={ref}
              style={[
                styles.textInput,
                {
                  color: isFocused.current ? Colors.text : Colors.secondaryText, // Change text color on focus
                },
              ]}
              value={value ?? ""}
              onChangeText={onChangeText}
              placeholder={placeholder}
              secureTextEntry={showPassword} // Mask text if needed
              keyboardType={keyboardType}
              onFocus={() => (isFocused.current = true)} // Set focus state
              onBlur={() => {
                isFocused.current = false;
                onBlur?.();
              }} // Remove focus state
              onKeyPress={onKeyPress}
              maxLength={maxLength}
            />

            {/* Optional right-side icon (e.g., eye icon) */}
            {rightIcon && (
              <TouchableOpacity
                style={styles.rightIcon}
                onPress={toggleShowPassword} // Toggle password visibility
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>

          {/* Display error message if provided */}
          {error && <Text style={styles.errorMsg}>{error}</Text>}
        </View>
      );
    }
  )
);

const styles = StyleSheet.create({
  mainContainer: {
    gap: verticalScale(6), // Space between input and error text
  },

  // Wrapper for TextInput and optional right icon
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    padding: Platform.select({
      ios: verticalScale(18),
      android: verticalScale(10),
    }),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(8),
    gap: horizontalScale(10),
  },

  textInput: {
    flex: 1,
    fontSize: moderateScale(16),
  },

  // Right icon container
  rightIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
    justifyContent: "center",
    alignItems: "center",
  },

  errorMsg: {
    color: Colors.error,
    fontSize: moderateScale(12),
  },
});

export default BaseTextInput;
