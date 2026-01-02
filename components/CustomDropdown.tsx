import { moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomDropdownProps {
  value: string;
  options: [];
  onSelect: (option: string) => void;
  icon?: any;
}
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onSelect,
  icon,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: any) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{value?.title ?? value}</Text>

        {icon && (
          <Image
            source={icon}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      {open && (
        <View style={styles.optionContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option?.id ?? option}
              style={styles.option}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.optionText}>{option?.title ?? option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors._F6F6F6,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginBottom: verticalScale(8),
    justifyContent: 'space-between',
  },
  text: { fontSize: moderateScale(12), color: Colors.tertiary, fontFamily: FontFamilies.ROBOTO_REGULAR },
  icon: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  optionContainer: {
    marginTop: verticalScale(6),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    borderRadius: moderateScale(8),
    backgroundColor: Colors.background,
    overflow: "hidden",
  },

  option: {
    padding: moderateScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: Colors.borderColor,
  },

  optionText: {
    fontSize: moderateScale(12),
  },
});

export default CustomDropdown;