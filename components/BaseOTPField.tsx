import {
  horizontalScale,
  moderateScale,
  verticalScale
} from "@/constants/Constants";
import { Colors } from "@/constants/Theme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEvent,
  View,
} from "react-native";
import BaseTextInput from "./BaseTextInput";

interface BaseOTPFieldProps {
  length?: number;
  error?: string;
  value?: string;
  onChange?: (otp: string) => void;
  onBlur?: () => void;
}

const BaseOTPField = React.memo(
  ({ length = 6, onChange, value = "", error, onBlur }: BaseOTPFieldProps) => {
    const [values, setValues] = React.useState<string[]>(
      value ? value.split("").slice(0, length) : Array(length).fill("")
    );

    const inputRefs = React.useRef<Array<TextInput | null>>([]);

    const handleChange = (text: string, index: number) => {
      if (text.length > 1) return; // prevent multi-character flicker

      // Only update if new char typed
      const newValues = [...values];
      newValues[index] = text;
      setValues(newValues);

      // Move to next input
      if (text && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }

      const otpValue = newValues.join("");
      onChange && onChange(otpValue);
    };

    const handleKeyPress = (e: TextInputKeyPressEvent, index: number) => {
      if (
        e.nativeEvent.key === "Backspace" &&
        !values[index] &&
        inputRefs.current[index - 1]
      ) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <View style={styles.mainContainer}>
        <View style={styles.container}>
          {values.map((val, index) => (
            <View key={index} style={styles.inputWrapper}>
              <BaseTextInput
                ref={(r) => {
                  inputRefs.current[index] = r;
                }}
                width={45}
                value={val}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            </View>
          ))}
        </View>
        {error && <Text style={styles.errorMsg}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  mainContainer: {
    gap: verticalScale(10),
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: horizontalScale(20),
  },
  inputWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorMsg: {
    color: Colors.error,
    textAlign: "center",
    fontSize: moderateScale(12),
  },
});

export default BaseOTPField;