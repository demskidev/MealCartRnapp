
import { IconDown, IconUp } from '@/assets/svg/IconUpDown';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CustomStepperProps {
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  showUp?: boolean;
  showDown?: boolean;
   containerStyle?: StyleProp<ViewStyle>;
}

const CustomStepper: React.FC<CustomStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  showUp = true,
  showDown = true,
  containerStyle,
}) => (
  <View style={[styles.container, containerStyle]}>
    <View style={{ flex: 1 }}>
      <Text style={styles.value}>{value}</Text>
    </View>

    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      {showUp && (
        <TouchableOpacity
          onPress={onIncrement}
          style={styles.iconBtn}
         
        >
          <IconUp style={styles.iconUp} />
        </TouchableOpacity>
      )}

      {showDown && (
        <TouchableOpacity
          onPress={onDecrement}
          style={styles.iconBtn}
         
        >
          <IconDown style={styles.iconDown} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: moderateScale(8),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(8),
    height: moderateScale(42),
  },
  iconBtn: {
    padding: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: moderateScale(12),
    color: Colors.tertiary,
    marginLeft: moderateScale(8),
    fontFamily: FontFamilies.ROBOTO_REGULAR
  },
  iconUp: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  iconDown: {
    width: moderateScale(20),
    height: moderateScale(20),
  }
});

export default CustomStepper;