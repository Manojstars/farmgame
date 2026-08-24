import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';

export const GameHUD: React.FC = () => {
  const player = usePlayerStore((state) => state.player);

  if (!player) return null;

  const xpPercent = Math.min(100, (player.xp / player.xpToNextLevel) * 100);

  return (
    <View style={styles.hudContainer}>
      <View style={styles.playerInfoRow}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>Level {player.level} Farmer</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={styles.xpText}>
            XP {player.xp} / {player.xpToNextLevel}
          </Text>
        </View>
      </View>

      <View style={styles.resourcesRow}>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>💰</Text>
          <Text style={styles.resourceValue}>{player.coins}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>💎</Text>
          <Text style={styles.resourceValue}>{player.gems}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>⚡</Text>
          <Text style={styles.resourceValue}>
            {player.energy}/{player.maxEnergy}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 15,
  },
  playerInfoRow: {
    marginBottom: 6,
  },
  playerInfo: {
    flexShrink: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  xpBar: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 2,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  xpText: {
    fontSize: 10,
    color: '#aaa',
  },
  resourcesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  resourceLabel: {
    marginRight: 4,
    fontSize: 14,
  },
  resourceValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    minWidth: 25,
  },
});
