import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
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
  textAlign?: "auto" | "left" | "right" | "center" | "justify";
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
        textAlign = "left",
      },
      ref
    ) => {
      const [showPassword, setShowPassword] = React.useState(secureTextEntry);

      const isFocused = React.useRef(false);

      const toggleShowPassword = () => {
        setShowPassword(!showPassword);
      };

      return (
        <View style={styles.mainContainer}>
          <View
            style={[
              styles.container,
              {
                borderColor: isFocused.current
                  ? Colors.secondaryButtonBackground
                  : Colors.borderColor,
                width: width || "100%",
              },
            ]}
          >
            <TextInput
              ref={ref}
              style={[
                styles.textInput,
                { textAlign },
              ]}
              value={value ?? ""}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={Colors.tertiary}
              secureTextEntry={showPassword}
              keyboardType={keyboardType}
              onFocus={() => (isFocused.current = true)}
              onBlur={() => {
                isFocused.current = false;
                onBlur?.();
              }}
              onKeyPress={onKeyPress}
              maxLength={maxLength}
            />

            {rightIcon && (
              <TouchableOpacity
                style={styles.rightIcon}
                onPress={toggleShowPassword}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>

          {error && <Text style={styles.errorMsg}>{error}</Text>}
        </View>
      );
    }
  )
);

const styles = StyleSheet.create({
  mainContainer: {
    gap: verticalScale(6),
  },

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    padding: Platform.select({
      ios: verticalScale(16),
      android: verticalScale(3),
    }),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(5),
    gap: horizontalScale(10),
  },

  textInput: {
    flex: 1,
    fontSize: fontSize(14),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },

  rightIcon: {
    width: horizontalScale(24),
    height: verticalScale(24),
    justifyContent: "center",
    alignItems: "center",
  },

  errorMsg: {
    color: Colors.error,
    fontSize: fontSize(14),
    fontFamily: FontFamilies.ROBOTO_REGULAR
  },
});

export default BaseTextInput;
