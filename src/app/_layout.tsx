import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider } from '../context/ThemeContext';

// Empêche la fermeture prématurée puis masque dès que le layout est prêt
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Masquer le splash screen dès que le composant est monté
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
