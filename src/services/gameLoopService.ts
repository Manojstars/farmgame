// Game Loop Service
// Handles timed game updates like crop growth, animal production, etc.

import { usePlayerStore } from '../store/playerStore';
import { useFarmStore } from '../store/farmStore';
import { useRemoteConfigStore } from '../store/remoteConfigStore';

export class GameLoopService {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;
  private tickInterval = 5000; // 5 seconds

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.interval = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  private tick() {
    try {
      this.updateEnergy();
      this.updateCropGrowth();
      this.updateAnimalProduction();
      this.checkContractDeadlines();
    } catch (error) {
      console.error('Game loop error:', error);
    }
  }

  private updateEnergy() {
    const player = usePlayerStore.getState().player;
    if (!player || player.energy >= player.maxEnergy) return;

    const config = useRemoteConfigStore.getState().config;
    const timeSinceLastRefill = Date.now() - player.lastEnergyRefill;
    const energyToRestore = Math.floor(
      timeSinceLastRefill / (config.maxEnergyRefillTime * 1000) * config.energyRegenerationRate
    );

    if (energyToRestore > 0) {
      usePlayerStore.getState().updateEnergy(energyToRestore);
    }
  }

  private updateCropGrowth() {
    const farm = useFarmStore.getState().farm;
    if (!farm) return;

    const now = Date.now();
    const readyForHarvest = farm.plots.filter((crop) => crop.harvestAt <= now);

    // In a real implementation, you'd emit events or update UI for ready crops
    if (readyForHarvest.length > 0) {
      console.log(`${readyForHarvest.length} crops ready for harvest`);
    }
  }

  private updateAnimalProduction() {
    const farm = useFarmStore.getState().farm;
    if (!farm) return;

    const now = Date.now();
    const readyToCollect = farm.animals.filter((animal) => animal.nextProduction <= now);

    // In a real implementation, you'd add goods to storage and reset production timer
    if (readyToCollect.length > 0) {
      console.log(`${readyToCollect.length} animals ready to collect from`);
    }
  }

  private checkContractDeadlines() {
    // Check if any contracts are expiring soon
    // Emit notifications if needed
  }
}

export const gameLoopService = new GameLoopService();
