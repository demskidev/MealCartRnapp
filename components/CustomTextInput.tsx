import { moderateScale, verticalScale } from '@/constants/Constants';
import { Colors } from '@/constants/Theme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

const CustomTextInput: React.FC<TextInputProps> = (props) => (
  <TextInput
    style={[styles.input, props.style]}
    placeholderTextColor="#B0B0B0"
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor:Colors.greysoft,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
});

export default CustomTextInput