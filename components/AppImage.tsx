import { Colors } from "@/constants/Theme";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type AppImageProps = Omit<ImageProps, "source"> & {
  source: ImageSourcePropType;
  loaderColor?: string;
  loaderSize?: number | "small" | "large";
  // Extra styling for the wrapper (rarely needed — the image `style` is applied
  // to the wrapper so sizing/rounding "just works" as a drop-in for <Image>).
  containerStyle?: StyleProp<ViewStyle>;
};

// True only for remote (http) images — those are the ones with a real load
// delay. Bundled/local assets render immediately, so we never spin for them.
const isRemoteSource = (source: ImageSourcePropType) =>
  typeof source === "object" &&
  source !== null &&
  !Array.isArray(source) &&
  typeof (source as any).uri === "string" &&
  (source as any).uri.length > 0;

/**
 * Drop-in replacement for <Image> that shows an inline ActivityIndicator over
 * the image while a remote source is loading. The `style` you'd normally give
 * <Image> is applied to the wrapper, and the image fills it, so existing
 * width/height/borderRadius keep working unchanged.
 */
const AppImage = ({
  source,
  style,
  containerStyle,
  loaderColor = Colors.primary,
  loaderSize = "small",
  onLoadStart,
  onLoadEnd,
  onError,
  ...rest
}: AppImageProps) => {
  const remote = isRemoteSource(source);
  const [loading, setLoading] = useState(remote);

  return (
    <View style={[styles.container, style, containerStyle]}>
      <Image
        {...rest}
        source={source}
        style={styles.image}
        onLoadStart={() => {
          if (remote) setLoading(true);
          onLoadStart?.();
        }}
        onLoadEnd={() => {
          setLoading(false);
          onLoadEnd?.();
        }}
        onError={(e) => {
          setLoading(false);
          onError?.(e);
        }}
      />
      {loading && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator size={loaderSize as any} color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: Colors.greysoft,
  },
  // Fill the wrapper by size (not absolute insets) so the image renders
  // correctly even when the wrapper itself is absolutely positioned (e.g. the
  // full-bleed MealDetail header) rather than having explicit width/height.
  image: {
    width: "100%",
    height: "100%",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppImage;
