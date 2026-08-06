// Offline Progress Service
// Calculates game state changes that occurred while the app was closed

import { functions } from '../services/firebaseService';
import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';

interface OfflineProgressResult {
  cropsHarvested: number;
  goodsProduced: number;
  coinsEarned: number;
  energyRestored: number;
  contractsExpired: number;
}

export class OfflineProgressService {
  /**
   * Call Cloud Function to calculate offline progress
   * This prevents client-side time manipulation cheating
   */
  async calculateOfflineProgress(lastLoginTime: number): Promise<OfflineProgressResult> {
    try {
      const callable = functions().httpsCallable('calculateOfflineProgress');
      const result = await callable({
        lastLoginTime,
        currentTime: Date.now(),
      });

      return result.data as OfflineProgressResult;
    } catch (error) {
      console.error('Error calculating offline progress:', error);
      return {
        cropsHarvested: 0,
        goodsProduced: 0,
        coinsEarned: 0,
        energyRestored: 0,
        contractsExpired: 0,
      };
    }
  }

  /**
   * Apply offline progress results to local store
   */
  applyOfflineProgress(result: OfflineProgressResult) {
    const playerStore = usePlayerStore.getState();
    const farmStore = useFarmStore.getState();

    // Apply coin and energy updates
    if (result.coinsEarned > 0) {
      playerStore.updateCoins(result.coinsEarned);
    }

    if (result.energyRestored > 0) {
      playerStore.updateEnergy(result.energyRestored);
    }

    // Note: Farm state updates (crops harvested, goods produced) should come from Firestore
    // This service mainly handles calculation validation on the server
  }

  /**
   * Full offline sync flow
   */
  async syncOfflineProgress() {
    const player = usePlayerStore.getState().player;
    if (!player) return;

    const lastLoginTime = player.lastLogin;
    const result = await this.calculateOfflineProgress(lastLoginTime);
    this.applyOfflineProgress(result);

    // Update last login time
    usePlayerStore.getState().setPlayer({
      ...player,
      lastLogin: Date.now(),
    });
  }
}

export const offlineProgressService = new OfflineProgressService();
