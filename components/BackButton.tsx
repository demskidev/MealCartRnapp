import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { BackIcon } from "@/assets/svg";

// Props for BackButton
interface BackButtonProps {
  title?: string; // Optional text to display next to the icon
  icon?: React.ReactNode; // Optional custom icon component
  onPress?: () => void; // Function to call when button is pressed
}

const BackButton = ({ title, icon, onPress }: BackButtonProps) => {
  return (
    // TouchableOpacity provides press feedback and handles taps
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Render custom icon if provided, otherwise default BackIcon */}
      {icon ?? <BackIcon />}

      {/* Render title text if provided */}
      {title && <Text style={styles.title}>{title}</Text>}
    </TouchableOpacity>
  );
};

// Styles for BackButton
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Layout children horizontally
    alignItems: "center", // Vertically align icon and text
  },
  title: {
    // Add spacing or styling for text if needed
  },
});

export default BackButton;
