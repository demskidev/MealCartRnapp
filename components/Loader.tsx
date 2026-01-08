import { Colors } from "@/constants/Theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoaderProps {
  visible?: boolean;
}

const Loader = ({ visible = true }: LoaderProps) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default Loader;
