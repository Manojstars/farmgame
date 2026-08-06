import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarketListing, Contract } from '../types/game';

interface MarketStore {
  marketListings: MarketListing[];
  activeContracts: Contract[];
  completedContracts: Contract[];
  isLoading: boolean;
  setMarketListings: (listings: MarketListing[]) => void;
  updateMarketPrice: (itemName: string, newPrice: number) => void;
  setActiveContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  completeContract: (contractId: string) => void;
  clear: () => void;
}

export const useMarketStore = create<MarketStore>()(
  persist(
    (set) => ({
      marketListings: [],
      activeContracts: [],
      completedContracts: [],
      isLoading: false,

      setMarketListings: (listings: MarketListing[]) => {
        set({ marketListings: listings });
      },

      updateMarketPrice: (itemName: string, newPrice: number) => {
        set((state) => ({
          marketListings: state.marketListings.map((listing) =>
            listing.itemName === itemName
              ? { ...listing, currentPrice: newPrice, lastUpdated: Date.now() }
              : listing
          ),
        }));
      },

      setActiveContracts: (contracts: Contract[]) => {
        set({ activeContracts: contracts });
      },

      addContract: (contract: Contract) => {
        set((state) => ({
          activeContracts: [...state.activeContracts, contract],
        }));
      },

      completeContract: (contractId: string) => {
        set((state) => {
          const contract = state.activeContracts.find((c) => c.id === contractId);
          if (!contract) return state;

          return {
            activeContracts: state.activeContracts.filter((c) => c.id !== contractId),
            completedContracts: [
              ...state.completedContracts,
              { ...contract, completed: true },
            ],
          };
        });
      },

      clear: () => {
        set({
          marketListings: [],
          activeContracts: [],
          completedContracts: [],
        });
      },
    }),
    {
      name: 'market-store',
      storage: AsyncStorage,
      version: 1,
    }
  )
);

export default useMarketStore;
