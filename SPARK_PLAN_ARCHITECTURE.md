# 🎮 FarmGame V1 - Spark (Free) Plan Architecture

## Summary

**FarmGame V1 is designed to run entirely on Firebase's Spark (free) plan** with no Cloud Functions costs.

All game logic is client-side. Cloud Functions will only be added when absolutely necessary (e.g., IAP validation, leaderboards).

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
│              (Expo 51 + TypeScript 5.3)                     │
└────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌──────────┐         ┌──────────┐
    │  Auth   │         │Firestore │         │ Storage  │
    │         │         │          │         │          │
    │ Email   │         │Players   │         │ Avatars  │
    │Anon     │         │Farms     │         │ Images   │
    └─────────┘         │Contracts │         └──────────┘
         │              │Listings  │             │
         │              └──────────┘             │
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
           ┌─────────┐ ┌──────────┐ ┌──────────┐
           │ Remote  │ │Analytics │ │Messaging │
           │ Config  │ │          │ │          │
           │ (Balance│ │(Engagement│ │(Push)    │
           │)        │ │ Tracking) │ │          │
           └─────────┘ └──────────┘ └──────────┘

FUTURE (Cloud Functions - Only when needed):
┌───────────────────────────────────────────────────┐
│  Cloud Functions (Blaze Plan - Later)             │
│  - IAP Receipt Validation                         │
│  - Player Trading Transactions                    │
│  - Leaderboard Calculations                       │
│  - Scheduled Events (Weather, Maintenance)        │
└───────────────────────────────────────────────────┘
```

---

## ✅ V1 Features (All Client-Side)

### Gameplay
- ✅ Farm (plant, grow, harvest crops)
- ✅ Animals (production, feeding)
- ✅ Buildings (storage upgrades)
- ✅ Upgrades (tech tree progression)
- ✅ Contracts (daily tasks)
- ✅ Marketplace (NPC buying/selling)
- ✅ Inventory (storage management)
- ✅ Shop (gem packages via RevenueCat)
- ✅ Energy system (regeneration)
- ✅ XP/Leveling (progression)

### Backend Services (Firebase)
- ✅ **Authentication** - Email + anonymous login
- ✅ **Firestore** - Real-time data persistence
- ✅ **Storage** - Asset storage (avatars, images)
- ✅ **Remote Config** - Live game balance tuning
- ✅ **Analytics** - Engagement tracking
- ✅ **Crashlytics** - Error reporting
- ✅ **Cloud Messaging** - Push notifications (future)

### NOT Needed for V1
- ❌ Cloud Functions (too expensive on free tier)
- ❌ Leaderboards (added when Cloud Functions available)
- ❌ Player trading (requires server validation)
- ❌ Server-side events (can add later)

---

## 💰 Cost Analysis

### Spark Plan (Free)
- Authentication: ✅ Free
- Firestore: ✅ 1 GB storage, 50K reads/day
- Storage: ✅ 5 GB total
- Remote Config: ✅ Free
- Analytics: ✅ Free
- Messaging: ✅ 200K messages/month
- **Cloud Functions: ❌ Not available**

### When to Upgrade to Blaze
When your game reaches:
- 50K+ daily active users
- Multiplayer features (trading, battles)
- Server-side validation needed
- $0-2 USD/month estimated costs

---

## 🏗️ Project Structure

```
FarmGame/
├── src/
│   ├── components/        # 11 screens (all client-side)
│   ├── hooks/             # useGameUpdate (game loop)
│   ├── services/
│   │   ├── firebaseService.ts       # SDK init (no functions)
│   │   ├── gameLoopService.ts       # 5-second ticks (local)
│   │   ├── offlineProgressService.ts # Client-side calculation
│   │   ├── economyService.ts        # Math + constants
│   │   ├── cloudFunctionsService.ts # Placeholder (future use)
│   │   └── revenueCatService.ts     # IAP (via RevenueCat)
│   ├── store/             # 5 Zustand stores + AsyncStorage
│   ├── types/             # Complete TypeScript types
│   └── utils/             # Helpers, constants
├── functions/             # Cloud Functions (scaffolding only)
├── firestore.rules        # Security rules (Spark-safe)
├── firebase.json          # Config
└── .env                   # Credentials
```

---

## 🔐 Firestore Collections (Spark-Safe)

All data stays below Spark tier limits:

```
players/
  ├── {userId}
  │   ├── level: 1-50
  │   ├── xp: 0+
  │   ├── coins: 0+
  │   ├── gems: 0-999
  │   ├── energy: 0-100
  │   ├── maxEnergy: 100
  │   └── lastSyncAt: timestamp

