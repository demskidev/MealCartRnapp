import { verticalScale } from "@/constants/Constants";
import { Colors, FontFamilies } from "@/constants/Theme";
import { fontSize } from "@/utils/Fonts";
import { StyleSheet, Text, View } from "react-native";

// Props for Header component
interface HeaderProps {
  title: string; // Main heading text (required)
  description?: string; // Optional description/subtitle text
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
      {/* Main title */}
      <Text style={styles.title}>{title}</Text>

      {/* Optional description */}
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
