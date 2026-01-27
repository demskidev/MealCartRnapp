import { BackIcon } from "@/assets/svg";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface BackButtonProps {
  title?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

const BackButton = ({ title, icon, onPress }: BackButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {icon ?? <BackIcon />}

      {title && <Text style={styles.title}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
  },
});

export default BackButton;
