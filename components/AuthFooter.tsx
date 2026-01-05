import { horizontalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * AuthFooter Component
 *
 * Displays a small text followed by an actionable text button.
 * Commonly used at the bottom of Login / Signup screens such as:
 *   "Don't have an account? Sign Up"
 *
 * Props:
 *  - title: Left text (non-clickable)
 *  - buttonText: Right text (clickable)
 *  - onPressButton: Callback when the action text is pressed
 */
interface AuthFooterProps {
  title: string;
  buttonText: string;
  onPressButton?: () => void;
}

const AuthFooter = ({
  title,
  buttonText,
  onPressButton,
}: AuthFooterProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity onPress={onPressButton}>
        <Text style={[styles.buttonText, styles.title]}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(4),
  },

  title: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    color: Colors.tertiary,
    fontSize: fontSize(13),
  },

  buttonText: {
    textDecorationLine: "underline",
  },

  text: {},
});

export default AuthFooter;
