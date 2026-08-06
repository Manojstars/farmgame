import create from 'zustand';
import { remoteConfig } from '../services/firebaseService';

interface GameConfig {
  cropGrowthSpeedMultiplier: number;
  animalProductionSpeedMultiplier: number;
  coinEarningMultiplier: number;
  xpEarningMultiplier: number;
  energyRegenerationRate: number;
  maxEnergyRefillTime: number;
  startingCoins: number;
  startingEnergy: number;
  storageCapacity: number;
}

interface RemoteConfigStore {
  config: GameConfig;
  isLoading: boolean;
  fetchConfig: () => Promise<void>;
  getConfigValue: (key: string, defaultValue: any) => any;
}

const defaultConfig: GameConfig = {
  cropGrowthSpeedMultiplier: 1,
  animalProductionSpeedMultiplier: 1,
  coinEarningMultiplier: 1,
  xpEarningMultiplier: 1,
  energyRegenerationRate: 1,
  maxEnergyRefillTime: 3600, // 1 hour
  startingCoins: 1000,
  startingEnergy: 100,
  storageCapacity: 500,
};

export const useRemoteConfigStore = create<RemoteConfigStore>((set) => ({
  config: defaultConfig,
  isLoading: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      await remoteConfig.fetchAndActivate();

      const config: GameConfig = {
        cropGrowthSpeedMultiplier:
          parseFloat(remoteConfig.getValue('cropGrowthSpeedMultiplier').asString()) ||
          defaultConfig.cropGrowthSpeedMultiplier,
        animalProductionSpeedMultiplier:
          parseFloat(remoteConfig.getValue('animalProductionSpeedMultiplier').asString()) ||
          defaultConfig.animalProductionSpeedMultiplier,
        coinEarningMultiplier:
          parseFloat(remoteConfig.getValue('coinEarningMultiplier').asString()) ||
          defaultConfig.coinEarningMultiplier,
        xpEarningMultiplier:
          parseFloat(remoteConfig.getValue('xpEarningMultiplier').asString()) ||
          defaultConfig.xpEarningMultiplier,
        energyRegenerationRate:
          parseFloat(remoteConfig.getValue('energyRegenerationRate').asString()) ||
          defaultConfig.energyRegenerationRate,
        maxEnergyRefillTime:
          parseInt(remoteConfig.getValue('maxEnergyRefillTime').asString()) ||
          defaultConfig.maxEnergyRefillTime,
        startingCoins:
          parseInt(remoteConfig.getValue('startingCoins').asString()) ||
          defaultConfig.startingCoins,
        startingEnergy:
          parseInt(remoteConfig.getValue('startingEnergy').asString()) ||
          defaultConfig.startingEnergy,
        storageCapacity:
          parseInt(remoteConfig.getValue('storageCapacity').asString()) ||
          defaultConfig.storageCapacity,
      };

      set({ config, isLoading: false });
    } catch (error) {
      console.error('Error fetching remote config:', error);
      set({ config: defaultConfig, isLoading: false });
    }
  },

  getConfigValue: (key: string, defaultValue: any) => {
    return (useRemoteConfigStore.getState().config as any)[key] || defaultValue;
  },
}));

export default useRemoteConfigStore;
