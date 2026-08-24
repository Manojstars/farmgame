import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWorldStore } from '../store/worldStore';

const TILE_SIZE = 60;
const PLAYER_SIZE = 40;

export const Player: React.FC = () => {
  const playerPosition = useWorldStore((state) => state.playerPosition);
  const cameraPosition = useWorldStore((state) => state.cameraPosition);

  // Convert world coordinates to screen coordinates
  const screenX = playerPosition.x * TILE_SIZE - PLAYER_SIZE / 2 - cameraPosition.x;
  const screenY = playerPosition.y * TILE_SIZE - PLAYER_SIZE / 2 - cameraPosition.y;

  return (
    <View
      style={[
        styles.player,
        {
          left: screenX,
          top: screenY,
        },
      ]}
    >
      <View style={styles.playerBody}>
        {/* Head */}
        <View style={styles.head} />
        {/* Body outline */}
      </View>
      <View style={styles.playerLabel}>👨‍🌾</View>
    </View>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playerBody: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: '#ff6f00',
    borderWidth: 2,
    borderColor: '#e65100',
  },
  head: {
    width: PLAYER_SIZE * 0.4,
    height: PLAYER_SIZE * 0.4,
    borderRadius: (PLAYER_SIZE * 0.4) / 2,
    backgroundColor: '#ffb74d',
    alignSelf: 'center',
    marginTop: 4,
  },
  playerLabel: {
    position: 'absolute',
    fontSize: 24,
  },
});
