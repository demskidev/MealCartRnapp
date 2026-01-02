import { moderateScale, verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface CustomTextInputProps extends TextInputProps {
  error?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = (props) => (
  <View>
    <TextInput
      style={[styles.input, props.style]}
      placeholderTextColor="#B0B0B0"
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
      {...props}
    />
    {props.error && <Text style={styles.errorMsg}>{props.error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  errorMsg: {
    color: Colors.error,
    fontSize: fontSize(14),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
});

export default CustomTextInput;
