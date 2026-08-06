run_in_terminal --help (no actual command, just placeholder for CI/CD setup docs)

# FarmGame - Firebase Cloud Functions Setup

This directory contains Firebase Cloud Functions for server-side game logic.

## Prerequisites

- Firebase CLI: `npm install -g firebase-tools`
- Node.js 18+
- Firebase project initialized

## Setup

```bash
cd functions
npm install
```

## Cloud Functions Implementation

### 1. Marketplace Functions

#### onSellCrop
- **Trigger:** Called via `functions.https.onCall()`
- **Logic:**
  - Validate player has item in inventory
  - Calculate market price based on supply/demand
  - Deduct item from inventory
  - Add coins to player (minus marketplace fee)
  - Update market supply/demand
  - Log transaction for analytics

#### updateMarketPrices
- **Trigger:** Cloud Scheduler (hourly)
- **Logic:**
  - Fetch all market listings
  - Apply supply/demand adjustment
  - Update basePrice if needed
  - Emit price change events
  - Limit price volatility (min/max multipliers)

### 2. Contract Functions

#### generateDailyContracts
- **Trigger:** Cloud Scheduler (daily at 2 AM UTC)
- **Logic:**
  - Generate 3 random contracts
  - Pick random crops/animals and quantities
  - Calculate reward (base + time bonus)
  - Set 6-hour deadline
  - Create document in contracts collection
  - Broadcast notification via Cloud Messaging

#### onCompleteContract
- **Trigger:** Called via `functions.https.onCall()`
- **Logic:**
  - Validate player has required items
  - Calculate bonus (completion time multiplier)
  - Deduct items from inventory
  - Award coins + XP
  - Mark contract completed
  - Send completion notification
  - Log analytics event

### 3. Offline Progress Function

#### calculateOfflineProgress
- **Trigger:** Called via `functions.https.onCall()` on app launch
- **Logic:**
  - Receive player's `lastLoginTime`
  - Calculate elapsed time using server timestamp (prevents cheating)
  - Simulate crop growth: finished crops go to inventory
  - Simulate animal production: collected goods go to inventory
  - Calculate staff income (passive coins from upgrades)
  - Cap updates (e.g., max 24 hours of simulation)
  - Return progress summary to client
  - Update player's lastLogin timestamp

**Security:** Always use server timestamp, never trust client time.

### 4. Event Functions

#### triggerWeatherEvent
- **Trigger:** Cloud Scheduler (random: 0-3 times per day)
- **Logic:**
  - Randomly select event type (drought, rain, pest)
  - Set duration (4 hours)
  - Apply modifier to affected farms
  - Send broadcast notification via Cloud Messaging
  - Create weatherEvents document
  - Emit analytics event

#### expireContracts
- **Trigger:** Cloud Scheduler (every 10 minutes)
- **Logic:**
  - Find contracts with dueAt <= now
  - Mark as expired
  - Remove from active contracts
  - Send "Contract Expired" notification

### 5. IAP Functions (RevenueCat Integration)

#### onPurchaseComplete
- **Trigger:** Webhook from RevenueCat
- **Logic:**
  - Verify RevenueCat signature
  - Extract purchase data (gems purchased)
  - Fetch player document
  - Add gems to inventory
  - Log transaction for revenue tracking
  - Update player's IAP receipt record
  - Send confirmation notification

#### handleSubscriptionRenewal
- **Trigger:** Webhook from RevenueCat
- **Logic:**
  - Verify subscription validity
  - Add daily pass rewards
  - Update subscription status
  - Grant exclusive cosmetics/benefits

## Testing Functions Locally

```bash
# Start Firebase Emulator
firebase emulators:start

# In another terminal, test a function
firebase functions:shell
> calculateOfflineProgress({lastLoginTime: Date.now() - 3600000})
```

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:calculateOfflineProgress

# Deploy with specific Firebase project
firebase deploy --only functions -P production
```

## Environment Variables

Create `.env` file in `functions/` directory:

```env
MARKETPLACE_FEE=0.05
DROUGHT_MODIFIER=0.5
RAIN_MODIFIER=1.5
PEST_MODIFIER=0.3
OFFLINE_CALC_MAX_HOURS=24
REVENUECAT_API_KEY=your_key
```

Access in functions:

```typescript
import * as functions from 'firebase-functions';
const fee = parseFloat(process.env.MARKETPLACE_FEE || '0.05');
```

## Monitoring & Logs

View function logs:

```bash
firebase functions:log

# Or in Firebase Console:
# Cloud Functions > Logs
```

## Error Handling

All functions should:
1. Validate input parameters
2. Check user authentication
3. Catch and log errors to Firestore (for Crashlytics)
4. Return clear error messages to client
5. Implement retry logic for external APIs

Example:

```typescript
export const mySafeFunction = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    
    const uid = context.auth.uid;
    // Function logic...
    
    return { success: true, data: ... };
  } catch (error) {
    functions.logger.error('mySafeFunction error:', error);
    throw new functions.https.HttpsError('internal', 'Function failed');
  }
});
```

## Performance Tips

- Use `.limit()` on Firestore queries
- Implement caching for frequently accessed data
- Batch write operations
- Use async/await for readable code
- Keep function runtime under 60 seconds
- Monitor cold start times

## Costs

Estimated monthly costs:
- First 2M function calls: FREE
- After 2M calls: $0.40 per 1M calls
- Compute time: $0.0000083 per GB-second

Monitor in Firebase Console > Billing
