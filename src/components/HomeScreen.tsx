import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { useFarmStore } from '../store/farmStore';
import { useGameUpdate } from '../hooks/useGameUpdate';
import { offlineProgressService } from '../services/offlineProgressService';

export const HomeScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);
  const farm = useFarmStore((state) => state.farm);

  // Start game loop
  useGameUpdate();

  useEffect(() => {
    // Sync offline progress on app open
    offlineProgressService.syncOfflineProgress();
  }, []);

  if (!player) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.playerName}>Level {player.level} Farmer</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(player.xp / player.xpToNextLevel) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.xpText}>
            XP: {player.xp} / {player.xpToNextLevel}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Resources */}
      <View style={styles.resourcesContainer}>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceIcon}>💰</Text>
          <Text style={styles.resourceLabel}>Coins</Text>
          <Text style={styles.resourceValue}>{player.coins}</Text>
        </View>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceIcon}>💎</Text>
          <Text style={styles.resourceLabel}>Gems</Text>
          <Text style={styles.resourceValue}>{player.gems}</Text>
        </View>
        <View style={styles.resourceCard}>
          <Text style={styles.resourceIcon}>⚡</Text>
          <Text style={styles.resourceLabel}>Energy</Text>
          <Text style={styles.resourceValue}>
            {player.energy}/{player.maxEnergy}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('farm')}
        >
          <Text style={styles.actionIcon}>🌾</Text>
          <Text style={styles.actionLabel}>Farm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('animals')}
        >
          <Text style={styles.actionIcon}>🐄</Text>
          <Text style={styles.actionLabel}>Animals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('buildings')}
        >
          <Text style={styles.actionIcon}>🏢</Text>
          <Text style={styles.actionLabel}>Buildings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('upgrades')}
        >
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionLabel}>Upgrades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('inventory')}
        >
          <Text style={styles.actionIcon}>🎒</Text>
          <Text style={styles.actionLabel}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('market')}
        >
          <Text style={styles.actionIcon}>🏪</Text>
          <Text style={styles.actionLabel}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('contracts')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Contracts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('shop')}
        >
          <Text style={styles.actionIcon}>🛍️</Text>
          <Text style={styles.actionLabel}>Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Farm Stats */}
      {farm && (
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Farm Status</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Crops Planted:</Text>
            <Text style={styles.statValue}>{farm.plots.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Animals:</Text>
            <Text style={styles.statValue}>{farm.animals.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Storage:</Text>
            <Text style={styles.statValue}>
              {Object.values(farm.storage).reduce((a, b) => a + b, 0)} /
              {farm.maxStorage}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2d5016',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  resourcesContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  resourceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resourceIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resourceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;
