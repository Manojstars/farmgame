import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';
import { useUIStore } from '../store/uiStore';
import { GAME_CONFIG } from '../utils/constants';
import { economyService } from '../services/economyService';
import { formatNumber } from '../utils/helpers';

// Define upgrade tree
const UPGRADES = {
  PLOT_TIER_1: {
    id: 'plot_tier_1',
    name: 'Plot Expansion I',
    description: 'Unlock 2 additional farm plots',
    category: 'farming',
    cost: 500,
    level: 1,
    effect: '+2 plots',
  },
  PLOT_TIER_2: {
    id: 'plot_tier_2',
    name: 'Plot Expansion II',
    description: 'Unlock 4 additional farm plots',
    category: 'farming',
    cost: 2000,
    level: 5,
    effect: '+4 plots',
    requires: 'plot_tier_1',
  },
  ENERGY_REGEN: {
    id: 'energy_regen',
    name: 'Energy Efficiency',
    description: 'Increase energy regeneration rate by 20%',
    category: 'energy',
    cost: 800,
    level: 3,
    effect: '+20% energy regen',
  },
  CROP_SPEED: {
    id: 'crop_speed',
    name: 'Growth Serum',
    description: 'Crops grow 15% faster',
    category: 'farming',
    cost: 1500,
    level: 7,
    effect: '+15% crop speed',
  },
  ANIMAL_PRODUCTION: {
    id: 'animal_production',
    name: 'Animal Care',
    description: 'Animals produce 25% more items',
    category: 'animals',
    cost: 1200,
    level: 4,
    effect: '+25% production',
  },
} as const;

export const UpgradesScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const addUpgrade = useFarmStore((state) => state.addUpgrade);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading upgrades...</Text>
      </View>
    );
  }

  const getUpgradeLevel = (upgradeId: string) => {
    return farm.upgrades[upgradeId] || 0;
  };

  const canUnlock = (upgrade: typeof UPGRADES[keyof typeof UPGRADES]) => {
    return player.level >= upgrade.level;
  };

  const canAfford = (upgrade: typeof UPGRADES[keyof typeof UPGRADES]) => {
    return player.coins >= upgrade.cost;
  };

  const canPurchase = (upgrade: typeof UPGRADES[keyof typeof UPGRADES]) => {
    if ('requires' in upgrade && upgrade.requires) {
      const requirement = upgrade.requires as string;
      if (getUpgradeLevel(requirement) === 0) {
        return false;
      }
    }
    return canUnlock(upgrade) && canAfford(upgrade);
  };

  const handlePurchaseUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES[upgradeId as keyof typeof UPGRADES];
    if (!upgrade) return;

    if (!canUnlock(upgrade)) {
      addNotification({
        id: 'level-required',
        message: `Reach level ${upgrade.level} to unlock`,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    if (!canAfford(upgrade)) {
      addNotification({
        id: 'insufficient-coins',
        message: 'Not enough coins for this upgrade',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    if ('requires' in upgrade && upgrade.requires) {
      const requirement = upgrade.requires as string;
      if (getUpgradeLevel(requirement) === 0) {
        addNotification({
          id: 'prerequisite',
          message: `Requires ${UPGRADES[requirement as keyof typeof UPGRADES].name}`,
          type: 'error',
          duration: 2000,
        });
        return;
      }
    }

    addUpgrade(upgradeId);
    updateCoins(-upgrade.cost);

    addNotification({
      id: `upgrade-${upgradeId}`,
      message: `Unlocked ${upgrade.name}!`,
      type: 'success',
      duration: 2000,
    });
  };

  const renderUpgradeCard = (
    upgrade: typeof UPGRADES[keyof typeof UPGRADES]
  ) => {
    const level = getUpgradeLevel(upgrade.id);
    const unlocked = canUnlock(upgrade);
    const affordable = canAfford(upgrade);
    const canBuy = canPurchase(upgrade);
    const alreadyOwned = level > 0;

    return (
      <View key={upgrade.id} style={styles.upgradeCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryBadge}>{upgrade.category.toUpperCase()}</Text>
          {alreadyOwned && (
            <Text style={styles.ownedBadge}>✓ Owned</Text>
          )}
        </View>

        <Text style={styles.upgradeName}>{upgrade.name}</Text>
        <Text style={styles.upgradeDescription}>{upgrade.description}</Text>
        <Text style={styles.upgradeEffect}>{upgrade.effect}</Text>

        <View style={styles.upgradeRequirements}>
          <Text style={styles.requirementText}>
            📊 Level {upgrade.level}+
          </Text>
          {!unlocked && (
            <Text style={styles.lockedText}>
              Unlock at Level {upgrade.level}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.upgradeBtn,
            !canBuy && styles.upgradeBtnDisabled,
            alreadyOwned && styles.upgradeBtnOwned,
          ]}
          onPress={() => handlePurchaseUpgrade(upgrade.id)}
          disabled={!canBuy || alreadyOwned}
        >
          <Text style={styles.upgradeBtnText}>
            {alreadyOwned
              ? 'Owned'
              : !unlocked
                ? 'Locked'
                : !affordable
                  ? `${formatNumber(upgrade.cost)} 💰`
                  : `Get for ${formatNumber(upgrade.cost)} 💰`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const upgrades = Object.values(UPGRADES);
  const unlockedCount = upgrades.filter(
    (u) => getUpgradeLevel(u.id) > 0
  ).length;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Upgrades & Tech Tree</Text>
          <Text style={styles.subtitle}>
            Unlocked: {unlockedCount} / {upgrades.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(unlockedCount / upgrades.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Unlock more upgrades to boost your farm!
        </Text>
      </View>

      {/* Upgrades Grid */}
      <View style={styles.upgradesSection}>
        {upgrades.map((upgrade) => renderUpgradeCard(upgrade))}
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <Text style={styles.tipText}>
          • Upgrades are permanent and boost your farm efficiency
        </Text>
        <Text style={styles.tipText}>
          • Some upgrades require prerequisites
        </Text>
        <Text style={styles.tipText}>
          • Level up to unlock new upgrades
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
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2d5016',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  upgradesSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    paddingBottom: 20,
  },
  upgradeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5016',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2d5016',
    backgroundColor: '#f0f8e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ownedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d5016',
  },
  upgradeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  upgradeDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  upgradeEffect: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: '600',
    marginBottom: 10,
  },
  upgradeRequirements: {
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  lockedText: {
    fontSize: 11,
    color: '#d32f2f',
    fontWeight: '600',
  },
  upgradeBtn: {
    backgroundColor: '#2d5016',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeBtnDisabled: {
    backgroundColor: '#ccc',
  },
  upgradeBtnOwned: {
    backgroundColor: '#4caf50',
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
});
