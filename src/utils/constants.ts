// Game Constants and Configuration

// Game Mechanics
export const GAME_CONFIG = {
  // Initial player resources
  STARTING_COINS: 1000,
  STARTING_GEMS: 0,
  STARTING_ENERGY: 100,
  MAX_ENERGY: 100,
  STARTING_LEVEL: 1,

  // Progression
  XP_PER_LEVEL: 100,
  XP_LEVEL_MULTIPLIER: 1.2,

  // Farm limits
  MAX_PLOTS: 50,
  MAX_ANIMALS: 20,
  MAX_STORAGE_CAPACITY: 5000,

  // Energy costs
  ENERGY_COST_PLANT: 2,
  ENERGY_COST_HARVEST: 2,
  ENERGY_COST_FEED_ANIMAL: 1,
  ENERGY_COST_BUILD: 5,

  // Time values (in milliseconds)
  ENERGY_REFILL_TIME: 3600000, // 1 hour
  GAME_TICK_INTERVAL: 5000, // 5 seconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MARKET_UPDATE_INTERVAL: 3600000, // 1 hour
  CONTRACT_GENERATION_TIME: 86400000, // 1 day (24 hours)

  // Weather events
  WEATHER_EVENT_DURATION: 14400000, // 4 hours
  DROUGHT_YIELD_MODIFIER: 0.5,
  RAIN_YIELD_MODIFIER: 1.5,
  PEST_YIELD_MODIFIER: 0.3,

  // Marketplace
  MARKETPLACE_FEE: 0.05, // 5% fee on sells
  PRICE_VOLATILITY: 0.15, // 15% max price change
  MIN_PRICE_MULTIPLIER: 0.5,
  MAX_PRICE_MULTIPLIER: 2.0,
};

// Crop Data
export const CROPS = {
  WHEAT: {
    id: 'wheat',
    name: 'Wheat',
    tier: 1,
    growthTimeSeconds: 180, // 3 minutes
    seedCost: 10,
    harvestValue: 30,
    xpReward: 5,
    unlockedAtLevel: 1,
  },
  CORN: {
    id: 'corn',
    name: 'Corn',
    tier: 1,
    growthTimeSeconds: 240,
    seedCost: 15,
    harvestValue: 50,
    xpReward: 8,
    unlockedAtLevel: 1,
  },
  TOMATO: {
    id: 'tomato',
    name: 'Tomato',
    tier: 1,
    growthTimeSeconds: 300,
    seedCost: 20,
    harvestValue: 75,
    xpReward: 12,
    unlockedAtLevel: 3,
  },
  LETTUCE: {
    id: 'lettuce',
    name: 'Lettuce',
    tier: 2,
    growthTimeSeconds: 200,
    seedCost: 25,
    harvestValue: 100,
    xpReward: 15,
    unlockedAtLevel: 5,
  },
  PUMPKIN: {
    id: 'pumpkin',
    name: 'Pumpkin',
    tier: 2,
    growthTimeSeconds: 600,
    seedCost: 50,
    harvestValue: 250,
    xpReward: 30,
    unlockedAtLevel: 10,
  },
};

// Animal Data
export const ANIMALS = {
  CHICKEN: {
    id: 'chicken',
    name: 'Chicken',
    tier: 1,
    productionTimeSeconds: 120, // 2 minutes
    feedCost: 5,
    productName: 'eggs',
    productValue: 20,
    xpReward: 3,
    unlockedAtLevel: 1,
    maxHealth: 100,
  },
  COW: {
    id: 'cow',
    name: 'Cow',
    tier: 1,
    productionTimeSeconds: 300,
    feedCost: 15,
    productName: 'milk',
    productValue: 60,
    xpReward: 8,
    unlockedAtLevel: 1,
    maxHealth: 150,
  },
  SHEEP: {
    id: 'sheep',
    name: 'Sheep',
    tier: 1,
    productionTimeSeconds: 240,
    feedCost: 10,
    productName: 'wool',
    productValue: 50,
    xpReward: 6,
    unlockedAtLevel: 2,
    maxHealth: 120,
  },
  PIG: {
    id: 'pig',
    name: 'Pig',
    tier: 2,
    productionTimeSeconds: 360,
    feedCost: 20,
    productName: 'pork',
    productValue: 150,
    xpReward: 20,
    unlockedAtLevel: 5,
    maxHealth: 180,
  },
  HORSE: {
    id: 'horse',
    name: 'Horse',
    tier: 2,
    productionTimeSeconds: 600,
    feedCost: 30,
    productName: 'hide',
    productValue: 300,
    xpReward: 40,
    unlockedAtLevel: 10,
    maxHealth: 200,
  },
};

// Building Data
export const BUILDINGS = {
  SILO: {
    id: 'silo',
    name: 'Silo',
    type: 'silo',
    level: 1,
    maxLevel: 5,
    buildCost: 500,
    buildTimeSeconds: 300,
    capacity: 1000,
  },
  MILL: {
    id: 'mill',
    name: 'Mill',
    type: 'mill',
    level: 1,
    maxLevel: 3,
    buildCost: 1000,
    buildTimeSeconds: 600,
    processingRatio: 2, // 2:1 conversion
  },
  MARKET_STALL: {
    id: 'market_stall',
    name: 'Market Stall',
    type: 'market',
    level: 1,
    maxLevel: 1,
    buildCost: 200,
    buildTimeSeconds: 60,
  },
  WAREHOUSE: {
    id: 'warehouse',
    name: 'Warehouse',
    type: 'warehouse',
    level: 1,
    maxLevel: 10,
    buildCost: 750,
    buildTimeSeconds: 450,
    capacity: 1500,
  },
};

// Gem Packages
export const GEM_PACKAGES = [
  { gems: 50, price: 0.99, bonus: 0 },
  { gems: 500, price: 4.99, bonus: 50 },
  { gems: 2500, price: 19.99, bonus: 500 },
  { gems: 6500, price: 49.99, bonus: 1500 },
];

// Notification Types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

// Game States
export enum GameState {
  SPLASH = 'splash',
  LOGIN = 'login',
  HOME = 'home',
  FARM = 'farm',
  MARKET = 'market',
  CONTRACTS = 'contracts',
  SHOP = 'shop',
  SETTINGS = 'settings',
}
