import { verticalScale } from "@/constants/Constants";
import { Colors } from "@/constants/Theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Inline "loading the next page" spinner for the footer of a paginated list.
 *
 * Deliberately NOT the global `Loader`: that is a full-screen blocking `Modal`,
 * which is wrong for pagination (it hides the list you are scrolling) and cannot
 * be presented while another modal is on screen without wedging iOS.
 *
 * Render it conditionally — `{isLoadingMore && <PaginationLoader />}` — or pass
 * it straight to `ListFooterComponent`.
 */
const PaginationLoader = () => (
  <View style={styles.container}>
    <ActivityIndicator size="small" color={Colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(16),
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PaginationLoader;
