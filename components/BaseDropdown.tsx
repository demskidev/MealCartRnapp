import { moderateScale, verticalScale } from '@/constants/constants';
import { Colors } from '@/constants/theme';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

export interface DropdownOption {
  key: string;
  value: string;
}

interface BaseDropdownProps {
  label?: string;
  placeholder?: string;
  data: DropdownOption[];
  value: string | null;
  onSelect: (value: string) => void;
  error?: string;
  editable?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const BaseDropdown: React.FC<BaseDropdownProps> = ({
  label,
  placeholder = 'Select an option',
  data,
  value,
  onSelect,
  error,
  editable = true,
  containerStyle,
  labelStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, labelStyle]}>{label}</Text>
        </View>
      )}
      <SelectList
        setSelected={onSelect}
        data={data}
        save="key"
        placeholder={placeholder}
        search={true}
        boxStyles={styles.selectBox}
        inputStyles={styles.selectInput}
        dropdownStyles={styles.dropdown}
        dropdownItemStyles={styles.dropdownItem}
        dropdownTextStyles={styles.dropdownText}
      />
      {error && <Text style={styles.errorContainer}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  labelContainer: {
    marginBottom: verticalScale(8),
  },
  labelText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.black,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.white,
  } as any,
  selectBoxError: {
    borderColor: '#E53935',
  },
  selectBoxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  selectInput: {
    fontSize: moderateScale(14),
    color: Colors.black,
  } as any,
  dropdown: {
    borderColor: Colors.lightGray,
    borderWidth: 1,
    marginTop: verticalScale(8),
    borderRadius: moderateScale(8),
  } as any,
  dropdownItem: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: moderateScale(14),
    color: Colors.black,
  },
  errorContainer: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    color: '#E53935',
  },
});

export default BaseDropdown;
