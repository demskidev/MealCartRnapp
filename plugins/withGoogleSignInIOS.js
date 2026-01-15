const { withAppDelegate, withPodfile } = require('@expo/config-plugins');

function withGoogleSignInIOS(config) {
  // Fix AppDelegate for Google Sign-In
  config = withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Add GoogleSignIn import after other imports
    if (!contents.includes('import GoogleSignIn')) {
      // Find the last import statement and add GoogleSignIn after it
      const importPattern = /(import\s+\w+\s*\n)/g;
      const imports = contents.match(importPattern);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        contents = contents.replace(lastImport, lastImport + 'import GoogleSignIn\n');
      }
    }

    // Add URL handling method if it doesn't exist
    if (!contents.includes('GIDSignIn.sharedInstance.handle')) {
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
        contents = contents.replace(classEndPattern, urlHandlingMethod + '\n}\n\nclass ReactNativeDelegate');
      }
    }

    config.modResults.contents = contents;
    return config;
  });

  // Fix Podfile for Firebase
  config = withPodfile(config, (config) => {
    const { contents } = config.modResults;

    // Add use_modular_headers! after use_expo_modules!
    if (!contents.includes('use_modular_headers!')) {
      config.modResults.contents = contents.replace(
        /use_expo_modules!/,
        'use_expo_modules!\n  \n  # Fix Firebase Swift pods issue\n  use_modular_headers!'
      );
    }

    return config;
  });

  return config;
}

module.exports = withGoogleSignInIOS;
