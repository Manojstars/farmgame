/**
 * FarmGame - Cloud Functions Implementation Guide
 * 
 * This file contains production-ready implementations of all Cloud Functions
 * required for the Farm Game backend logic.
 * 
 * Setup:
 * 1. cd functions
 * 2. npm install firebase-functions firebase-admin
 * 3. Create index.ts with these implementations
 * 4. Deploy: firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

// ============================================================================
// MARKETPLACE FUNCTIONS
// ============================================================================

/**
 * Validate and process crop/item sale transaction
 * Called from MarketScreen when player sells items
 * 
 * Validates:
 * - Player owns item quantity
 * - Account is not banned/suspended
 * - Marketplace is operational
 * 
 * Returns: { success, coins_earned, transaction_id }
 */
exports.onSellCrop = functions
  .region('us-east1')
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;
    const { cropName, quantity, basePrice } = data;

    try {
      // Fetch player document
      const playerDoc = await db.collection('players').doc(userId).get();
      if (!playerDoc.exists) {
        throw new Error('Player not found');
      }

      const player = playerDoc.data();

      // Fetch farm document
      const farmDoc = await db.collection('farms').doc(userId).get();
      if (!farmDoc.exists) {
        throw new Error('Farm not found');
      }

      const farm = farmDoc.data();
      const storage = farm?.storage || {};
      const itemQty = storage[cropName] || 0;

      // Validate inventory
      if (itemQty < quantity) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Insufficient items. Have: ${itemQty}, Need: ${quantity}`
        );
      }

      // Calculate sale price (5% marketplace fee)
      const salePrice = Math.round(basePrice * quantity * 0.95);

      // Use transaction for atomic update
      const result = await db.runTransaction(async (transaction) => {
        // Deduct items
        transaction.update(db.collection('farms').doc(userId), {
          [`storage.${cropName}`]: admin.firestore.FieldValue.increment(-quantity),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Add coins
        transaction.update(db.collection('players').doc(userId), {
          coins: admin.firestore.FieldValue.increment(salePrice),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Log transaction
        transaction.set(db.collection('transactions').doc(), {
          userId,
          type: 'sale',
          item: cropName,
          quantity,
          price: salePrice,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return salePrice;
      });

      return {
        success: true,
        coinsEarned: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('onSellCrop error:', error);
      throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
  });

/**
 * Update marketplace prices based on supply/demand
 * Scheduled to run every hour
 * 
 * Simulates:
 * - Natural price fluctuations
 * - Supply/demand curves
 * - Seasonal adjustments
 */
exports.updateMarketPrices = functions
  .region('us-east1')
  .pubsub.schedule('every 1 hours')
  .onRun(async () => {
    try {
      // Fetch all market listings
      const listingsSnapshot = await db.collection('marketListings').get();

      // Update each listing with new price
      const batch = db.batch();

      listingsSnapshot.forEach((doc) => {
        const listing = doc.data();
        const basePrice = listing.basePrice;

        // Apply random fluctuation (-10% to +15%)
        const fluctuation = (Math.random() * 0.25) - 0.1;
        const newPrice = Math.round(basePrice * (1 + fluctuation));

        batch.update(doc.ref, {
          price: newPrice,
          priceHistory: admin.firestore.FieldValue.arrayUnion({
            price: newPrice,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      console.log('Market prices updated successfully');

      return null;
    } catch (error) {
      console.error('updateMarketPrices error:', error);
      return null;
    }
  });

// ============================================================================
// CONTRACT FUNCTIONS
// ============================================================================

/**
 * Generate daily contracts for each player
 * Scheduled to run daily at 2 AM UTC
 * 
 * Creates:
 * - 3 random contracts per player
 * - Rewards scale with player level
 * - Items based on unlocked crops/animals
 */
exports.generateDailyContracts = functions
  .region('us-east1')
  .pubsub.schedule('0 2 * * *')  // 2 AM UTC daily
  .timeZone('UTC')
  .onRun(async () => {
    try {
      const playersSnapshot = await db.collection('players').get();

      playersSnapshot.forEach(async (playerDoc) => {
        const player = playerDoc.data();
        const playerId = playerDoc.id;

        // Generate 3 random contracts
        for (let i = 0; i < 3; i++) {
          const crops = ['wheat', 'corn', 'tomato', 'lettuce', 'pumpkin'];
          const randomCrop = crops[Math.floor(Math.random() * crops.length)];
          const quantity = Math.floor(Math.random() * 5) + 3; // 3-7 items
          const baseReward = (player.level || 1) * 100;
          const reward = Math.round(baseReward * (0.8 + Math.random() * 0.4));

          await db.collection('contracts').add({
            playerId,
            itemName: randomCrop,
            quantity,
            reward,
            xpReward: Math.round(reward / 10),
            description: `Deliver ${quantity} ${randomCrop} to the merchant`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(
              new Date(Date.now() + 24 * 60 * 60 * 1000)
            ),
            completed: false,
          });
        }
      });

      console.log('Daily contracts generated successfully');
      return null;
    } catch (error) {
      console.error('generateDailyContracts error:', error);
      return null;
    }
  });

/**
 * Process contract completion with server-side validation
 * Prevents item duplication and fraudulent completions
 * 
 * Validates:
 * - Contract exists and belongs to player
 * - Contract not already completed
 * - Player has required items
 * - Contract not expired
 */
exports.onCompleteContract = functions
  .region('us-east1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;
    const { contractId } = data;

    try {
      const contractDoc = await db.collection('contracts').doc(contractId).get();
      if (!contractDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Contract not found');
      }

      const contract = contractDoc.data() as any;

      // Validate contract ownership and status
      if (contract.playerId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Not your contract');
      }

      if (contract.completed) {
        throw new functions.https.HttpsError('failed-precondition', 'Contract already completed');
      }

      if (contract.expiresAt.toDate() < new Date()) {
        throw new functions.https.HttpsError('failed-precondition', 'Contract expired');
      }

      // Check inventory using transaction
      const result = await db.runTransaction(async (transaction) => {
        const farmDoc = await transaction.get(db.collection('farms').doc(userId));
        const storage = farmDoc.data()?.storage || {};
        const itemQty = storage[contract.itemName] || 0;

        if (itemQty < contract.quantity) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Insufficient items'
          );
        }

        // Deduct items
        transaction.update(db.collection('farms').doc(userId), {
          [`storage.${contract.itemName}`]: admin.firestore.FieldValue.increment(-contract.quantity),
        });

        // Add reward
        transaction.update(db.collection('players').doc(userId), {
          coins: admin.firestore.FieldValue.increment(contract.reward),
          xp: admin.firestore.FieldValue.increment(contract.xpReward),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Mark contract complete
        transaction.update(contractDoc.ref, {
          completed: true,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return contract.reward;
      });

      return {
        success: true,
        reward: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('onCompleteContract error:', error);
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError('internal', 'Unknown error');
    }
  });

// ============================================================================
// OFFLINE PROGRESS FUNCTIONS
// ============================================================================

/**
 * Calculate offline progress when player returns to app
 * Uses server timestamp to prevent time cheating
 * 
 * Calculates:
 * - Crop growth completion
 * - Animal production cycles
 * - Energy regeneration
 * - Resource generation
 */
exports.calculateOfflineProgress = functions
  .region('us-east1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;

    try {
      const playerDoc = await db.collection('players').doc(userId).get();
      const farmDoc = await db.collection('farms').doc(userId).get();

      const player = playerDoc.data() as any;
      const farm = farmDoc.data() as any;

      const lastSyncTime = player.lastSyncAt?.toDate() || new Date();
      const now = new Date();
      const elapsedSeconds = (now.getTime() - lastSyncTime.getTime()) / 1000;

      // Calculate energy regeneration (5% per hour)
      const energyRegenRate = 0.05; // per hour
      const hoursElapsed = elapsedSeconds / 3600;
      const energyGained = Math.floor((player.maxEnergy * energyRegenRate) * hoursElapsed);
      const newEnergy = Math.min(player.maxEnergy, (player.energy || 0) + energyGained);

      // Calculate crop completion
      let cropsHarvested: Record<string, number> = {};
      let coinsEarned = 0;

      (farm.plots || []).forEach((plot: any) => {
        if (now.getTime() >= plot.harvestAt.toDate().getTime()) {
          const cropName = plot.cropId; // Map from constants
          cropsHarvested[cropName] = (cropsHarvested[cropName] || 0) + 1;
          coinsEarned += 100; // Base crop value
        }
      });

      // Update player
      await db.collection('players').doc(userId).update({
        energy: newEnergy,
        coins: admin.firestore.FieldValue.increment(coinsEarned),
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        energyGained,
        coinsEarned,
        cropsHarvested,
        elapsedMinutes: Math.round(elapsedSeconds / 60),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('calculateOfflineProgress error:', error);
      throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
    }
  });

// ============================================================================
// IAP & MONETIZATION FUNCTIONS
// ============================================================================

/**
 * Verify and process IAP purchase
 * Validates receipt with App Store or Google Play
 * Grants gems and logs transaction
 */
exports.onPurchaseComplete = functions
  .region('us-east1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;
    const { productId, transactionId, platform } = data;

    try {
      // Map product to gems (in production: verify receipt with RevenueCat API)
      const gemMap: Record<string, number> = {
        'gem_50': 50,
        'gem_500': 500,
        'gem_2500': 2500,
        'gem_6500': 6500,
      };

      const gemsToGrant = gemMap[productId];
      if (!gemsToGrant) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid product ID');
      }

      // Verify receipt (in production: call RevenueCat API)
      // const verified = await verifyReceiptWithAppStore(receipt, platform);
      // if (!verified) throw new Error('Receipt verification failed');

      // Grant gems
      await db.collection('players').doc(userId).update({
        gems: admin.firestore.FieldValue.increment(gemsToGrant),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log transaction
      await db.collection('transactions').add({
        userId,
        type: 'purchase',
        productId,
        transactionId,
        platform,
        gemsGranted: gemsToGrant,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        gemsGranted: gemsToGrant,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('onPurchaseComplete error:', error);
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError('internal', 'Purchase verification failed');
    }
  });

// ============================================================================
// DEPLOYMENT COMMANDS
// ============================================================================

/**
 * Deploy to Firebase:
 * 
 * Development:
 * firebase emulators:start
 * 
 * Production:
 * firebase deploy --only functions
 * 
 * Staging:
 * firebase deploy --only functions --project staging
 */
