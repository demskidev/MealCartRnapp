import { moderateScale, verticalScale } from "@/constants/constants";
import { Colors } from "@/constants/theme";
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
    color: Colors.text,
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
  description: {
    fontSize: moderateScale(14),
    color: Colors.secondaryText,
    textAlign: "center",
  },
});

export default Header;