farms/
  ├── {userId}
  │   ├── plots: [planting data]
  │   ├── animals: [animal instances]
  │   ├── buildings: [building instances]
  │   ├── storage: {crop: qty}
  │   └── upgrades: [unlocked upgrade IDs]

marketListings/
  ├── {itemId}
  │   ├── itemName: "wheat"
  │   ├── basePrice: 50
  │   ├── quantity: 999
  │   └── sellerType: "npc"

contracts/
  ├── {contractId}
  │   ├── playerId: userId
  │   ├── itemName: "wheat"
  │   ├── quantity: 5
  │   ├── reward: 500
  │   ├── expiresAt: timestamp
  │   └── completed: false
```

---

## 📱 How Player Data Flows

### 1. Login
```
User Email/Anonymous 
    ↓
Firebase Auth
    ↓
Zustand Stores Initialized
    ↓
Firestore Data Fetched
    ↓
offlineProgressService.calculateOfflineProgress()
    ↓
App Ready ✓
```

### 2. Gameplay
```
User Action (tap crop, feed animal, etc.)
    ↓
Zustand Store Updated (local)
    ↓
gameLoopService Tick (every 5 seconds)
    ↓
Firestore Synced
    ↓
Offline Persistence Saved
```

### 3. Logout
```
User Closes App
    ↓
AsyncStorage Persists (Zustand state)
    ↓
Firestore Data Saved
```

### 4. Returns to App
```
App Boots
    ↓
Zustand Restores from AsyncStorage
    ↓
Firebase Auth Re-authenticates
    ↓
offlineProgressService Calculates Time Offline
    ↓
Energy + Coins Awarded
    ↓
App Ready with Offline Rewards ✓
```

---

## 🔒 Security Rules (Spark-Compatible)

```javascript
// Allow users to read/write only their own data
match /players/{userId} {
  allow read, write: if request.auth.uid == userId;
}

match /farms/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Allow reading public marketplace
match /marketListings/{doc=**} {
  allow read: if request.auth != null;
}

// Users can only read their contracts
match /contracts/{doc=**} {
  allow read: if request.auth.uid == resource.data.playerId;
}
```

---

## 🚀 Deployment Steps

### 1. Enable Firebase Services
- ✅ Authentication (Email + Anonymous)
- ✅ Firestore Database (Production mode)
- ✅ Cloud Storage
- ✅ Remote Config
- ✅ Cloud Messaging

### 2. Create Firestore Collections
Manual setup or via app first write:
```bash
# Optional: Pre-create collections via Firebase Console
collections: players, farms, marketListings, contracts
```

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Build & Test
```bash
npm start              # Test locally
npm run build         # Build for distribution
eas build             # Expo: Prepare for stores
```

---

## 📈 Scaling Path

### Phase 1: V1 (Spark - Current)
- Solo gameplay
- NPC marketplace
- Offline progression
- Push notifications

### Phase 2: Blaze (≈10K users)
- Switch to Blaze plan ($0.06-0.25/day typical)
- Enable Cloud Functions for:
  - IAP receipt validation
  - Player-to-player trading

### Phase 3: Multiplayer (≈50K users)
- Add real-time features
- Leaderboards via Cloud Functions
- Server-side events

---

## ✨ Why This Architecture?

✅ **Cost-Effective** - Stay free until proven demand
✅ **Simple** - No server complexity in V1
✅ **Fast Development** - Focus on gameplay, not infrastructure
✅ **Proven Path** - Thousands of games use this approach
✅ **Scalable** - Easy upgrade to Blaze when needed
✅ **Secure** - Firestore rules prevent cheating at scale

---

## 🎯 Next Steps

1. ✅ Deploy to Spark plan (free)
2. ✅ Test gameplay locally
3. → Build APK/IPA with Expo EAS
4. → Submit to app stores
5. → Monitor engagement (analytics)
6. → Add Cloud Functions when needed

---

## 📚 Related Files

- **FIREBASE_READY.md** - Getting started
- **DEPLOYMENT_CHECKLIST.md** - Pre-launch checklist
- **firestore.rules** - Security configuration
- **functions/index.ts** - Cloud Functions (scaffolding for future)

---

**Status:** ✅ Ready for Spark Plan Deployment

All game logic is client-side. No Cloud Functions needed for V1.
