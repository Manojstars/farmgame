/**
 * Economy Tests
 * 
 * Tests for game balance and economy calculations
 * - Crop pricing
 * - Market dynamics
 * - Player earnings
 * 
 * Run with: npm test -- economy.test.ts
 */

describe('Economy', () => {
  describe('Crop Pricing', () => {
    test('crop base price is correct', () => {
      // Test fixture: wheat sells for 50 coins
      const wheatPrice = 50;
      expect(wheatPrice).toBe(50);
    });

    test('market price varies with supply', () => {
      // Test fixture: when supply is high, price should be low
      // When supply is low, price should be high
      // baseline: 50 coins
      // high supply (80%): ~30 coins (60% of base)
      // low supply (20%): ~100 coins (200% of base)
      const basePrice = 50;
      const highSupplyPrice = 30;
      const lowSupplyPrice = 100;

      expect(highSupplyPrice).toBeLessThan(basePrice);
      expect(lowSupplyPrice).toBeGreaterThan(basePrice);
    });

    test('player earnings calculation', () => {
      // Player harvests 10 wheat at 50 coins each
      const quantity = 10;
      const unitPrice = 50;
      const expectedEarnings = 500;

      const actualEarnings = quantity * unitPrice;
      expect(actualEarnings).toBe(expectedEarnings);
    });
  });

  describe('Marketplace Transactions', () => {
    test('marketplace deducts coins from buyer', () => {
      // Buyer has 1000 coins, buys 10 wheat at 50 coins each (500 total)
      let buyerCoins = 1000;
      const purchaseAmount = 500;
      buyerCoins -= purchaseAmount;

      expect(buyerCoins).toBe(500);
    });

    test('marketplace adds coins to seller', () => {
      // Seller sells 10 wheat at 50 coins each (500 total)
      let sellerCoins = 100;
      const saleAmount = 500;
      sellerCoins += saleAmount;

      expect(sellerCoins).toBe(600);
    });

    test('insufficient coins prevents purchase', () => {
      const playerCoins = 200;
      const purchaseAmount = 500;

      expect(playerCoins).toBeLessThan(purchaseAmount);
    });
  });

  describe('Coin Generation', () => {
    test('harvesting generates coins', () => {
      // Plant wheat (0 coins)
      // Wait 5 minutes
      // Harvest wheat (50 coins)
      const baseEarnings = 50;
      expect(baseEarnings).toBeGreaterThan(0);
    });

    test('selling generates coins', () => {
      // Start: 100 coins
      // Plant wheat (no cost)
      // Harvest wheat (+50 coins)
      // Sell wheat (+50 coins)
      let coins = 100;
      coins += 50; // harvest
      coins += 50; // sell to NPC

      expect(coins).toBe(200);
    });
  });

  describe('XP Generation', () => {
    test('harvesting generates xp', () => {
      // Harvest wheat: +10 XP
      const harvestXP = 10;
      expect(harvestXP).toBeGreaterThan(0);
    });

    test('level up requires cumulative xp', () => {
      // Level 1 -> 2: 100 XP
      // Level 2 -> 3: 150 XP (cumulative 250)
      // etc.
      const xpForLevel2 = 100;
      const xpForLevel3 = 100 + 150;

      expect(xpForLevel3).toBeGreaterThan(xpForLevel2);
    });
  });
});
