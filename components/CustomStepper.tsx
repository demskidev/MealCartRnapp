
import { IconDown, IconUp } from '@/assets/svg/IconUpDown';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomStepperProps {
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  showUp?: boolean;
  showDown?: boolean;
}

const CustomStepper: React.FC<CustomStepperProps> = ({ value, onIncrement, onDecrement, showUp = true, showDown = true }) => (
  <View style={styles.container}>
    <View style={{ flex: 1 }}>
      <Text style={styles.value}>{value}</Text>
    </View>
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      {showUp && (
        <TouchableOpacity onPress={onIncrement} style={styles.iconBtn}>
          <IconUp width={16} height={16} />
        </TouchableOpacity>
      )}
      {showDown && (
        <TouchableOpacity onPress={onDecrement} style={styles.iconBtn}>
          <IconDown width={16} height={16} />
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    paddingHorizontal: 8,
    height: 48,
  },
  iconBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    color: '#6B6B6B',
    marginLeft: 8,
  },
});

export default CustomStepper;