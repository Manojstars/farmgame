import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { auth } from './src/services/firebaseService';
import { usePlayerStore } from './src/store/playerStore';
import { useUIStore } from './src/store/uiStore';
import { useRemoteConfigStore } from './src/store/remoteConfigStore';

// Screens
import { SplashScreen } from './src/components/SplashScreen';
import { LoginScreen } from './src/components/LoginScreen';
import { HomeScreen } from './src/components/HomeScreen';
import { FarmScreen } from './src/components/FarmScreen';
import { AnimalScreen } from './src/components/AnimalScreen';
import { BuildingsScreen } from './src/components/BuildingsScreen';
import { UpgradesScreen } from './src/components/UpgradesScreen';
import { InventoryScreen } from './src/components/InventoryScreen';
import { MarketScreen } from './src/components/MarketScreen';
import { ContractsScreen } from './src/components/ContractsScreen';
import { ShopScreen } from './src/components/ShopScreen';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const currentScreen = useUIStore((state) => state.currentScreen);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);
  const setLoading = useUIStore((state) => state.setLoading);
  const fetchConfig = useRemoteConfigStore((state) => state.fetchConfig);

  useEffect(() => {
    // Set initial splash screen
    if (!isInitialized) {
      setCurrentScreen('splash');
      setIsInitialized(true);

      // Simulate splash screen duration
      const splashTimeout = setTimeout(() => {
        // Check auth state after splash
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setIsSignedIn(true);
            setCurrentScreen('home');
          } else {
            setIsSignedIn(false);
            setCurrentScreen('login');
          }
          setLoading(false);
        });

        return unsubscribe;
      }, 2000);

      return () => clearTimeout(splashTimeout);
    }
  }, [isInitialized]);

  // Fetch remote config on app start
  useEffect(() => {
    fetchConfig();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'farm':
        return <FarmScreen />;
      case 'animals':
        return <AnimalScreen />;
      case 'buildings':
        return <BuildingsScreen />;
      case 'upgrades':
        return <UpgradesScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'market':
        return <MarketScreen />;
      case 'contracts':
        return <ContractsScreen />;
      case 'shop':
        return <ShopScreen />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <ActivityIndicator size="large" color="#2d5016" />
          </View>
        );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#2d5016" />
          {renderScreen()}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
