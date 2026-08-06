import React from 'react';
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
import { CROPS, ANIMALS } from '../utils/constants';
import { formatNumber } from '../utils/helpers';

export const InventoryScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const updateStorage = useFarmStore((state) => state.updateStorage);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading inventory...</Text>
      </View>
    );
  }

  const getStorageUsed = () => {
    return Object.values(farm.storage).reduce((sum, qty) => sum + qty, 0);
  };

  const getStorageCapacity = () => {
    return 1000; // Base capacity, would be calculated with building upgrades
  };

  const getCropCount = (itemName: string) => {
    return farm.storage[itemName] || 0;
  };

  const renderInventoryItem = (itemName: string, quantity: number) => {
    if (quantity === 0) return null;

    // Find crop info
    const cropInfo = Object.values(CROPS).find(c => c.name === itemName);
    const animalInfo = Object.values(ANIMALS).find(a => a.productName === itemName);

    const info = cropInfo || animalInfo;
    const value = info ? (cropInfo ? cropInfo.harvestValue : animalInfo!.productionValue) : 0;

    return (
      <View key={itemName} style={styles.inventoryItem}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemEmoji}>
            {cropInfo ? '🌾' : animalInfo ? '📦' : '📦'}
          </Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{itemName}</Text>
            <Text style={styles.itemQuality}>
              {formatNumber(quantity)} × {formatNumber(value)} 💰
            </Text>
          </View>
        </View>
        <Text style={styles.itemValue}>
          {formatNumber(quantity * value)} 💰
        </Text>
      </View>
    );
  };

  const storageUsed = getStorageUsed();
  const storageCapacity = getStorageCapacity();
  const totalValue = Object.entries(farm.storage).reduce((sum, [item, qty]) => {
    const cropInfo = Object.values(CROPS).find(c => c.name === item);
    const animalInfo = Object.values(ANIMALS).find(a => a.productName === item);
    const value = cropInfo ? cropInfo.harvestValue : animalInfo?.productionValue || 0;
    return sum + qty * value;
  }, 0);

  const items = Object.entries(farm.storage)
    .filter(([_, qty]) => qty > 0)
    .sort(([aItem, aQty], [bItem, bQty]) => {
      const aValue = aQty * ((Object.values(CROPS).find(c => c.name === aItem)?.harvestValue || 0) || (Object.values(ANIMALS).find(a => a.productName === aItem)?.productionValue || 0));
      const bValue = bQty * ((Object.values(CROPS).find(c => c.name === bItem)?.harvestValue || 0) || (Object.values(ANIMALS).find(a => a.productName === bItem)?.productionValue || 0));
      return bValue - aValue;
    });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Your Inventory</Text>
          <Text style={styles.subtitle}>
            {items.length > 0 ? `${items.length} item type(s)` : 'Empty'}
          </Text>
        </View>
      </View>

      {/* Storage Status */}
      <View style={styles.storageSection}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.storageInfo}>
          <View style={styles.storageStats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Used</Text>
              <Text style={styles.statValue}>{formatNumber(storageUsed)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Capacity</Text>
              <Text style={styles.statValue}>{formatNumber(storageCapacity)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Value</Text>
              <Text style={styles.statValue}>{formatNumber(totalValue)}</Text>
            </View>
          </View>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageFill,
                {
                  width: `${Math.min(100, (storageUsed / storageCapacity) * 100)}%`,
                  backgroundColor:
                    (storageUsed / storageCapacity) > 0.9
                      ? '#d32f2f'
                      : (storageUsed / storageCapacity) > 0.7
                        ? '#ffa726'
                        : '#2d5016',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Inventory Items */}
      <View style={styles.inventorySection}>
        <Text style={styles.sectionTitle}>Items</Text>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Your inventory is empty</Text>
            <Text style={styles.emptySubtext}>
              Plant crops and produce items from animals to fill it up!
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map(([itemName, quantity]) =>
              renderInventoryItem(itemName, quantity)
            )}
          </View>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Inventory Tips</Text>
        <Text style={styles.tipText}>
          📊 Items have value - higher rarity items worth more coins
        </Text>
        <Text style={styles.tipText}>
          🏢 Build warehouses and silos to increase storage capacity
        </Text>
        <Text style={styles.tipText}>
          💰 Sell items on the marketplace for variable prices
        </Text>
        <Text style={styles.tipText}>
          🎁 Complete contracts to earn bonus rewards
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
    gap: 12,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d5016',
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
  inventorySection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  itemsList: {
    gap: 10,
  },
  inventoryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2d5016',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  itemQuality: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d4a017',
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
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
});
