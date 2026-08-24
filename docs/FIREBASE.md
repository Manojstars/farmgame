# Firebase Local Development Setup

## Overview

Farm Life uses Firebase as the backend for:
- Authentication (user login/signup)
- Firestore (real-time game data)
- Remote Config (live game balance tuning)
- Analytics (player behavior tracking)
- Cloud Storage (game assets)
- Cloud Messaging (push notifications)
- Cloud Functions (future server logic)

## Local Development vs. Production

### Local Development (Recommended)
- Uses Firebase Emulator Suite
- Runs entirely on your machine
- Data is isolated and cleared between sessions
- Perfect for testing without affecting production
- Eliminates risk of corrupting production data
- **Required when on a corporate VPN that blocks googleapis.com**

### Production
- Uses actual Firebase services
- Real player data
- Cloud synchronization
- Live game balance
- DO NOT use for testing

---

## Corporate Network / VPN Issue

If Firebase authentication fails with:

```
FirebaseError: Firebase: Error (auth/network-request-failed)
```

and DNS lookups for `identitytoolkit.googleapis.com` or `securetoken.googleapis.com` fail, this
means the corporate VPN or DNS is blocking Firebase endpoints.

**This is a network restriction — not a Firebase configuration bug.**

### Solution: Use Firebase Emulators

The Firebase Emulator Suite runs entirely on `localhost`. The Android emulator reaches the host
machine via `10.0.2.2`, so no external internet is needed.

#### Step 1 — Enable emulator mode in `.env`

```bash
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true
```

Or use the VS Code task: **"Farm Life: Enable Emulator Mode"**

#### Step 2 — Start the emulators

```powershell
.\scripts\start-emulator.ps1
```

Or use the VS Code task: **"Farm Life: Firebase Emulator (Auth + Firestore)"**

Emulators start on:
- **Auth**:      `0.0.0.0:9099`  → Android emulator uses `http://10.0.2.2:9099`
- **Firestore**: `0.0.0.0:8080`  → Android emulator uses `10.0.2.2:8080`
- **UI**:        `localhost:4000` → open in browser to inspect data

#### Step 3 — Rebuild the APK

The `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` variable is baked in at build time:

```bash
npx expo run:android
```

Or use the VS Code task: **"Farm Life: Build Android Debug APK"**

#### Step 4 — Verify

In Android logcat you should see:

```
[Firebase] Using LOCAL emulators — Auth: 10.0.2.2:9099, Firestore: 10.0.2.2:8080
```

#### Switching back to production

```bash
# In .env:
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false
```

Or use the VS Code task: **"Farm Life: Disable Emulator Mode"**

Then rebuild the APK.

---

## Setting Up Firebase Emulator

### Prerequisites

1. **Java Runtime Environment (JRE)**
   - Required for Firebase Emulator Suite
   - Download from: https://www.java.com/download/
   - Verify: `java -version`

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

3. **Google Cloud SDK** (optional, but recommended)
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   gcloud --version
   ```

### Initialize Firebase Project

```bash
# Authenticate with Google
firebase login

# Initialize Firebase in the project (if not already done)
firebase init
```

When prompted:
- Select your Firebase project
- Enable: Authentication, Firestore Database, Emulator Suite
- Use existing rules

### Start Emulator Suite

```bash
# Start all emulators (local development)
firebase emulators:start

