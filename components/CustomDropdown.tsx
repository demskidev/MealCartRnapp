import { moderateScale, verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CustomDropdownProps {
  value: any;
  options: any[];
  onSelect: (option: any) => void;
  icon?: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    <View style={open ? styles.wrapperOpen : undefined}>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={styles.text} numberOfLines={1}>
          {value?.title ?? value}
        </Text>

        {icon &&
          React.createElement(icon, {
            width: moderateScale(20),
            height: moderateScale(20),
            style: styles.icon,
          })}
      </TouchableOpacity>

      {open && (
        <>
          {/* Full-screen backdrop so tapping outside closes the dropdown. */}
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperOpen: {
    zIndex: 10,
    elevation: 10,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors._F6F6F6,
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginBottom: verticalScale(8),
    justifyContent: "space-between",
  },
  text: {
    flex: 1,
    marginRight: moderateScale(6),
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
  },
  icon: {
    width: moderateScale(20),
    height: moderateScale(20),
    flexShrink: 0,
  },
  backdrop: {
    position: "absolute",
    top: -SCREEN_HEIGHT,
    bottom: -SCREEN_HEIGHT,
    left: -SCREEN_WIDTH,
    right: -SCREEN_WIDTH,
  },

  optionContainer: {
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
