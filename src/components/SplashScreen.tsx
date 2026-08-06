import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useUIStore } from '../store/uiStore';

export const SplashScreen = () => {
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setCurrentScreen('login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 FarmGame 🌾</Text>
      <Text style={styles.subtitle}>American Farm Management</Text>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      <Text style={styles.loadingText}>Loading your farm...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d5016',
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#90EE90',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#90EE90',
    marginTop: 20,
  },
});

export default SplashScreen;
