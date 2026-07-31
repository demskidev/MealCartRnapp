import { Colors } from "@/constants/Theme";
import { useEffect, useState } from "react";
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

const LOAD_TIMEOUT_MS = 10000;

// Returns the uri only for real remote (http/https) images — those are the ones
// with an actual load delay. Bundled assets render immediately, and a junk uri
// (the literal "string" some records carry, a bare filename, a stale file://
// path) never loads at all and may never fire onError either, so none of them
// may start the spinner.
const remoteUri = (source: ImageSourcePropType) => {
  if (
    typeof source !== "object" ||
    source === null ||
    Array.isArray(source) ||
    typeof (source as any).uri !== "string"
  ) {
    return null;
  }
  const uri = (source as any).uri.trim();
  return /^https?:\/\//i.test(uri) ? uri : null;
};

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
  const uri = remoteUri(source);
  // Track which uri finished rather than a bare boolean: the same component
  // instance gets reused for a different item as a list recycles cells, and a
  // stale `loading = true` would leave the spinner on top of the placeholder
  // of an item that has no image at all. Deriving it means a non-remote source
  // is never "loading", whatever the previous item was doing.
  const [settledUri, setSettledUri] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const loading = uri !== null && settledUri !== uri && !timedOut;

  // A dead or unreachable https url can hang without ever calling onError, so
  // give up on the spinner rather than leave it turning forever.
  useEffect(() => {
    setTimedOut(false);
    if (uri === null || settledUri === uri) return;
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [uri, settledUri]);

  return (
    <View style={[styles.container, style, containerStyle]}>
      <Image
        {...rest}
        source={source}
        style={styles.image}
        onLoadStart={() => {
          onLoadStart?.();
        }}
        onLoadEnd={() => {
          setSettledUri(uri);
          onLoadEnd?.();
        }}
        onError={(e) => {
          setSettledUri(uri);
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
