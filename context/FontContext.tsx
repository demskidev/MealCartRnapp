import { Colors } from '@/constants/Theme';
import { loadCustomFonts } from '@/utils/Fonts';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface FontContextType {
  fontsLoaded: boolean;
  fontError: string | null;
}

const FontContext = createContext<FontContextType>({
  fontsLoaded: false,
  fontError: null,
});

export const useFonts = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFonts must be used within FontProvider');
  }
  return context;
};

interface FontProviderProps {
  children: React.ReactNode;
}

/**
 * FontProvider wraps the app and ensures fonts are loaded before rendering
 * Place this at the root of your app in _layout.tsx
 */
export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFonts = async () => {
      try {
        await loadCustomFonts();
        setFontsLoaded(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown font loading error';
        console.error('Font initialization failed:', errorMessage);
        setFontError(errorMessage);
        // Still allow app to load even if fonts fail
        setFontsLoaded(true);
      }
    };

    initializeFonts();
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FontContext.Provider value={{ fontsLoaded, fontError }}>
      {children}
    </FontContext.Provider>
  );
};