# Or use VS Code task:
# Run: Farm Life: Firebase Emulator
```

The emulator will start on:
- **Firestore**: http://localhost:8080
- **Authentication**: http://localhost:9099
- **Emulator UI**: http://localhost:4000

### Connect App to Local Firebase

The app connects to the local emulator when `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` is set in `.env`.

In `src/services/firebaseService.ts`:
```typescript
if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://10.0.2.2:9099', { disableWarnings: true });
  connectFirestoreEmulator(firestore, '10.0.2.2', 8080);
}
```

`10.0.2.2` is the Android emulator's special alias for the host machine (`localhost`).

## Firestore Database Structure

### Collections

#### `players/{uid}/`
Player game state:
```typescript
{
  uid: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  lastEnergyRefill: timestamp;
  inventory: Record<string, number>;
  settings: {
    notifications: boolean;
    quietHours: { start: number; end: number };
  };
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### `farms/{uid}/`
Farm layout and assets:
```typescript
{
  uid: string;
  plots: Array<{
    id: string;
    x: number;
    y: number;
    cropType: string;
    level: number;
    harvestReadyAt: timestamp;
  }>;
  animals: Array<{
    id: string;
    type: string;
    level: number;
    productionReadyAt: timestamp;
  }>;
  buildings: Array<{
    id: string;
    type: string;
    level: number;
    completedAt: timestamp;
  }>;
  storage: {
    coins: number;
    items: Record<string, number>;
  };
}
```

#### `marketListings/{itemId}/`
Marketplace data (public read):
```typescript
{
  itemName: string;
  basePrice: number;
  currentPrice: number;
  supply: number;
  demand: number;
  lastUpdated: timestamp;
  priceHistory: Array<{
    price: number;
    timestamp: timestamp;
  }>;
}
```

#### `contracts/{contractId}/`
Daily contracts/orders:
```typescript
{
  contractId: string;
  playerId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  dueAt: timestamp;
  reward: {
    coins: number;
    xp: number;
  };
  completed: boolean;
  completedAt?: timestamp;
}
```

#### `transactions/{transactionId}/`
Player transaction history (audit trail):
```typescript
{
  transactionId: string;
  playerId: string;
  type: 'sell' | 'buy' | 'harvest' | 'craft';
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  timestamp: timestamp;
}
```

## Firestore Security Rules

Rules are defined in `firestore.rules`. Key principles:

### Authentication Required
All writes require user authentication (except public reads)

### Data Ownership
Users can only read/write their own `players/{uid}` and `farms/{uid}` documents

### Market is Public
`marketListings/*` is publicly readable (players see current prices)
`contracts/*` is privately readable (each player sees their own contracts)

### Functions Validate Writes
Critical operations (marketplace, contracts) must go through Cloud Functions

### Timestamps are Server-Generated
Prevents client-side time manipulation

## Environment Configuration

### Local Development (.env)
```bash
APP_ENV=development
DEBUG_MODE=true
FIREBASE_EMULATOR=true

# Firebase config (can be fake values for emulator)
FIREBASE_PROJECT_ID=farm-life-dev
FIREBASE_API_KEY=AIzaSyDummy...
FIREBASE_AUTH_DOMAIN=farm-life-dev.firebaseapp.com
FIREBASE_STORAGE_BUCKET=farm-life-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### Production (.env)
```bash
APP_ENV=production
DEBUG_MODE=false
FIREBASE_EMULATOR=false

# Real Firebase credentials
FIREBASE_PROJECT_ID=farm-life-prod
FIREBASE_API_KEY=[actual API key]
FIREBASE_AUTH_DOMAIN=[actual domain]
FIREBASE_STORAGE_BUCKET=[actual bucket]
FIREBASE_MESSAGING_SENDER_ID=[actual sender ID]
FIREBASE_APP_ID=[actual app ID]
```

## Testing with Emulator

### Create Test User
1. Open Emulator UI: http://localhost:4000
2. Go to Authentication tab
3. Add new user
   - Email: test@example.com
   - Password: password123

### View Data
1. Open Emulator UI: http://localhost:4000
2. Go to Firestore tab
3. Browse collections and documents
4. Test reads/writes

### Reset Emulator
```bash
# Clear all emulator data
firebase emulators:start --clear-on-exit
```

## Cloud Functions (Future)

When Cloud Functions are needed:

```bash
# Initialize functions
firebase init functions

# Test locally
firebase emulators:start --only functions

# Deploy to production
firebase deploy --only functions
```

Emulator will be available at: `http://localhost:5001`

## Troubleshooting

### Emulator won't start
- Verify Java is installed: `java -version`
- Check port 8080 is not in use: `netstat -ano | findstr :8080`
- Clear cache: `firebase emulators:start --clear-on-exit`

### App won't connect to emulator
- Verify `APP_ENV=development` in `.env`
- Check emulator is running on localhost:8080
- Look at app logs: `npm start` (press 'j' for logs)

### Data not persisting
- Verify Firestore Emulator is running on port 8080
- Check AsyncStorage permissions (Android 13+)
- Try clearing app data and re-running

### Authentication fails
- Verify Auth Emulator is running on port 9099
- Check `.env` Firebase config values
- Test with default test user (test@example.com / password123)

## Next Steps

1. **Start Emulator**: Run "Farm Life: Firebase Emulator" task
2. **Connect App**: Run "Farm Life: Start" task
3. **Create Test User**: Use Emulator UI at http://localhost:4000
4. **Test Login**: Try logging in with test@example.com / password123
5. **View Data**: Check Firestore Emulator for player data

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more development workflows.
