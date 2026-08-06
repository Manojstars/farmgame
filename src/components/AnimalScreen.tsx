import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';
import { useUIStore } from '../store/uiStore';
import { useGameUpdate } from '../hooks/useGameUpdate';
import { ANIMALS, GAME_CONFIG } from '../utils/constants';
import { generateId, formatTimeRemaining, formatNumber } from '../utils/helpers';
import type { AnimalInstance } from '../types/game';

const ANIMAL_SLOT_SIZE = 90;
const SLOTS_PER_ROW = 3;

export const AnimalScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const addAnimal = useFarmStore((state) => state.addAnimal);
  const updateAnimal = useFarmStore((state) => state.updateAnimal);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateXP = usePlayerStore((state) => state.updateXP);
  const updateStorage = useFarmStore((state) => state.updateStorage);
  const updateEnergy = usePlayerStore((state) => state.updateEnergy);
  const addNotification = useUIStore((state) => state.addNotification);

  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  useGameUpdate();

  // Refresh UI every second to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading animals...</Text>
      </View>
    );
  }

  const getAvailableAnimals = () => {
    return Object.values(ANIMALS).filter((animal) => animal.unlockedAtLevel <= player.level);
  };

  const getAnimalCount = (animalId: string) => {
    return farm.animals.filter((a) => a.animalId === animalId).length;
  };

  const handleBuyAnimal = (animalId: string) => {
    const animal = ANIMALS[animalId as keyof typeof ANIMALS];
    if (!animal) return;

    // Check if slot available
    if (farm.animals.length >= farm.maxAnimalSlots) {
      addNotification({
        id: 'no-slots',
        message: 'No animal slots available',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check coins
    if (player.coins < animal.purchaseCost) {
      addNotification({
        id: 'low-coins',
        message: `Not enough coins for ${animal.name}`,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_ACTION) {
      addNotification({
        id: 'low-energy',
        message: 'Not enough energy to buy animal',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Buy animal
    const newAnimal: AnimalInstance = {
      id: generateId(),
      animalId,
      boughtAt: Date.now(),
      lastFedAt: Date.now(),
      nextProductionAt: Date.now() + animal.productionTimeSeconds * 1000,
    };

    addAnimal(newAnimal);
    updateCoins(-animal.purchaseCost);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_ACTION);
    setSelectedAnimal(null);

    addNotification({
      id: `bought-${animal.id}`,
      message: `Bought ${animal.name}!`,
      type: 'success',
      duration: 2000,
    });
  };

  const handleCollectProduction = (animalInstanceId: string) => {
    const animalInstance = farm.animals.find((a) => a.id === animalInstanceId);
    if (!animalInstance) return;

    const animal = ANIMALS[animalInstance.animalId as keyof typeof ANIMALS];
    if (!animal) return;

    const now = Date.now();
    if (now < animalInstance.nextProductionAt) {
      addNotification({
        id: 'not-ready',
        message: `${animal.name} is still producing`,
        type: 'info',
        duration: 2000,
      });
      return;
    }

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_ACTION) {
      addNotification({
        id: 'low-energy-collect',
        message: 'Not enough energy to collect',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Collect production
    updateAnimal(animalInstanceId, {
      lastFedAt: now,
      nextProductionAt: now + animal.productionTimeSeconds * 1000,
    });
    updateCoins(animal.productionValue);
    updateXP(animal.productionXP);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_ACTION);
    updateStorage(animal.productName, 1);

    addNotification({
      id: `collected-${animal.id}`,
      message: `Collected ${animal.productName} for ${animal.productionValue} coins!`,
      type: 'success',
      duration: 2000,
    });
  };

  const handleFeedAnimal = (animalInstanceId: string) => {
    const animalInstance = farm.animals.find((a) => a.id === animalInstanceId);
    if (!animalInstance) return;

    const animal = ANIMALS[animalInstance.animalId as keyof typeof ANIMALS];
    if (!animal) return;

    // Check coins
    if (player.coins < animal.feedCost) {
      addNotification({
        id: 'low-coins-feed',
        message: `Not enough coins to feed ${animal.name}`,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_ACTION) {
      addNotification({
        id: 'low-energy-feed',
        message: 'Not enough energy to feed animal',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Feed animal
    const now = Date.now();
    updateAnimal(animalInstanceId, {
      lastFedAt: now,
    });
    updateCoins(-animal.feedCost);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_ACTION);

    addNotification({
      id: `fed-${animal.id}`,
      message: `Fed ${animal.name}!`,
      type: 'success',
      duration: 2000,
    });
  };

  const renderAnimalSlot = (index: number) => {
    const animalInstance = farm.animals[index];

    if (!animalInstance) {
      const availableAnimals = getAvailableAnimals();
      if (availableAnimals.length === 0) {
        return (
          <View key={index} style={[styles.slot, styles.emptySlot]}>
            <Text style={styles.slotText}>🚫</Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          key={index}
          style={[styles.slot, styles.emptySlot]}
          onPress={() => {
            if (availableAnimals.length === 1) {
              handleBuyAnimal(availableAnimals[0].id);
            } else {
              setSelectedAnimal(index.toString());
            }
          }}
        >
          <Text style={styles.slotText}>➕</Text>
          <Text style={styles.addLabel}>Add</Text>
        </TouchableOpacity>
      );
    }

    const animal = ANIMALS[animalInstance.animalId as keyof typeof ANIMALS];
    if (!animal) return null;

    const now = Date.now();
    const isReady = now >= animalInstance.nextProductionAt;
    const timeUntilReady = animalInstance.nextProductionAt - now;
    const isFed = (now - animalInstance.lastFedAt) / (24 * 60 * 60 * 1000) < 1; // Fed within last 24h

    return (
      <View key={index} style={[styles.slot, !isFed && styles.unhealthySlot]}>
        <TouchableOpacity
          style={styles.slotContent}
          onPress={() => isReady && handleCollectProduction(animalInstance.id)}
        >
          <Text style={styles.animalEmoji}>{animal.emoji || '🐄'}</Text>
          <Text style={styles.animalName}>{animal.name}</Text>
          {isReady ? (
            <Text style={styles.readyLabel}>✓ Ready</Text>
          ) : (
            <Text style={styles.timeLabel}>
              {formatTimeRemaining(timeUntilReady)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, !isFed && styles.urgentBtn]}
            onPress={() => handleFeedAnimal(animalInstance.id)}
          >
            <Text style={styles.actionBtnText}>{!isFed ? '🍴' : '😋'}</Text>
          </TouchableOpacity>
          {isReady && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.collectBtn]}
              onPress={() => handleCollectProduction(animalInstance.id)}
            >
              <Text style={styles.actionBtnText}>📦</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const availableAnimals = getAvailableAnimals();
  const maxSlots = Math.min(12, farm.maxAnimalSlots || 12);
  const animalSlots = Array.from({ length: maxSlots }, (_, i) => i);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Your Animals</Text>
          <Text style={styles.subtitle}>
            Animals: {farm.animals.length} / {maxSlots}
          </Text>
        </View>
      </View>

      {/* Animal Shop */}
      <View style={styles.shopSection}>
        <Text style={styles.sectionTitle}>Buy Animals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopList}>
          {availableAnimals.map((animal) => {
            const ownedCount = getAnimalCount(animal.id);
            return (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.animalCard,
                  selectedAnimal === animal.id && styles.selectedAnimalCard,
                ]}
                onPress={() => handleBuyAnimal(animal.id)}
              >
                <Text style={styles.animalCardEmoji}>{animal.emoji || '🐄'}</Text>
                <Text style={styles.animalCardName}>{animal.name}</Text>
                <Text style={styles.animalCardOwned}>Owned: {ownedCount}</Text>
                <Text style={styles.animalCardCost}>{formatNumber(animal.purchaseCost)} 💰</Text>
                <Text style={styles.animalCardProd}>
                  {formatNumber(animal.productionValue)} 🏆
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Animal Grid */}
      <View style={styles.slotsSection}>
        <Text style={styles.sectionTitle}>Your Animals</Text>
        <View style={styles.grid}>
          {animalSlots.map((index) => renderAnimalSlot(index))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Animal Info</Text>
        <Text style={styles.statText}>🍴 Feed animals daily for better production</Text>
        <Text style={styles.statText}>📦 Collect products when ready</Text>
        <Text style={styles.statText}>💡 Different animals produce different items</Text>
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
  shopSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  shopList: {
    marginBottom: 10,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedAnimalCard: {
    borderColor: '#2d5016',
    backgroundColor: '#f0f8e8',
  },
  animalCardEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  animalCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  animalCardOwned: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
  },
  animalCardCost: {
    fontSize: 11,
    color: '#d4a017',
    marginTop: 3,
    fontWeight: '600',
  },
  animalCardProd: {
    fontSize: 11,
    color: '#2d5016',
    marginTop: 2,
    fontWeight: '600',
  },
  slotsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  slot: {
    width: (Dimensions.get('window').width - 60) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d5016',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptySlot: {
    backgroundColor: '#f0f8e8',
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  unhealthySlot: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  slotText: {
    fontSize: 32,
  },
  addLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  slotContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 35,
  },
  animalEmoji: {
    fontSize: 40,
  },
  animalName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  readyLabel: {
    fontSize: 10,
    color: '#2d5016',
    fontWeight: '600',
    marginTop: 3,
  },
  timeLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 3,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 3,
    gap: 3,
  },
  actionBtn: {
    backgroundColor: '#2d5016',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentBtn: {
    backgroundColor: '#d32f2f',
  },
  collectBtn: {
    backgroundColor: '#ffa726',
  },
  actionBtnText: {
    fontSize: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
});
