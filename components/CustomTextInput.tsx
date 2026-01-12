import { moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { fontSize } from '@/utils/Fonts';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  error?: string | boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ error, style, ...props }) => (
  <View style={styles.container}>
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        style
      ]}
      placeholderTextColor={Colors._B0B0B0}
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
      {...props}
    />
    {error && typeof error === 'string' && (
      <Text style={styles.errorText}>{error}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: Colors.greysoft,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    fontSize: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: moderateScale(1),
  },
  errorText: {
    fontSize: fontSize(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.error,
    marginTop: verticalScale(-6),
    marginBottom: verticalScale(8),
  },
});

export default CustomTextInput