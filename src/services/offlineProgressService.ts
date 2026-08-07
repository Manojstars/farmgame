/**
 * Offline Progress Service (V1 - Client-Side)
 * 
 * Calculates what the player earned while offline
 * All calculations are client-side to stay on Spark (free) plan
 * No Cloud Functions needed for V1
 */

import { firestore, auth } from './firebaseService';
import { playerStore } from '../store/playerStore';

interface OfflineProgressResult {
  cropsHarvested: number;
  coinsEarned: number;
  energyRestored: number;
  elapsedMinutes: number;
}

export class OfflineProgressService {
  /**
   * Calculate offline progress client-side
   * No server call needed - all logic is local
   */
  async calculateOfflineProgress(lastLoginTime: number): Promise<OfflineProgressResult> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        return {
          cropsHarvested: 0,
          coinsEarned: 0,
          energyRestored: 0,
          elapsedMinutes: 0,
        };
      }

      // Fetch player from Firestore to get last sync time
      const playerRef = firestore.collection('players').doc(userId);
      const playerSnap = await playerRef.get();

      if (!playerSnap.exists) {
        return {
          cropsHarvested: 0,
          coinsEarned: 0,
          energyRestored: 0,
          elapsedMinutes: 0,
        };
      }

      const playerData = playerSnap.data() as any;
      const lastSync = playerData.lastSyncAt?.toDate() || new Date();
      const now = new Date();
      const elapsedSeconds = (now.getTime() - lastSync.getTime()) / 1000;
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);

      // Calculate energy regeneration (5% per hour)
      const maxEnergy = playerData.maxEnergy || 100;
      const hoursElapsed = elapsedSeconds / 3600;
      const energyRestored = Math.floor(maxEnergy * 0.05 * hoursElapsed);

      // Check crops in farm
      let cropsHarvested = 0;
      let coinsEarned = 0;

      const farmRef = firestore.collection('farms').doc(userId);
      const farmSnap = await farmRef.get();
      
      if (farmSnap.exists) {
        const farmData = farmSnap.data() as any;
        (farmData.plots || []).forEach((plot: any) => {
          if (now.getTime() >= plot.harvestAt.toDate().getTime()) {
            cropsHarvested++;
            coinsEarned += 100;
          }
        });
      }

      return {
        cropsHarvested,
        coinsEarned,
        energyRestored: Math.min(maxEnergy, energyRestored),
        elapsedMinutes,
      };
    } catch (error) {
      console.error('Error calculating offline progress:', error);
      return {
        cropsHarvested: 0,
        coinsEarned: 0,
        energyRestored: 0,
        elapsedMinutes: 0,
      };
    }
  }

  /**
   * Apply offline progress to local store
   */
  applyOfflineProgress(result: OfflineProgressResult) {
    const state = playerStore.getState();
    
    if (result.coinsEarned > 0 || result.energyRestored > 0) {
      playerStore.setState({
        coins: state.coins + result.coinsEarned,
        energy: Math.min(state.maxEnergy, state.energy + result.energyRestored),
      });
    }
  }
}

export const offlineProgressService = new OfflineProgressService();
