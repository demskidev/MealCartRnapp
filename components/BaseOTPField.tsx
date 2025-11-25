import {
    horizontalScale,
    moderateScale,
    verticalScale,
} from "@/constants/constants";
import { Colors } from "@/constants/theme";
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
  errorMsg?: string;
  onChange?: (otp: string) => void;
}

const BaseOTPField = React.memo(
  ({ length = 6, onChange, errorMsg }: BaseOTPFieldProps) => {
    const [values, setValues] = React.useState<string[]>(
      Array(length).fill("")
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

      onChange && onChange(newValues.join(""));
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
            <BaseTextInput
              key={index}
              ref={(r) => {
                inputRefs.current[index] = r;
              }}
              width={horizontalScale(50)}
              value={val}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  mainContainer: {
    gap: verticalScale(8),
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  errorMsg: {
    color: Colors.error,
    textAlign: "center",
    fontSize: moderateScale(12),
  },
});

export default BaseOTPField;
