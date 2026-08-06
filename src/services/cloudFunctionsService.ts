import { functions } from './firebaseService';
import { Player, Farm, Contract } from '../types/game';

/**
 * Cloud Functions Integration Service
 * Calls server-side logic for validation, calculations, and state management
 */

export const cloudFunctionsService = {
  /**
   * Validate and process crop sale transaction
   * Server-side: Prevents cheating, updates marketplace, logs analytics
   */
  async onSellCrop(
    userId: string,
    cropName: string,
    quantity: number,
    basePrice: number
  ): Promise<{ success: boolean; reward: number; error?: string }> {
    try {
      const callable = functions.httpsCallable('onSellCrop');
      const result = await callable({
        userId,
        cropName,
        quantity,
        basePrice,
      });
      return result.data;
    } catch (error) {
      console.error('Sell crop failed:', error);
      return {
        success: false,
        reward: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Update marketplace prices dynamically
   * Server-side: Calculates price fluctuations based on supply/demand
   */
  async updateMarketPrices(): Promise<{
    success: boolean;
    prices?: Record<string, number>;
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('updateMarketPrices');
      const result = await callable({});
      return result.data;
    } catch (error) {
      console.error('Update market prices failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Generate daily contracts for a player
   * Server-side: Creates randomized daily orders based on player level and inventory
   */
  async generateDailyContracts(userId: string): Promise<{
    success: boolean;
    contracts?: Contract[];
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('generateDailyContracts');
      const result = await callable({ userId });
      return result.data;
    } catch (error) {
      console.error('Generate daily contracts failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Process contract completion with validation
   * Server-side: Verifies inventory, prevents item duplication, logs transaction
   */
  async onCompleteContract(
    userId: string,
    contractId: string
  ): Promise<{ success: boolean; reward?: number; error?: string }> {
    try {
      const callable = functions.httpsCallable('onCompleteContract');
      const result = await callable({ userId, contractId });
      return result.data;
    } catch (error) {
      console.error('Complete contract failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Calculate offline progress
   * Server-side: Uses server timestamp to prevent time cheating, calculates resources earned
   */
  async calculateOfflineProgress(userId: string): Promise<{
    success: boolean;
    coinsEarned?: number;
    cropsHarvested?: Record<string, number>;
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('calculateOfflineProgress');
      const result = await callable({ userId });
      return result.data;
    } catch (error) {
      console.error('Calculate offline progress failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Trigger random weather events
   * Server-side: Creates game events that affect crops, triggers notifications
   */
  async triggerWeatherEvent(userId: string): Promise<{
    success: boolean;
    eventType?: string;
    effect?: string;
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('triggerWeatherEvent');
      const result = await callable({ userId });
      return result.data;
    } catch (error) {
      console.error('Trigger weather event failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Verify IAP purchase with app store
   * Server-side: Validates receipt with Apple/Google, grants gems, logs transaction
   */
  async onPurchaseComplete(
    userId: string,
    productId: string,
    transactionId: string,
    platform: 'ios' | 'android'
  ): Promise<{
    success: boolean;
    gemsGranted?: number;
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('onPurchaseComplete');
      const result = await callable({
        userId,
        productId,
        transactionId,
        platform,
      });
      return result.data;
    } catch (error) {
      console.error('Purchase completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Send push notification to player
   * Server-side: Triggers Firebase Cloud Messaging for engagement
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, string>
  ): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('sendNotification');
      const result = await callable({
        userId,
        title,
        message,
        data,
      });
      return result.data;
    } catch (error) {
      console.error('Send notification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Process player level up event
   * Server-side: Unlocks features, sends achievements, updates leaderboards
   */
  async onPlayerLevelUp(
    userId: string,
    newLevel: number
  ): Promise<{
    success: boolean;
    unlockedFeatures?: string[];
    error?: string;
  }> {
    try {
      const callable = functions.httpsCallable('onPlayerLevelUp');
      const result = await callable({ userId, newLevel });
      return result.data;
    } catch (error) {
      console.error('Player level up failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Cloud Functions Setup Guide for Production:
 * 
 * Installation:
 * 1. Navigate to functions folder: cd functions
 * 2. Install Firebase Tools: npm install -g firebase-tools
 * 3. Initialize functions: firebase init functions
 * 
 * Environment Setup:
 * 1. Set Remote Config values: firebase functions:config:set config.crop_speed_multiplier=1.2
 * 2. Configure Cloud Firestore indexes in Firebase Console
 * 3. Set up Cloud Tasks for scheduled functions (daily contracts)
 * 
 * Deployment:
 * 1. Test locally: firebase emulators:start
 * 2. Deploy: firebase deploy --only functions
 * 3. Monitor: Firebase Console → Cloud Functions
 * 
 * Security:
 * - All functions validate user auth token
 * - Server-side validation prevents client-side cheating
 * - Transactions use Firestore transaction semantics
 * - Rate limiting on sensitive operations (marketplace, IAP)
 */
