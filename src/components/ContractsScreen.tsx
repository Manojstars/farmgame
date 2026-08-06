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
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { formatNumber, formatTimeRemaining } from '../utils/helpers';
import type { Contract } from '../types/game';

export const ContractsScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const contracts = useMarketStore((state) => state.activeContracts);
  const completeContract = useMarketStore((state) => state.completeContract);
  const updateStorage = useFarmStore((state) => state.updateStorage);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateXP = usePlayerStore((state) => state.updateXP);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading contracts...</Text>
      </View>
    );
  }

  const handleCompleteContract = (contract: Contract) => {
    // Check if player has required items
    const itemQty = farm.storage[contract.itemName] || 0;
    if (itemQty < contract.quantity) {
      addNotification({
        id: 'insufficient-items',
        message: `You need ${contract.quantity} ${contract.itemName}`,
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Check if contract is still valid (not expired)
    const now = Date.now();
    if (now > contract.expiresAt) {
      addNotification({
        id: 'contract-expired',
        message: 'This contract has expired',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Complete contract
    updateStorage(contract.itemName, -contract.quantity);
    updateCoins(contract.reward);
    updateXP(contract.xpReward);
    completeContract(contract.id);

    addNotification({
      id: 'contract-complete',
      message: `Contract complete! +${formatNumber(contract.reward)} coins!`,
      type: 'success',
      duration: 2000,
    });
  };

  const now = Date.now();
  const active = contracts.filter((c) => now < c.expiresAt);
  const expired = contracts.filter((c) => now >= c.expiresAt);

  const renderContractCard = (contract: Contract, isExpired: boolean = false) => {
    const itemQty = farm.storage[contract.itemName] || 0;
    const hasItems = itemQty >= contract.quantity;
    const timeRemaining = contract.expiresAt - now;

    return (
      <View
        key={contract.id}
        style={[
          styles.contractCard,
          isExpired && styles.expiredCard,
          !hasItems && styles.lockedCard,
        ]}
      >
        <View style={styles.contractHeader}>
          <Text style={styles.contractTitle}>{contract.description}</Text>
          {hasItems && !isExpired && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Ready</Text>
            </View>
          )}
          {isExpired && (
            <View style={[styles.statusBadge, styles.expiredBadge]}>
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}
        </View>

        <View style={styles.contractDetails}>
          <Text style={styles.detail}>
            📦 Need: {contract.quantity} × {contract.itemName} (Have: {itemQty})
          </Text>
          <Text style={styles.detail}>
            💰 Reward: {formatNumber(contract.reward)} coins
          </Text>
          <Text style={styles.detail}>
            ⭐ XP: {contract.xpReward}
          </Text>
          {!isExpired && (
            <Text style={styles.timeText}>
              ⏱️ {formatTimeRemaining(timeRemaining)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.completeBtn,
            (!hasItems || isExpired) && styles.completeBtnDisabled,
          ]}
          onPress={() => handleCompleteContract(contract)}
          disabled={!hasItems || isExpired}
        >
          <Text style={styles.btnText}>
            {isExpired ? 'Expired' : hasItems ? 'Complete' : 'Missing Items'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Daily Contracts</Text>
          <Text style={styles.subtitle}>Complete orders for rewards</Text>
        </View>
      </View>

      {/* Active Contracts */}
      {active.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Contracts ({active.length})</Text>
          {active.map((contract) => renderContractCard(contract, false))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No active contracts</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new opportunities!
          </Text>
        </View>
      )}

      {/* Expired Contracts */}
      {expired.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired Contracts</Text>
          {expired.map((contract) => renderContractCard(contract, true))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <Text style={styles.tipText}>
          💡 Check contracts regularly for new opportunities
        </Text>
        <Text style={styles.tipText}>
          ⏰ Contracts expire - complete them before time runs out
        </Text>
        <Text style={styles.tipText}>
          🎁 Contract rewards vary based on difficulty and rarity
        </Text>
        <Text style={styles.tipText}>
          ⭐ Complete contracts to level up faster
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
  section: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2d5016',
  },
  expiredCard: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  lockedCard: {
    backgroundColor: '#fff8f0',
    borderLeftColor: '#ffa726',
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#2d5016',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  expiredBadge: {
    backgroundColor: '#d32f2f',
  },
  expiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  contractDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detail: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: '600',
  },
  completeBtn: {
    backgroundColor: '#2d5016',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeBtnDisabled: {
    backgroundColor: '#ccc',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tipsSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
});
