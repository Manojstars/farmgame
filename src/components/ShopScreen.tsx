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
import { useUIStore } from '../store/uiStore';
import { GEM_PACKAGES, GAME_CONFIG } from '../utils/constants';
import { formatNumber } from '../utils/helpers';

export const ShopScreen = () => {
  const player = usePlayerStore((state) => state.player);
  const updateGems = usePlayerStore((state) => state.updateGems);
  const addNotification = useUIStore((state) => state.addNotification);
  const setCurrentScreen = useUIStore((state) => state.setCurrentScreen);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (!player) {
    return (
      <View style={styles.container}>
        <Text>Loading shop...</Text>
      </View>
    );
  }

  const handleBuyGems = (packageId: string) => {
    const pkg = GEM_PACKAGES[packageId as keyof typeof GEM_PACKAGES];
    if (!pkg) return;

    // In production, this would trigger RevenueCat IAP
    // For now, we'll simulate the purchase
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${formatNumber(pkg.gems)} gems for $${(pkg.price / 100).toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Buy',
          onPress: () => {
            updateGems(pkg.gems);
            addNotification({
              id: `purchase-${packageId}`,
              message: `Got ${formatNumber(pkg.gems)} gems! 💎`,
              type: 'success',
              duration: 2000,
            });
          },
        },
      ]
    );
  };

  const renderPackage = (packageId: string, pkg: typeof GEM_PACKAGES[keyof typeof GEM_PACKAGES]) => {
    const isPopular = pkg.gems === 500;
    const bestValue = pkg.pricePerGem === Math.min(...Object.values(GEM_PACKAGES).map(p => p.pricePerGem));

    return (
      <TouchableOpacity
        key={packageId}
        style={[
          styles.packageCard,
          isPopular && styles.popularCard,
        ]}
        onPress={() => handleBuyGems(packageId)}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.gemAmount}>
          <Text style={styles.gemEmoji}>💎</Text>
          <Text style={styles.gemCount}>{formatNumber(pkg.gems)}</Text>
        </View>

        <Text style={styles.gemLabel}>Gems</Text>

        <View style={styles.priceSection}>
          <Text style={styles.price}>${(pkg.price / 100).toFixed(2)}</Text>
          {bestValue && (
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
          )}
        </View>

        <Text style={styles.pricePerGem}>
          ${(pkg.pricePerGem / 1000).toFixed(3)}/gem
        </Text>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => handleBuyGems(packageId)}
        >
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const packages = Object.entries(GEM_PACKAGES);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Gem Shop</Text>
          <Text style={styles.subtitle}>Boost Your Farm</Text>
        </View>
      </View>

      {/* Current Gems */}
      <View style={styles.currentGemsSection}>
        <Text style={styles.currentGemsLabel}>Your Gems</Text>
        <View style={styles.gemsDisplay}>
          <Text style={styles.gemsEmoji}>💎</Text>
          <Text style={styles.gemsCount}>{formatNumber(player.gems)}</Text>
        </View>
      </View>

      {/* Gem Packages */}
      <View style={styles.packagesSection}>
        <Text style={styles.sectionTitle}>Choose Your Pack</Text>
        <View style={styles.packagesGrid}>
          {packages.map(([id, pkg]) => renderPackage(id, pkg))}
        </View>
      </View>

      {/* What Can You Buy? */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Use Gems For:</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Instant Energy</Text>
            <Text style={styles.infoText}>Refill energy bar instantly</Text>
          </View>
          <Text style={styles.infoPrice}>50 💎</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📦</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Storage Expansion</Text>
            <Text style={styles.infoText}>Increase storage capacity</Text>
          </View>
          <Text style={styles.infoPrice}>100 💎</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✨</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Seasonal Pass</Text>
            <Text style={styles.infoText}>Unlock exclusive items & bonuses</Text>
          </View>
          <Text style={styles.infoPrice}>499 💎</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📈</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>XP Booster (24h)</Text>
            <Text style={styles.infoText}>2x XP for 24 hours</Text>
          </View>
          <Text style={styles.infoPrice}>75 💎</Text>
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>FAQ</Text>
        <Text style={styles.faqText}>
          <Text style={styles.faqBold}>Safe & Secure:</Text> All purchases are
          protected by app store security
        </Text>
        <Text style={styles.faqText}>
          <Text style={styles.faqBold}>No Pressure:</Text> The game is fully playable
          without purchases
        </Text>
        <Text style={styles.faqText}>
          <Text style={styles.faqBold}>Best Value:</Text> Larger packages offer better
          per-gem pricing
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
  currentGemsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentGemsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  gemsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gemsEmoji: {
    fontSize: 36,
  },
  gemsCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d5016',
  },
  packagesSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  popularCard: {
    borderColor: '#ffa726',
    backgroundColor: '#fff8f0',
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffa726',
    paddingVertical: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  gemAmount: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  gemEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  gemCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5016',
  },
  gemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5016',
  },
  bestValueBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  pricePerGem: {
    fontSize: 10,
    color: '#999',
    marginBottom: 10,
  },
  buyBtn: {
    width: '100%',
    backgroundColor: '#2d5016',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#2d5016',
  },
  infoIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  infoPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d4a017',
  },
  faqSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  faqText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  faqBold: {
    fontWeight: '700',
    color: '#2d5016',
  },
});
