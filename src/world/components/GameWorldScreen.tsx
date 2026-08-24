import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useFarmStore } from '../../store/farmStore';
import { useUIStore } from '../../store/uiStore';
import { useGameUpdate } from '../../hooks/useGameUpdate';
import { offlineProgressService } from '../../services/offlineProgressService';
import { worldService } from '../systems/worldService';
import { MapRenderer } from './MapRenderer';
import { Player } from './Player';
import { VirtualJoystick } from './VirtualJoystick';
import { GameHUD } from './GameHUD';
import { CropPlot } from './CropPlot';
import type { FarmObject } from '../types/world';

export const GameWorldScreen: React.FC = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const [farmObjects, setFarmObjects] = useState<FarmObject[]>([]);

  // Start game loop (crop growth, energy, etc.)
  useGameUpdate();

  // Initialize world on mount
  useEffect(() => {
    // Generate farm objects (plots, buildings, etc.)
    const objects = worldService.generateFarmObjects();
    setFarmObjects(objects);

    // Sync offline progress on first load
    offlineProgressService.syncOfflineProgress();
  }, []);

  if (!player || !farm) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading farm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main game world */}
      <MapRenderer farmObjects={farmObjects} />

      {/* Interactive crop plots */}
      {farmObjects
        .filter((obj) => obj.type === 'plot')
        .map((plotObj) => (
          <CropPlot
            key={plotObj.id}
            object={plotObj}
            farmObject={plotObj}
            onStateChange={() => {
              // Refresh on state change
            }}
          />
        ))}

      {/* Player character */}
      <Player />

      {/* Game HUD (top) */}
      <GameHUD />

      {/* Virtual joystick (bottom-left) */}
      <VirtualJoystick />

      {/* TODO: Bottom menu for inventory, shop, etc. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#558b2f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#558b2f',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
