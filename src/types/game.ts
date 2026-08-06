// Game Resource Types
export interface Player {
  uid: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefill: number;
  inventory: Record<string, number>;
  lastLogin: number;
  createdAt: number;
  updatedAt: number;
}

export interface Crop {
  id: string;
  name: string;
  tier: number;
  growthTimeSeconds: number;
  seedCost: number;
  harvestValue: number;
  xpReward: number;
  unlockedAtLevel: number;
}

export interface PlantedCrop {
  id: string;
  cropId: string;
  plantedAt: number;
  harvestAt: number;
  plotIndex: number;
}

export interface Animal {
  id: string;
  name: string;
  tier: number;
  productionTimeSeconds: number;
  feedCost: number;
  productName: string;
  productValue: number;
  xpReward: number;
  unlockedAtLevel: number;
  maxHealth: number;
}

export interface AnimalInstance {
  id: string;
  animalId: string;
  slotIndex: number;
  health: number;
  lastProduction: number;
  nextProduction: number;
  lastFed: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'silo' | 'mill' | 'market' | 'warehouse';
  level: number;
  maxLevel: number;
  buildCost: number;
  buildTimeSeconds: number;
  capacity?: number;
  processingRatio?: number;
}

export interface BuildingInstance {
  buildingId: string;
  level: number;
  builtAt: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  type: 'crop_speed' | 'animal_speed' | 'auto_harvest' | 'more_plots' | 'more_animals' | 'staff';
  level: number;
  maxLevel: number;
  cost: number;
  costType: 'coins' | 'gems';
  effect: Record<string, number>;
}

export interface Contract {
  id: string;
  itemName: string;
  quantity: number;
  dueAt: number;
  reward: number;
  completed: boolean;
}

export interface MarketListing {
  id: string;
  itemName: string;
  basePrice: number;
  currentPrice: number;
  supplyLevel: number;
  demandLevel: number;
  lastUpdated: number;
}

export interface Farm {
  uid: string;
  plots: PlantedCrop[];
  maxPlots: number;
  animals: AnimalInstance[];
  maxAnimals: number;
  buildings: Record<string, BuildingInstance>;
  upgrades: Record<string, number>;
  storage: Record<string, number>;
  maxStorage: number;
  lastSync: number;
  updatedAt: number;
}

export interface GameState {
  player: Player;
  farm: Farm;
  marketListings: MarketListing[];
  activeContracts: Contract[];
  completedContracts: Contract[];
}

export interface WeatherEvent {
  type: 'drought' | 'rain' | 'pest';
  startTime: number;
  endTime: number;
  modifier: number;
  description: string;
}

export interface Transaction {
  uid: string;
  type: 'sell' | 'buy' | 'craft' | 'build' | 'upgrade';
  itemName: string;
  quantity: number;
  amountCoins?: number;
  amountGems?: number;
  timestamp: number;
}
