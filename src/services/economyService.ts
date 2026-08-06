// Economy Service
// Contains calculations for game balance, pricing, XP, etc.

export class EconomyService {
  /**
   * Calculate XP needed for next level
   */
  static getXPForNextLevel(currentLevel: number): number {
    return 100 + currentLevel * 50;
  }

  /**
   * Calculate coin reward for harvest
   */
  static calculateHarvestReward(baseValue: number, multiplier: number): number {
    return Math.floor(baseValue * multiplier);
  }

  /**
   * Calculate market price based on supply/demand
   */
  static calculateMarketPrice(
    basePrice: number,
    supplyLevel: number,
    demandLevel: number
  ): number {
    const priceMultiplier = demandLevel / (supplyLevel + 0.1);
    return Math.max(Math.floor(basePrice * priceMultiplier), 1);
  }

  /**
   * Calculate animal feed cost
   */
  static calculateFeedCost(baseCost: number, animalHealth: number, maxHealth: number): number {
    const healthRatio = animalHealth / maxHealth;
    if (healthRatio < 0.5) {
      return Math.floor(baseCost * 2); // 2x cost if very low health
    }
    return baseCost;
  }

  /**
   * Calculate building upgrade cost
   */
  static calculateUpgradeCost(baseCost: number, currentLevel: number): number {
    return Math.floor(baseCost * Math.pow(1.15, currentLevel));
  }

  /**
   * Calculate contract bonus
   */
  static calculateContractBonus(
    baseReward: number,
    timeRemaining: number,
    totalTime: number
  ): number {
    const completionRatio = timeRemaining / totalTime;
    const bonus = completionRatio > 0.5 ? Math.floor(baseReward * 0.2) : 0;
    return baseReward + bonus;
  }

  /**
   * Calculate storage capacity
   */
  static calculateStorageCapacity(baseCapacity: number, upgradeLevel: number): number {
    return baseCapacity + upgradeLevel * 100;
  }

  /**
   * Calculate crop growth time with upgrades applied
   */
  static calculateCropGrowthTime(
    baseGrowthTime: number,
    speedMultiplier: number = 1
  ): number {
    return Math.ceil(baseGrowthTime / speedMultiplier);
  }

  /**
   * Check if player can afford an action
   */
  static canAfford(playerCoins: number, cost: number): boolean {
    return playerCoins >= cost;
  }

  /**
   * Calculate gem pack pricing
   */
  static getGemPackPricing() {
    return [
      { gems: 50, price: 0.99, bestValue: false },
      { gems: 500, price: 4.99, bestValue: true },
      { gems: 2500, price: 19.99, bestValue: false },
      { gems: 6500, price: 49.99, bestValue: false },
    ];
  }
}

export default EconomyService;
