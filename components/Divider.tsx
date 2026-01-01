import {
  horizontalScale,
  verticalScale
} from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface DividerProps {
  style?: ViewStyle;
}

/**
 * Divider Component
 *
 * A horizontal line with "OR" text in the middle.
 * Commonly used to separate sections in forms, e.g., social login vs email login.
 *
 * Structure:
 *  - Two lines on either side of a centered "OR" text
 *  - Lines stretch to fill remaining horizontal space
 *
 * Usage:
 *  <Divider />
 *  <Divider style={{ gap: 20, marginVertical: 10 }} />
 */
const Divider = ({ style }: DividerProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />

      <Text style={styles.text}>OR</Text>

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
