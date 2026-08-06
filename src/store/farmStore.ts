import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Farm, PlantedCrop, AnimalInstance, BuildingInstance } from '../types/game';

interface FarmStore {
  farm: Farm | null;
  isLoading: boolean;
  setFarm: (farm: Farm) => void;
  addPlantedCrop: (crop: PlantedCrop) => void;
  removePlantedCrop: (id: string) => void;
  harvestCrop: (id: string) => void;
  addAnimal: (animal: AnimalInstance) => void;
  removeAnimal: (id: string) => void;
  updateAnimal: (id: string, updates: Partial<AnimalInstance>) => void;
  updateAnimalHealth: (id: string, health: number) => void;
  addBuilding: (building: BuildingInstance) => void;
  removeBuilding: (id: string) => void;
  updateStorage: (itemName: string, quantity: number) => void;
  addUpgrade: (upgradeId: string) => void;
  clear: () => void;
}

export const useFarmStore = create<FarmStore>()(
  persist(
    (set) => ({
      farm: null,
      isLoading: false,

      setFarm: (farm: Farm) => {
        set({ farm });
      },

      addPlantedCrop: (crop: PlantedCrop) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              plots: [...state.farm.plots, crop],
              updatedAt: Date.now(),
            },
          };
        });
      },

      removePlantedCrop: (id: string) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              plots: state.farm.plots.filter((p) => p.id !== id),
              updatedAt: Date.now(),
            },
          };
        });
      },

      harvestCrop: (id: string) => {
        set((state) => {
          if (!state.farm) return state;
          const crop = state.farm.plots.find((p) => p.id === id);
          if (!crop) return state;

          return {
            farm: {
              ...state.farm,
              plots: state.farm.plots.filter((p) => p.id !== id),
              updatedAt: Date.now(),
            },
          };
        });
      },

      addAnimal: (animal: AnimalInstance) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              animals: [...state.farm.animals, animal],
              updatedAt: Date.now(),
            },
          };
        });
      },

      removeAnimal: (id: string) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              animals: state.farm.animals.filter((a) => a.id !== id),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateAnimal: (id: string, updates: Partial<AnimalInstance>) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              animals: state.farm.animals.map((a) =>
                a.id === id ? { ...a, ...updates } : a
              ),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateAnimalHealth: (id: string, health: number) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              animals: state.farm.animals.map((a) =>
                a.id === id ? { ...a, health } : a
              ),
              updatedAt: Date.now(),
            },
          };
        });
      },

      addBuilding: (building: BuildingInstance) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              buildings: [...state.farm.buildings, building],
              updatedAt: Date.now(),
            },
          };
        });
      },

      removeBuilding: (id: string) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              buildings: state.farm.buildings.filter((b) => b.id !== id),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateStorage: (itemName: string, quantity: number) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              storage: {
                ...state.farm.storage,
                [itemName]: Math.max(0, (state.farm.storage[itemName] || 0) + quantity),
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      addUpgrade: (upgradeId: string) => {
        set((state) => {
          if (!state.farm) return state;
          return {
            farm: {
              ...state.farm,
              upgrades: {
                ...state.farm.upgrades,
                [upgradeId]: (state.farm.upgrades[upgradeId] || 0) + 1,
              },
              updatedAt: Date.now(),
            },
          };
        });
      },

      clear: () => {
        set({ farm: null });
      },
    }),
    {
      name: 'farm-store',
      storage: AsyncStorage,
      version: 1,
    }
  )
);

export default useFarmStore;
