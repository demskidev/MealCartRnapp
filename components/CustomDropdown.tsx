import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CustomDropdownProps {
  value: string;
  options: string[];
  onSelect: (option: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onSelect }) => {
  // For demo, just show value and a down arrow
  return (
    <TouchableOpacity style={styles.dropdown}>
      <Text style={styles.text}>{value}</Text>
      <Text style={styles.arrow}>▼</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  text: { fontSize: 14, color: '#222' },
  arrow: { fontSize: 16, color: '#888', marginLeft: 8 },
});

export default CustomDropdown;