# Quick Reference Guide

## Running the App

### Development
```bash
npm start                  # Start Expo dev server
npm run android            # Run on Android emulator
npm run ios                # Run on iOS simulator
npm run web                # Run in web browser
```

### Type Checking
```bash
npm run tsc                # TypeScript compiler check
```

### Testing Cloud Functions
```bash
cd functions
npm install
firebase emulators:start   # Start emulator suite
# Access at http://localhost:4000
```

## Project Navigation

### Core Flows

**Authentication**
- SplashScreen → LoginScreen → HomeScreen

**Farming**
- HomeScreen → FarmScreen (plant/harvest crops)

**Economy**
- Market: HomeScreen → MarketScreen (buy/sell items)
- Contracts: HomeScreen → ContractsScreen (complete tasks)
- Shop: HomeScreen → ShopScreen (buy gems)

**Progression**
- Animals: HomeScreen → AnimalScreen
- Buildings: HomeScreen → BuildingsScreen
- Upgrades: HomeScreen → UpgradesScreen

### Service Architecture

```
App.tsx (root)
  ↓
  → firebaseService (SDK init)
  → gameLoopService (5-sec ticks)
  ↓
  Store Layer (Zustand)
  ├── playerStore (level, coins, gems, energy)
  ├── farmStore (crops, animals, buildings)
  ├── marketStore (listings, contracts)
  ├── remoteConfigStore (balance params)
  └── uiStore (screens, notifications)
  ↓
  Service Layer
  ├── economyService (pricing, calculations)
  ├── offlineProgressService (sync logic)
  ├── cloudFunctionsService (server calls)
  └── revenueCatService (IAP)
```

## Key Files to Modify

### Game Balance
**src/utils/constants.ts**
- `CROPS` - Growth times, costs, values
- `ANIMALS` - Production times, feed costs
- `BUILDINGS` - Capacities and prices
- `UPGRADES` - Tech tree and costs

### Game Loop Timing
**src/services/gameLoopService.ts**
- Line 14: `TICK_INTERVAL = 5000` (change for faster/slower updates)

### Offline Calculations
**src/services/offlineProgressService.ts**
- Adjust regeneration rates
- Modify crop growth during offline

### UI Screens
All in **src/components/**
- Edit styling in component `styles` object
- Add new screens by creating new `.tsx` file + adding to App.tsx

### Firebase Setup
**src/services/firebaseService.ts**
- Line 10: Replace with your Firebase config (from `.env`)
- Enable services in Firebase Console

## Common Development Tasks

### Add New Crop Type
1. Add to `CROPS` in constants.ts
2. Add growth calculation in gameLoopService
3. Reference in economyService pricing
4. Test harvest in FarmScreen

### Add New Building
1. Add to `BUILDINGS` in constants.ts
2. Add storage bonus calculation in economyService.calculateStorageCapacity()
3. Display in BuildingsScreen with cost

### Modify Game Timing
**Crop Growth:** constants.ts → CROPS → growthTime
**Animal Production:** constants.ts → ANIMALS → productionTime
**Energy Regen:** offlineProgressService.ts → search "energyRegenRate"
**Game Tick:** gameLoopService.ts → TICK_INTERVAL

### Test with Firebase Emulator
```bash
# Terminal 1: Start emulator
firebase emulators:start

# Terminal 2: Run app
FIREBASE_USE_EMULATOR=true npm start
```

### Debug State Changes
```javascript
// In any component:
const player = usePlayerStore();
console.log('Player state:', player);

// Use React DevTools Chrome extension
// to inspect Zustand store updates
```

### Add Analytics Event
```typescript
import { logEvent } from '@react-native-firebase/analytics';

logEvent('user_harvested_crop', {
  crop_type: 'wheat',
  quantity: 5,
  coins_earned: 250,
});
```

## Zustand Store Cheatsheet

### Reading State
```typescript
const coins = usePlayerStore((state) => state.coins);
const allCrops = usePlayerStore((state) => state); // all fields
```

### Updating State
```typescript
usePlayerStore.getState().updateCoins(100);
usePlayerStore.getState().levelUp();
useFarmStore.getState().harvestCrop(cropId);
```

### Listening to Changes
```typescript
const unsubscribe = usePlayerStore.subscribe(
  (state) => state.coins,
  (coins) => console.log('Coins changed:', coins)
);
```

## TypeScript Tips

### Component Props
```typescript
interface ScreenProps {
  onNavigate: (screen: string) => void;
  data?: any;
}

export const MyScreen: React.FC<ScreenProps> = ({ onNavigate, data }) => {
  // ...
};
```

### Store Type Safety
```typescript
// Automatic typing - Zustand infers from create()
const player = usePlayerStore.getState(); // Full type inference
```

### API Calls
```typescript
type APIResult<T> = Promise<{ success: boolean; data?: T; error?: string }>;

const response = await cloudFunctionsService.onSellCrop(...);
if (response.success) {
  // reward: number is typed
}
```

## Remote Config Keys (for tuning)

Use Firebase Console to adjust these live:

- `crop_growth_speed_multiplier` - Default: 1.0
- `coin_earning_multiplier` - Default: 1.0
- `xp_earning_multiplier` - Default: 1.0
- `energy_regeneration_rate` - Default: 0.05 (5% per hour)
- `animal_production_speed_multiplier` - Default: 1.0
- `marketplace_fee_percentage` - Default: 0.05 (5%)

## Performance Checklist

- ✅ Zustand selectors prevent unnecessary re-renders
- ✅ AsyncStorage caches state offline
- ✅ Firebase offline persistence enabled
- ✅ Reanimated runs on native thread
- ✅ Lazy loading of screens
- ✅ Proper cleanup in useEffect hooks

## Deployment Checklist

Before submitting to app stores:

- [ ] Update version in app.json
- [ ] Add release notes to DEPLOYMENT_GUIDE.md
- [ ] Test on real devices (Android & iOS)
- [ ] Verify Firebase credentials in `.env`
- [ ] Check all Cloud Functions deployed
- [ ] Test IAP with RevenueCat sandbox
- [ ] Generate app store screenshots
- [ ] Set app store descriptions
- [ ] Configure pricing in each store
- [ ] Submit for review

## Support URLs

- GitHub: [FarmGame repo]
- Firebase Console: https://console.firebase.google.com
- Play Store Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com
- RevenueCat Dashboard: https://app.revenuecat.com

---

**Questions?** Check DEPLOYMENT_GUIDE.md for detailed setup instructions.
