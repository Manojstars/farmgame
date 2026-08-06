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
import { CROPS, GAME_CONFIG } from '../utils/constants';
import { generateId, formatTimeRemaining } from '../utils/helpers';
import type { PlantedCrop } from '../types/game';

const PLOT_SIZE = 60;
const PLOTS_PER_ROW = 4;

export const FarmScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const addPlantedCrop = useFarmStore((state) => state.addPlantedCrop);
  const removePlantedCrop = useFarmStore((state) => state.removePlantedCrop);
  const harvestCrop = useFarmStore((state) => state.harvestCrop);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateXP = usePlayerStore((state) => state.updateXP);
  const updateStorage = useFarmStore((state) => state.updateStorage);
  const updateEnergy = usePlayerStore((state) => state.updateEnergy);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

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
        <Text>Loading farm...</Text>
      </View>
    );
  }

  const getAvailableCrops = () => {
    return Object.values(CROPS).filter((crop) => crop.unlockedAtLevel <= player.level);
  };

  const handlePlantCrop = (cropId: string) => {
    if (!farm || selectedCrop !== cropId) {
      setSelectedCrop(cropId);
      return;
    }

    const crop = CROPS[cropId as keyof typeof CROPS];
    if (!crop) return;

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_PLANT) {
      addNotification({
        id: 'low-energy',
        message: 'Not enough energy to plant',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check coins
    if (player.coins < crop.seedCost) {
      addNotification({
        id: 'low-coins',
        message: 'Not enough coins for seed',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Find empty plot
    const emptyPlotIndex = Array.from({ length: farm.maxPlots }).findIndex(
      (_, i) => !farm.plots.find((p) => p.plotIndex === i)
    );

    if (emptyPlotIndex === -1) {
      addNotification({
        id: 'no-plots',
        message: 'No empty plots available',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Plant crop
    const now = Date.now();
    const plantedCrop: PlantedCrop = {
      id: generateId(),
      cropId: crop.id,
      plantedAt: now,
      harvestAt: now + crop.growthTimeSeconds * 1000,
      plotIndex: emptyPlotIndex,
    };

    addPlantedCrop(plantedCrop);
    updateCoins(-crop.seedCost);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_PLANT);
    setSelectedCrop(null);

    addNotification({
      id: `planted-${crop.id}`,
      message: `Planted ${crop.name}!`,
      type: 'success',
      duration: 2000,
    });
  };

  const handleHarvestCrop = (cropId: string) => {
    const crop = CROPS[cropId as keyof typeof CROPS];
    const planted = farm.plots.find((p) => p.id === cropId);

    if (!planted || !crop) return;

    // Check energy
    if (player.energy < GAME_CONFIG.ENERGY_COST_HARVEST) {
      addNotification({
        id: 'low-energy-harvest',
        message: 'Not enough energy to harvest',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Harvest
    harvestCrop(cropId);
    updateCoins(crop.harvestValue);
    updateXP(crop.xpReward);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_HARVEST);
    updateStorage(crop.name, 1);

    addNotification({
      id: `harvested-${crop.id}`,
      message: `Harvested ${crop.name} for ${crop.harvestValue} coins!`,
      type: 'success',
      duration: 2000,
    });
  };

  const renderPlot = (index: number) => {
    const planted = farm.plots.find((p) => p.plotIndex === index);

    if (!planted) {
      const availableCrops = getAvailableCrops();
      if (availableCrops.length === 0) {
        return (
          <TouchableOpacity key={index} style={[styles.plot, styles.emptyPlot]}>
            <Text style={styles.plotText}>🚫</Text>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          key={index}
          style={[styles.plot, styles.emptyPlot, selectedCrop && styles.selectedPlot]}
          onPress={() => selectedCrop && handlePlantCrop(selectedCrop)}
        >
          <Text style={styles.plotText}>{selectedCrop ? '✓' : '+'}</Text>
        </TouchableOpacity>
      );
    }

    const crop = CROPS[planted.cropId as keyof typeof CROPS];
    if (!crop) return null;

    const now = Date.now();
    const progress = Math.max(0, Math.min(1, (now - planted.plantedAt) / (planted.harvestAt - planted.plantedAt)));
    const isReady = now >= planted.harvestAt;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.plot, { opacity: 0.5 + progress * 0.5 }]}
        onPress={() => isReady && handleHarvestCrop(planted.id)}
      >
        {isReady ? (
          <>
            <Text style={styles.plotText}>🌾</Text>
            <Text style={styles.harvestLabel}>Ready!</Text>
          </>
        ) : (
          <>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.timeLabel}>
              {formatTimeRemaining(planted.harvestAt - now)}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const availableCrops = getAvailableCrops();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Your Farm</Text>
          <Text style={styles.subtitle}>Plots: {farm.plots.length} / {farm.maxPlots}</Text>
        </View>
      </View>

      {/* Crop Selection */}
      <View style={styles.cropsSection}>
        <Text style={styles.sectionTitle}>Select Crop to Plant</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsList}>
          {availableCrops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.cropCard,
                selectedCrop === crop.id && styles.selectedCropCard,
              ]}
              onPress={() => handlePlantCrop(crop.id)}
            >
              <Text style={styles.cropEmoji}>🌾</Text>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropCost}>{crop.seedCost} 💰</Text>
              <Text style={styles.cropTime}>{crop.growthTimeSeconds}s</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Farm Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {Array.from({ length: farm.maxPlots }).map((_, i) => renderPlot(i))}
        </View>
      </View>

      {/* Farm Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(farm.storage).map(([item, quantity]) => (
            <View key={item} style={styles.storageItem}>
              <Text style={styles.storageLabel}>{item}</Text>
              <Text style={styles.storageQuantity}>{quantity}</Text>
            </View>
          ))}
        </ScrollView>
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
    padding: 20,
    paddingTop: 40,
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cropsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cropsList: {
    marginBottom: 10,
  },
  cropCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedCropCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  cropEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cropCost: {
    fontSize: 11,
    color: '#666',
    marginVertical: 3,
  },
  cropTime: {
    fontSize: 10,
    color: '#999',
  },
  gridContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plot: {
    width: PLOT_SIZE,
    height: PLOT_SIZE,
    backgroundColor: '#90EE90',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
    position: 'relative',
  },
  emptyPlot: {
    backgroundColor: '#E8F5E9',
    borderStyle: 'dashed',
  },
  selectedPlot: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FFD700',
  },
  plotText: {
    fontSize: 24,
    textAlign: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  timeLabel: {
    fontSize: 9,
    color: '#333',
    marginTop: 3,
  },
  harvestLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    padding: 15,
  },
  storageItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  storageQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FarmScreen;
