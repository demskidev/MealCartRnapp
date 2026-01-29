import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface SpaceBetweenButtonsProps {
  left: React.ReactNode;
  right: React.ReactNode;
  reverse?: boolean;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
}

const SpaceBetweenButtons: React.FC<SpaceBetweenButtonsProps> = ({
  left,
  right,
  reverse = false,
  containerStyle,
  itemStyle,
}) => {
  const children = reverse
    ? [right, left]
    : [left, right];

  return (
    <View style={[styles.row, containerStyle]}>
      {children.map((child, idx) => (
        <View style={[styles.item, itemStyle]} key={idx}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    width: "100%",
  },
  item: {
    flex: 1,
  },
});

export default SpaceBetweenButtons;