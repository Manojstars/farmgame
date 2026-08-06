import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player } from '../types/game';

interface PlayerStore {
  player: Player | null;
  isLoading: boolean;
  setPlayer: (player: Player) => void;
  updateCoins: (amount: number) => void;
  updateGems: (amount: number) => void;
  updateEnergy: (amount: number) => void;
  updateXP: (amount: number) => void;
  levelUp: () => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      player: null,
      isLoading: false,

      setPlayer: (player: Player) => {
        set({ player });
      },

      updateCoins: (amount: number) => {
        set((state) => {
          if (!state.player) return state;
          return {
            player: {
              ...state.player,
              coins: Math.max(0, state.player.coins + amount),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateGems: (amount: number) => {
        set((state) => {
          if (!state.player) return state;
          return {
            player: {
              ...state.player,
              gems: Math.max(0, state.player.gems + amount),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateEnergy: (amount: number) => {
        set((state) => {
          if (!state.player) return state;
          return {
            player: {
              ...state.player,
              energy: Math.min(
                state.player.maxEnergy,
                Math.max(0, state.player.energy + amount)
              ),
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateXP: (amount: number) => {
        set((state) => {
          if (!state.player) return state;
          return {
            player: {
              ...state.player,
              xp: state.player.xp + amount,
              updatedAt: Date.now(),
            },
          };
        });
      },

      levelUp: () => {
        set((state) => {
          if (!state.player) return state;
          return {
            player: {
              ...state.player,
              level: state.player.level + 1,
              xp: 0,
              xpToNextLevel: state.player.xpToNextLevel + 100,
              updatedAt: Date.now(),
            },
          };
        });
      },

      clear: () => {
        set({ player: null });
      },
    }),
    {
      name: 'player-store',
      storage: AsyncStorage,
      version: 1,
    }
  )
);

export default usePlayerStore;
