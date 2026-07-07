import { Colors } from "@/constants/Theme";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StatusBar, StyleSheet, View } from "react-native";

let setLoaderVisible: ((visible: boolean) => void) | null = null;
let pendingState: boolean | null = null;

export const showLoader = () => {
  if (setLoaderVisible) {
    setLoaderVisible(true);
    pendingState = null;
  } else {
    pendingState = true;
  }
};

export const hideLoader = () => {
  if (setLoaderVisible) {
    setLoaderVisible(false);
    pendingState = null;
  } else {
    pendingState = false;
  }
};

export default function Loader() {
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    setLoaderVisible = setVisible;

    // Apply any pending state
    if (pendingState !== null) {
      setVisible(pendingState);
      pendingState = null;
    }

    return () => {
      setLoaderVisible = null;
    };
  }, []);

  // Safety net: the loader must never be able to block the screen forever.
  // If something forgets to call hideLoader() (or a request hangs), auto-hide.
  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timer);
  }, [visible]);

  // IMPORTANT: control the Modal with the `visible` prop instead of
  // conditionally rendering it. Unmounting a native <Modal> to hide it can
  // leave an orphaned, invisible overlay that still swallows touches on
  // iOS/iPad (especially under the New Architecture) — which reads as a
  // frozen screen.
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setVisible(false)}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    backgroundColor: Colors.white,
    padding: 30,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});