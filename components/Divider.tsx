import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "@/constants/constants";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

/**
 * Divider Component
 *
 * A horizontal line with "OR" text in the middle.
 * Commonly used to separate sections in forms, e.g., social login vs email login.
 *
 * Structure:
 *  - Two lines on either side of a centered "OR" text
 *  - Lines stretch to fill remaining horizontal space
 */
const Divider = () => {
  return (
    <View style={styles.container}>
      {/* Left horizontal line */}
      <View style={styles.line} />

      {/* Center text */}
      <Text style={styles.text}>OR</Text>

      {/* Right horizontal line */}
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
    fontSize: moderateScale(16),
    color: Colors.secondaryText,
  },
});

export default Divider;
