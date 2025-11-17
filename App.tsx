import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenExpo from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { SwipeProvider } from './src/context/SwipeContext';
import { MessagesProvider } from './src/context/MessagesContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/SplashScreen';

// Empêcher le splash screen natif de se cacher automatiquement
SplashScreenExpo.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Cacher immédiatement le splash screen natif
        await SplashScreenExpo.hideAsync();

        // Afficher notre custom splash screen pendant 2.5 secondes
        setTimeout(() => {
          setIsReady(true);
        }, 2500);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SwipeProvider>
            <MessagesProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </MessagesProvider>
          </SwipeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
