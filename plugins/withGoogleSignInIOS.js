const {
  withAppDelegate,
  withPodfile,
  withInfoPlist,
} = require("@expo/config-plugins");

function withGoogleSignInIOS(config) {
  // Add URL schemes to Info.plist for Google Sign-In callback
  config = withInfoPlist(config, (config) => {
    const googleUrlScheme =
      "com.googleusercontent.apps.107165390600-nmgglhb1s0gglvqmcln8kehr21cgpi5o";

    if (!config.modResults.CFBundleURLTypes) {
      config.modResults.CFBundleURLTypes = [];
    }

    // Check if Google URL scheme already exists
    const hasGoogleScheme = config.modResults.CFBundleURLTypes.some(
      (type) =>
        type.CFBundleURLSchemes &&
        type.CFBundleURLSchemes.includes(googleUrlScheme),
    );

    if (!hasGoogleScheme) {
      config.modResults.CFBundleURLTypes.push({
        CFBundleTypeRole: "Editor",
        CFBundleURLSchemes: [googleUrlScheme],
      });
    }

    // Also ensure the bundle identifier scheme exists
    const bundleId = config.ios?.bundleIdentifier || "com.app.mealcart";
    const hasBundleScheme = config.modResults.CFBundleURLTypes.some(
      (type) =>
        type.CFBundleURLSchemes && type.CFBundleURLSchemes.includes(bundleId),
    );

    if (!hasBundleScheme) {
      config.modResults.CFBundleURLTypes.push({
        CFBundleTypeRole: "Editor",
        CFBundleURLSchemes: [bundleId],
      });
    }

    return config;
  });

  // Fix AppDelegate for Google Sign-In
  config = withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Add GoogleSignIn import after other imports
    if (!contents.includes("import GoogleSignIn")) {
      // Find the last import statement and add GoogleSignIn after it
      const importPattern = /(import\s+\w+\s*\n)/g;
      const imports = contents.match(importPattern);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        contents = contents.replace(
          lastImport,
          lastImport + "import GoogleSignIn\n",
        );
      }
    }

    // Add URL handling method if it doesn't exist
    // Check if the method is already defined to avoid duplicates
    const hasApplicationOpenMethod =
      /public\s+override\s+func\s+application\s*\(\s*_\s+app:\s*UIApplication,\s*open\s+url:\s*URL/.test(
        contents,
      );

    if (!hasApplicationOpenMethod) {
      // Find the location to insert the method (before the end of AppDelegate class)
      const classEndPattern = /\n}\n\nclass ReactNativeDelegate/;

      const urlHandlingMethod = `
  // Linking API - Handle Google Sign-In callback
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // Handle Google Sign-In callback FIRST
    if GIDSignIn.sharedInstance.handle(url) {
      return true
    }
    
    // Then handle other deep links
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }
`;

      if (classEndPattern.test(contents)) {
        contents = contents.replace(
          classEndPattern,
          urlHandlingMethod + "\n}\n\nclass ReactNativeDelegate",
        );
      }
    }

    config.modResults.contents = contents;
    return config;
  });

  // Fix Podfile for Firebase
  config = withPodfile(config, (config) => {
    const { contents } = config.modResults;

    // Add use_modular_headers! after use_expo_modules!
    if (!contents.includes("use_modular_headers!")) {
      config.modResults.contents = contents.replace(
        /use_expo_modules!/,
        "use_expo_modules!\n  \n  # Fix Firebase Swift pods issue\n  use_modular_headers!",
      );
    }

    return config;
  });

  return config;
}

module.exports = withGoogleSignInIOS;
