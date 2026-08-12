/**
 * Developer Debug Panel
 * 
 * DEVELOPMENT ONLY - Never shown in production
 * 
 * Provides useful debugging controls for:
 * - Player state inspection
 * - Time manipulation
 * - Economy testing
 * - Firebase status
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { usePlayerStore } from '@store/playerStore';
import { useFarmStore } from '@store/farmStore';
import { useUIStore } from '@store/uiStore';
import { auth } from '@services/firebaseService';

interface DeveloperDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DeveloperDebugPanel: React.FC<DeveloperDebugPanelProps> = ({
  visible,
  onClose,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Store selectors
  const player = usePlayerStore((state) => ({
    uid: state.player?.uid || '',
    level: state.player?.level || 0,
    xp: state.player?.xp || 0,
    coins: state.player?.coins || 0,
    gems: state.player?.gems || 0,
    energy: state.player?.energy || 0,
  }));

  const playerActions = usePlayerStore((state) => ({
    updateCoins: state.updateCoins,
    updateGems: state.updateGems,
    updateXP: state.updateXP,
    updateEnergy: state.updateEnergy,
  }));

  const farm = useFarmStore((state) => ({
    plots: state.farm?.plots || [],
    animals: state.farm?.animals || [],
    buildings: state.farm?.buildings || [],
  }));

  const farmActions = useFarmStore((state) => ({
    harvestCrop: state.harvestCrop,
    updateAnimal: state.updateAnimal,
  }));

  const resetGameState = () => {
    Alert.alert('Reset Game State', 'Clear all local game data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          // Clear all Zustand stores
          usePlayerStore.getState().clear?.();
          useFarmStore.getState().clear?.();
          useUIStore.getState().clear?.();
          Alert.alert('Success', 'Game state reset');
        },
      },
    ]);
  };

  const addTestCoins = (amount: number) => {
    playerActions.updateCoins(amount);
    Alert.alert('Success', `Added ${amount} coins`);
  };

  const addTestGems = (amount: number) => {
    playerActions.updateGems(amount);
    Alert.alert('Success', `Added ${amount} gems`);
  };

  const addTestXP = (amount: number) => {
    playerActions.updateXP(amount);
    Alert.alert('Success', `Added ${amount} XP`);
  };

  const restoreEnergy = () => {
    playerActions.updateEnergy(100 - (player.energy || 0));
    Alert.alert('Success', 'Energy fully restored');
  };

  const completeAllCrops = () => {
    farm.plots.forEach((plot) => {
      farmActions.harvestCrop(plot.id);
    });
    Alert.alert('Success', `Completed ${farm.plots.length} crops`);
  };

  const completeAllAnimals = () => {
    farm.animals.forEach((animal) => {
      farmActions.updateAnimal(animal.id, {
        nextProduction: Date.now(),
      });
    });
    Alert.alert('Success', `Completed ${farm.animals.length} animal productions`);
  };

  const Section: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => {
    const isExpanded = expandedSection === title;

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() =>
            setExpandedSection(isExpanded ? null : title)
          }
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        {isExpanded && <View style={styles.sectionContent}>{children}</View>}
      </View>
    );
  };

  const DebugButton: React.FC<{
    title: string;
    onPress: () => void;
    danger?: boolean;
  }> = ({ title, onPress, danger = false }) => (
    <TouchableOpacity
      style={[styles.button, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, danger && styles.dangerButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StatRow: React.FC<{
    label: string;
    value: string | number;
  }> = ({ label, value }) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}:</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Developer Debug Panel</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Player Section */}
          <Section title="PLAYER">
            <StatRow label="UID" value={player.uid || 'N/A'} />
            <StatRow label="Level" value={player.level} />
            <StatRow label="XP" value={player.xp} />
            <StatRow label="Coins" value={player.coins} />
            <StatRow label="Gems" value={player.gems} />
            <StatRow label="Energy" value={`${player.energy}/100`} />

            <DebugButton
              title="Add 100 Coins"
              onPress={() => addTestCoins(100)}
            />
            <DebugButton
              title="Add 50 Gems"
              onPress={() => addTestGems(50)}
            />
            <DebugButton
              title="Add 1000 XP"
              onPress={() => addTestXP(1000)}
            />
            <DebugButton title="Restore Energy" onPress={restoreEnergy} />
          </Section>

          {/* Farm Section */}
          <Section title="FARM">
            <StatRow label="Plots" value={farm.plots.length} />
            <StatRow label="Animals" value={farm.animals.length} />
            <StatRow label="Buildings" value={farm.buildings.length} />

            <DebugButton
              title={`Complete All Crops (${farm.plots.length})`}
              onPress={completeAllCrops}
            />
            <DebugButton
              title={`Complete All Animals (${farm.animals.length})`}
              onPress={completeAllAnimals}
            />
          </Section>

          {/* Firebase Section */}
          <Section title="FIREBASE">
            <StatRow
              label="Auth"
              value={auth.currentUser ? 'Connected' : 'Not authenticated'}
            />
            <StatRow
              label="User Email"
              value={auth.currentUser?.email || 'N/A'}
            />

            <DebugButton
              title="View Auth State"
              onPress={() => {
                Alert.alert(
                  'Auth State',
                  `Email: ${auth.currentUser?.email}\nUID: ${auth.currentUser?.uid}`
                );
              }}
            />
          </Section>

          {/* Environment Section */}
          <Section title="ENVIRONMENT">
            <StatRow label="Environment" value={process.env.APP_ENV || 'unknown'} />
            <StatRow
              label="Debug Mode"
              value={process.env.DEBUG_MODE === 'true' ? 'ON' : 'OFF'}
            />
            <StatRow
              label="Dev Panel"
              value={__DEV__ ? 'ENABLED' : 'DISABLED'}
            />
          </Section>

          {/* Destructive Actions */}
          <Section title="DESTRUCTIVE">
            <Text style={styles.warningText}>
              ⚠️ These actions cannot be undone
            </Text>

            <DebugButton
              title="Reset All Local State"
              onPress={resetGameState}
              danger
            />
            <DebugButton
              title="Sign Out"
              onPress={() => {
                Alert.alert('Sign Out', 'Sign out current user?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => auth.signOut(),
                  },
                ]);
              }}
              danger
            />
          </Section>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Debug Panel • Development Only
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  panel: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4da6ff',
  },
  expandIcon: {
    color: '#4da6ff',
    fontSize: 12,
  },
  sectionContent: {
    padding: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
  },
  statValue: {
    color: '#4da6ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4da6ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#d9534f',
  },
  dangerButtonText: {
    color: '#fff',
  },
  warningText: {
    color: '#f0ad4e',
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1e1e1e',
  },
  footerText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
  },
});
