import { verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title: string;
  description?: string;
}

/**
 * Header Component
 *
 * Used to display a screen heading with an optional description.
 * Commonly used in authentication or onboarding screens.
 *
 * Structure:
 *  - Title text (bold)
 *  - Optional description text (centered below the title)
 */
const Header = ({ title, description }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: verticalScale(8),
  },
  title: {
    color: Colors.primary,
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: fontSize(21),
  },
  description: {
    fontSize: fontSize(12),
    color: Colors.tertiary,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    textAlign: "center",
  },
});

export default Header;
