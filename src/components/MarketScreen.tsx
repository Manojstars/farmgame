import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SectionList,
} from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { CROPS, ANIMALS } from '../utils/constants';
import { economyService } from '../services/economyService';
import { formatNumber } from '../utils/helpers';

export const MarketScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);
  const listings = useMarketStore((state) => state.listings);
  const updateStorage = useFarmStore((state) => state.updateStorage);
  const updateCoins = usePlayerStore((state) => state.updateCoins);
  const updateXP = usePlayerStore((state) => state.updateXP);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  const [filter, setFilter] = useState<'all' | 'selling' | 'buying'>('all');

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading marketplace...</Text>
      </View>
    );
  }

  const handleSellItem = (itemName: string, quantity: number) => {
    const itemQty = farm.storage[itemName] || 0;
    if (itemQty < quantity) {
      addNotification({
        id: 'insufficient-items',
        message: 'Not enough items to sell',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    // Calculate sale price (base price + market fluctuation)
    const cropInfo = Object.values(CROPS).find(c => c.name === itemName);
    const animalInfo = Object.values(ANIMALS).find(a => a.productName === itemName);
    const basePrice = cropInfo ? cropInfo.harvestValue : animalInfo?.productionValue || 100;
    
    const salePrice = Math.round(basePrice * quantity * 0.95); // 5% marketplace fee

    updateStorage(itemName, -quantity);
    updateCoins(salePrice);
    updateXP(Math.round(quantity * 10));

    addNotification({
      id: 'sale-success',
      message: `Sold ${quantity}x ${itemName} for ${formatNumber(salePrice)} coins!`,
      type: 'success',
      duration: 2000,
    });
  };

  const handleBuyItem = (itemName: string, price: number, quantity: number = 1) => {
    const totalCost = price * quantity;
    if (player.coins < totalCost) {
      addNotification({
        id: 'insufficient-coins',
        message: 'Not enough coins',
        type: 'error',
        duration: 2000,
      });
      return;
    }

    updateCoins(-totalCost);
    updateStorage(itemName, quantity);
    updateXP(Math.round(quantity * 5));

    addNotification({
      id: 'buy-success',
      message: `Bought ${quantity}x ${itemName} for ${formatNumber(totalCost)} coins!`,
      type: 'success',
      duration: 2000,
    });
  };

  const getItemPrice = (itemName: string) => {
    const cropInfo = Object.values(CROPS).find(c => c.name === itemName);
    const animalInfo = Object.values(ANIMALS).find(a => a.productName === itemName);
    return cropInfo ? cropInfo.harvestValue : animalInfo?.productionValue || 100;
  };

  // Get inventory items for selling
  const inventoryItems = Object.entries(farm.storage)
    .filter(([_, qty]) => qty > 0)
    .map(([name, qty]) => ({
      name,
      qty,
      basePrice: getItemPrice(name),
      salePrice: Math.round(getItemPrice(name) * 0.95),
    }));

  // Available items to buy
  const availableItems = [
    ...Object.values(CROPS).slice(0, 3),
    ...Object.values(ANIMALS).map(a => ({ name: a.productName, value: a.productionValue })),
  ].map(item => ({
    name: 'name' in item ? item.name : item.name,
    price: 'value' in item ? item.value : 'harvestValue' in item ? item.harvestValue : 100,
  }));

  const sections = [
    {
      title: 'Your Items (Sell)',
      data: inventoryItems.map(item => ({
        ...item,
        type: 'sell',
      })),
    },
    {
      title: 'Marketplace (Buy)',
      data: availableItems.map(item => ({
        ...item,
        type: 'buy',
        price: Math.round(item.price * 1.1), // 10% markup on market
      })),
    },
  ];

  const renderItem = ({ item }: any) => {
    if (item.type === 'sell') {
      return (
        <View style={styles.itemCard}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>Available: {item.qty}</Text>
            <Text style={styles.priceText}>
              Base: {formatNumber(item.basePrice)} → Sell: {formatNumber(item.salePrice)} 💰
            </Text>
          </View>
          <TouchableOpacity
            style={styles.sellBtn}
            onPress={() => handleSellItem(item.name, 1)}
          >
            <Text style={styles.btnText}>Sell 1</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.priceText}>Price: {formatNumber(item.price)} 💰</Text>
        </View>
        <TouchableOpacity
          style={[styles.buyBtn, player.coins < item.price && styles.btnDisabled]}
          onPress={() => handleBuyItem(item.name, item.price, 1)}
          disabled={player.coins < item.price}
        >
          <Text style={styles.btnText}>Buy 1</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Buy & Sell Items</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'selling' && styles.filterBtnActive]}
          onPress={() => setFilter('selling')}
        >
          <Text style={styles.filterText}>📤 Selling ({inventoryItems.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'buying' && styles.filterBtnActive]}
          onPress={() => setFilter('buying')}
        >
          <Text style={styles.filterText}>📥 Buying</Text>
        </TouchableOpacity>
      </View>

      {/* Market List */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.name + index}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        style={styles.list}
      />
    </View>
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#2d5016',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d5016',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#2d5016',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  priceText: {
    fontSize: 12,
    color: '#d4a017',
    fontWeight: '600',
    marginTop: 3,
  },
  sellBtn: {
    backgroundColor: '#2d5016',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyBtn: {
    backgroundColor: '#ffa726',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
