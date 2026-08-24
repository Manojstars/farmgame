import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useWorldStore } from '../store/worldStore';
import { useFarmStore } from '../../store/farmStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { CROPS, GAME_CONFIG } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import type { FarmObject, PlotState } from '../types/world';

const TILE_SIZE = 60;
const INTERACTION_DISTANCE = 1.5; // World units

interface CropPlotProps {
  object: FarmObject;
  farmObject: any; // The actual plot with state from farm
  onStateChange?: () => void;
}

export const CropPlot: React.FC<CropPlotProps> = ({ object, farmObject, onStateChange }) => {
  const playerPosition = useWorldStore((state) => state.playerPosition);
  const cameraPosition = useWorldStore((state) => state.cameraPosition);
  const setSelectedObject = useWorldStore((state) => state.setSelectedObject);
  const selectedObjectId = useWorldStore((state) => state.selectedObjectId);

  const player = usePlayerStore((state) => state.player);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateXP = usePlayerStore((state) => state.updateXP);
  const updateEnergy = usePlayerStore((state) => state.updateEnergy);

  const farm = useFarmStore((state) => state.farm);
  const addPlantedCrop = useFarmStore((state) => state.addPlantedCrop);
  const harvestCrop = useFarmStore((state) => state.harvestCrop);
  const updateStorage = useFarmStore((state) => state.updateStorage);

  const addNotification = useUIStore((state) => state.addNotification);

  const [showMenu, setShowMenu] = useState(false);
  
  const initialPlotState: PlotState = object.data && typeof object.data === 'object' && 'state' in object.data
    ? (object.data as PlotState)
    : { cropId: null, plantedAt: null, state: 'empty' };
  
  const [plotState, setPlotState] = useState<PlotState>(initialPlotState);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate distance to player
  const distance = Math.hypot(playerPosition.x - object.x, playerPosition.y - object.y);
  const isNearby = distance < INTERACTION_DISTANCE;

  // Check for crop growth
  useEffect(() => {
    if (plotState.state === 'growing' && plotState.plantedAt) {
      const interval = setInterval(() => {
        const now = Date.now();
        const cropId = plotState.cropId as keyof typeof CROPS;
        const crop = CROPS[cropId];

        if (crop) {
          const growthTime = crop.growthTimeSeconds * 1000; // For demo, use 30 seconds
          const plantedTime = plotState.plantedAt || Date.now();
          const elapsedTime = now - plantedTime;

          if (elapsedTime >= growthTime) {
            // Ready to harvest
            setPlotState((prev) => ({ ...prev, state: 'ready' }));
          } else {
            const remaining = growthTime - elapsedTime;
            setTimeRemaining(Math.ceil(remaining / 1000));
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [plotState]);

  const handlePlant = (cropId: string) => {
    if (!player || !farm) return;

    const crop = CROPS[cropId as keyof typeof CROPS];
    if (!crop) return;

    // Check resources
    if (player.coins < crop.seedCost) {
      addNotification({
        id: `insufficient-coins-${Date.now()}`,
        message: 'Not enough coins to plant',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    if (player.energy < GAME_CONFIG.ENERGY_COST_PLANT) {
      addNotification({
        id: `insufficient-energy-${Date.now()}`,
        message: 'Not enough energy',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Deduct costs
    updateCoins(-crop.seedCost);
    updateEnergy(-GAME_CONFIG.ENERGY_COST_PLANT);

    // Add planted crop
    addPlantedCrop({
      id: generateId(),
      cropId,
      plantedAt: Date.now(),
      harvestAt: Date.now() + crop.growthTimeSeconds * 1000,
      plotIndex: object.data?.plotIndex || 0,
    });

    // Update plot state
    setPlotState({
      cropId,
      plantedAt: Date.now(),
      state: 'growing',
    });

    addNotification({
      id: `planted-${Date.now()}`,
      message: `Planted ${crop.name}!`,
      type: 'success',
      duration: 2000,
    });

    setShowMenu(false);
  };

  const handleHarvest = () => {
    if (!player || !plotState.cropId) return;

    const cropId = plotState.cropId as keyof typeof CROPS;
    const crop = CROPS[cropId];
    if (!crop) return;

    // Award rewards
    updateCoins(crop.harvestValue);
    updateXP(crop.xpReward);
    updateStorage(crop.name.toLowerCase(), 1);

    // Clear plot
    setPlotState({
      cropId: null,
      plantedAt: null,
      state: 'empty',
    });

    addNotification({
      id: `harvested-${Date.now()}`,
      message: `Harvested ${crop.name}! +${crop.harvestValue} coins, +${crop.xpReward} XP`,
      type: 'success',
      duration: 2000,
    });

    setShowMenu(false);
  };

  const screenX = object.x * TILE_SIZE - cameraPosition.x;
  const screenY = object.y * TILE_SIZE - cameraPosition.y;

  const getPlotColor = () => {
    switch (plotState.state) {
      case 'empty':
        return '#9d7e5b';
      case 'planted':
      case 'growing':
        return '#7cb342';
      case 'ready':
        return '#ffd700';
      default:
        return '#999';
    }
  };

  const getPlotLabel = () => {
    if (plotState.state === 'empty') return '▫️';
    if (plotState.state === 'growing') return '🌱';
    if (plotState.state === 'ready') return '🌾';
    return '';
  };

  return (
    <>
      {/* Plot visual */}
      <TouchableOpacity
        style={[
          styles.plot,
          {
            left: screenX,
            top: screenY,
            backgroundColor: getPlotColor(),
            borderWidth: selectedObjectId === object.id ? 3 : 1,
            borderColor: selectedObjectId === object.id ? '#fff' : 'rgba(0,0,0,0.3)',
          },
        ]}
        onPress={() => {
          setSelectedObject(object.id);
          if (isNearby) {
            setShowMenu(!showMenu);
          }
        }}
      >
        <Text style={styles.plotLabel}>{getPlotLabel()}</Text>
        {plotState.state === 'growing' && timeRemaining > 0 && (
          <Text style={styles.timer}>{Math.ceil(timeRemaining / 60)}m</Text>
        )}
      </TouchableOpacity>

      {/* Interaction menu */}
      {showMenu && isNearby && (
        <View
          style={[
            styles.menu,
            {
              left: screenX + 60,
              top: screenY - 100,
            },
          ]}
        >
          {plotState.state === 'empty' && (
            <>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => handlePlant('wheat')}
              >
                <Text style={styles.menuButtonText}>🌾 Wheat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => handlePlant('corn')}>
                <Text style={styles.menuButtonText}>🌽 Corn</Text>
              </TouchableOpacity>
            </>
          )}

          {plotState.state === 'growing' && (
            <Text style={styles.menuText}>Growing... {timeRemaining}s</Text>
          )}

          {plotState.state === 'ready' && (
            <TouchableOpacity style={[styles.menuButton, styles.harvestButton]} onPress={handleHarvest}>
              <Text style={styles.menuButtonText}>🔨 Harvest</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={() => setShowMenu(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Interaction indicator */}
      {isNearby && !showMenu && (
        <View
          style={[
            styles.indicator,
            {
              left: screenX + 30 - 25,
              top: screenY - 35,
            },
          ]}
        >
          <Text style={styles.indicatorText}>TAP</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  plot: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotLabel: {
    fontSize: 24,
  },
  timer: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 8,
    fontWeight: '700',
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    zIndex: 30,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 4,
  },
  harvestButton: {
    backgroundColor: '#4caf50',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuText: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 4,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    backgroundColor: '#ffd700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 25,
  },
  indicatorText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000',
  },
});
