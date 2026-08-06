import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';
import { useUIStore } from '../store/uiStore';
import { BUILDINGS, GAME_CONFIG } from '../utils/constants';
import { economyService } from '../services/economyService';
import { generateId, formatNumber } from '../utils/helpers';
import type { BuildingInstance } from '../types/game';

export const BuildingsScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const addBuilding = useFarmStore((state) => state.addBuilding);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateEnergy = usePlayerStore((state) => state.updateEnergy);
  const addNotification = useUIStore((state) => state.addNotification);

  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading buildings...</Text>
      </View>
    );
  }

  const getAvailableBuildings = () => {
    return Object.values(BUILDINGS).filter((b) => b.unlockedAtLevel <= player.level);
  };

  const getStorageCapacity = (buildingId: string) => {
    const count = farm.buildings.filter((b) => b.buildingId === buildingId).length;
    const building = BUILDINGS[buildingId as keyof typeof BUILDINGS];
    if (!building) return 0;
    return economyService.calculateStorageCapacity(building.storageBonus || 0, count);
  };

  const getTotalStorageCapacity = () => {
    let total = GAME_CONFIG.STORAGE_CAPACITY_BASE;
    Object.values(BUILDINGS).forEach((building) => {
      if (building.storageBonus) {
        const count = farm.buildings.filter((b) => b.buildingId === building.id).length;
        total += getStorageCapacity(building.id);
      }
    });
    return total;
  };

  const getStorageUsed = () => {
    return Object.values(farm.storage).reduce((sum, qty) => sum + qty, 0);
  };

  const handleBuildBuilding = (buildingId: string) => {
    const building = BUILDINGS[buildingId as keyof typeof BUILDINGS];
    if (!building) return;

    // Check slots
    if (farm.buildings.length >= farm.maxBuildings) {
      addNotification({
        id: 'no-slots',
        message: 'No building slots available',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check coins
    if (player.coins < building.cost) {
      addNotification({
        id: 'low-coins',
        message: `Not enough coins to build ${building.name}`,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_ACTION) {
      addNotification({
        id: 'low-energy',
        message: 'Not enough energy to build',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Build
    const newBuilding: BuildingInstance = {
      id: generateId(),
      buildingId,
      builtAt: Date.now(),
    };

    addBuilding(newBuilding);
    updateCoins(-building.cost);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_ACTION);
    setSelectedBuilding(null);

    addNotification({
      id: `built-${building.id}`,
      message: `Built ${building.name}!`,
      type: 'success',
      duration: 2000,
    });
  };

  const renderBuildingInfo = (building: typeof BUILDINGS[keyof typeof BUILDINGS]) => {
    const count = farm.buildings.filter((b) => b.buildingId === building.id).length;
    let info = '';

    if (building.storageBonus) {
      info = `+${formatNumber(building.storageBonus)} storage per level`;
    } else if (building.animalSlotsBonus) {
      info = `+${building.animalSlotsBonus} animal slots`;
    } else if (building.plotsBonus) {
      info = `+${building.plotsBonus} plot slots`;
    }

    return (
      <View key={building.id} style={styles.buildingCard}>
        <View style={styles.buildingHeader}>
          <Text style={styles.buildingEmoji}>{building.emoji || '🏠'}</Text>
          <View style={styles.buildingInfo}>
            <Text style={styles.buildingName}>{building.name}</Text>
            <Text style={styles.buildingCount}>Owned: {count}</Text>
          </View>
          <Text style={styles.buildingCost}>{formatNumber(building.cost)} 💰</Text>
        </View>

        <Text style={styles.buildingDescription}>{building.description}</Text>
        <Text style={styles.buildingBonus}>{info}</Text>

        <TouchableOpacity
          style={[
            styles.buildBtn,
            player.coins < building.cost && styles.buildBtnDisabled,
          ]}
          onPress={() => handleBuildBuilding(building.id)}
          disabled={player.coins < building.cost}
        >
          <Text style={styles.buildBtnText}>Build {building.name}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const availableBuildings = getAvailableBuildings();
  const storageUsed = getStorageUsed();
  const storageCapacity = getTotalStorageCapacity();
  const storagePercent = Math.round((storageUsed / storageCapacity) * 100);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Your Buildings</Text>
          <Text style={styles.subtitle}>Buildings: {farm.buildings.length} / {farm.maxBuildings}</Text>
        </View>
      </View>

      {/* Storage Status */}
      <View style={styles.storageSection}>
        <Text style={styles.sectionTitle}>Storage Status</Text>
        <View style={styles.storageInfo}>
          <Text style={styles.storageText}>
            {formatNumber(storageUsed)} / {formatNumber(storageCapacity)} items
          </Text>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageFill,
                {
                  width: `${Math.min(100, storagePercent)}%`,
                  backgroundColor:
                    storagePercent > 90 ? '#d32f2f' : storagePercent > 70 ? '#ffa726' : '#2d5016',
                },
              ]}
            />
          </View>
          <Text style={styles.storagePercent}>{storagePercent}% Full</Text>
        </View>
      </View>

      {/* Building Grid */}
      <View style={styles.buildingsSection}>
        <Text style={styles.sectionTitle}>Available Buildings</Text>
        {availableBuildings.length === 0 ? (
          <Text style={styles.noBuildings}>Unlock more buildings by leveling up</Text>
        ) : (
          <View style={styles.buildingsList}>
            {availableBuildings.map((building) => renderBuildingInfo(building))}
          </View>
        )}
      </View>

      {/* Building Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Building Tips</Text>
        <Text style={styles.tipText}>
          • <Text style={styles.tipBold}>Silos</Text> store crops and preserve them longer
        </Text>
        <Text style={styles.tipText}>
          • <Text style={styles.tipBold}>Mills</Text> process raw crops into higher-value goods
        </Text>
        <Text style={styles.tipText}>
          • <Text style={styles.tipBold}>Market Stalls</Text> unlock premium marketplace features
        </Text>
        <Text style={styles.tipText}>
          • <Text style={styles.tipBold}>Warehouses</Text> increase overall storage capacity
        </Text>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  storageSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  storageInfo: {
    gap: 10,
  },
  storageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  storageBar: {
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    borderRadius: 10,
  },
  storagePercent: {
    fontSize: 12,
    color: '#666',
  },
  buildingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  noBuildings: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  buildingsList: {
    gap: 12,
  },
  buildingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5016',
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  buildingEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  buildingCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  buildingCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4a017',
  },
  buildingDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  buildingBonus: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: '600',
    marginBottom: 10,
  },
  buildBtn: {
    backgroundColor: '#2d5016',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buildBtnDisabled: {
    backgroundColor: '#ccc',
  },
  buildBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: '700',
    color: '#2d5016',
  },
});
