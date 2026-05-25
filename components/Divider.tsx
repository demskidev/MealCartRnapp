import { horizontalScale, verticalScale } from "@/constants/Constants";
import { Strings } from "@/constants/Strings";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface DividerProps {
  style?: ViewStyle;
  showText?: boolean;
}

const Divider = ({ style, showText = true }: DividerProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />

      {showText && <Text style={styles.text}>{Strings.divider_or}</Text>}

      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  line: {
    flex: 1,
    backgroundColor: Colors.divider,
    height: verticalScale(1),
  },
  text: {
    fontSize: fontSize(12),
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    color: Colors.tertiary,
  },
});

export default Divider;
