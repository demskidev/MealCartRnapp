import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

const CustomTextInput: React.FC<TextInputProps> = (props) => (
  <TextInput
    style={[styles.input, props.style]}
    placeholderTextColor="#B0B0B0"
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
});

export default CustomTextInput