const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Set EXPO_ROUTER_APP_ROOT for Expo Router
  process.env.EXPO_ROUTER_APP_ROOT = path.join(__dirname, "app");
  
  config.transformer.babelTransformerPath = require.resolve(
    "react-native-svg-transformer"
  );
  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );
  config.resolver.sourceExts.push("svg");
  return config;
})();