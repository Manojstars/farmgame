# Farm Game - Production Deployment Guide

## Project Summary

**American Farm Management Game** - A complete React Native farming simulator for iOS and Android with real-time multiplayer, social features, and monetization.

**Tech Stack:**
- Frontend: React Native 0.74.0 + Expo 51.0.0 + TypeScript
- State Management: Zustand 4.5.0
- Backend: Firebase (Firestore, Cloud Functions, Remote Config, Analytics, Messaging, Storage)
- Monetization: RevenueCat IAP integration
- Animations: React Native Reanimated 3.8.0 + Lottie 6.4.1

## Project Structure

```
FarmGame/
├── src/
│   ├── components/          # React Native UI screens
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── FarmScreen.tsx           # Crop planting & harvesting
│   │   ├── AnimalScreen.tsx         # Animal production
│   │   ├── BuildingsScreen.tsx      # Farm structures
│   │   ├── UpgradesScreen.tsx       # Tech tree
│   │   ├── InventoryScreen.tsx      # Item management
│   │   ├── MarketScreen.tsx         # Buy/sell items
│   │   ├── ContractsScreen.tsx      # Daily quests
│   │   └── ShopScreen.tsx           # Gem purchases
│   ├── services/
│   │   ├── firebaseService.ts       # Firebase SDK init
│   │   ├── gameLoopService.ts       # Game tick (5-sec updates)
│   │   ├── offlineProgressService.ts # Offline calculation
│   │   ├── economyService.ts        # Game balance math
│   │   ├── cloudFunctionsService.ts # Server-side logic calls
│   │   └── revenueCatService.ts     # IAP integration
│   ├── store/                       # Zustand state management
│   │   ├── playerStore.ts           # Player progression
│   │   ├── farmStore.ts             # Farm state
│   │   ├── marketStore.ts           # Marketplace & contracts
│   │   ├── remoteConfigStore.ts     # Remote balance params
│   │   └── uiStore.ts               # UI state & navigation
│   ├── hooks/
│   │   └── useGameUpdate.ts         # Start/stop game loop
│   ├── types/
│   │   └── game.ts                  # TypeScript interfaces
│   └── utils/
│       ├── constants.ts             # Game config & data
│       ├── helpers.ts               # Utility functions
│       └── firestoreSchema.ts       # DB structure docs
├── functions/
│   ├── cloudFunctions.example.ts    # Production implementations
│   └── index.ts                     # Deploy these functions
├── App.tsx                          # Root component
├── app.json                         # Expo config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
└── .github/
    └── copilot-instructions.md      # Dev guidelines
```

## Getting Started (Development)

### 1. Install Dependencies

```bash
cd FarmGame
npm install
```

### 2. Set Up Firebase

Create `.env` file with Firebase credentials:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

## Core Features

### 🌾 Farming System
- Plant 5 crop types (wheat, corn, tomato, lettuce, pumpkin)
- Growth timer with progress bar
- Harvest for coins & XP
- Storage management with expandable capacity

### 🐄 Animal Production
- 5 animal types with different production cycles
- Feed animals for better productivity
- Collect products (eggs, milk, wool, honey, cheese)
- Unhealthy indicator when not fed for 24h

### 🏢 Buildings & Upgrades
- Storage buildings (Silos, Warehouses)
- Processing buildings (Mills)
- 8+ permanent upgrades for farm bonuses
- Tech tree with prerequisites

### 💰 Economy & Marketplace
- Buy/sell items with price fluctuation
- Daily contracts with time limits
- Player-to-player trading (future)
- Real-time market prices (hourly updates)

### ⚡ Energy System
- Max energy: 100 (configured in constants)
- Regenerates at 5% per hour
- Spend for farm actions
- Instant refill with gems

### 💎 Monetization
- 4 gem packages ($0.99 - $49.99)
- RevenueCat integration for IAP
- Seasonal pass subscription
- No pay-to-win mechanics

## Implementation Checklist

### ✅ Phase 1: Core Setup (COMPLETE)
- [x] React Native + Expo scaffold
- [x] Firebase integration
- [x] TypeScript types & constants
- [x] Zustand store setup

### ✅ Phase 2: Gameplay (COMPLETE)
- [x] Farm UI with crop mechanics
- [x] Animal production system
- [x] Buildings and storage
- [x] Upgrade tech tree
- [x] Inventory management
- [x] Marketplace
- [x] Daily contracts
- [x] Gem shop

### ✅ Phase 3: Backend (READY FOR DEPLOYMENT)
- [x] Cloud Functions templates (see functions/cloudFunctions.example.ts)
- [x] Offline progress calculation
- [x] Marketplace validation
- [x] Contract generation
- [x] IAP verification

### ✅ Phase 4: Monetization (READY FOR INTEGRATION)
- [x] RevenueCat service wrapper
- [x] Gem shop UI
- [x] Product configuration template

### ⏳ Phase 5: Polish & Launch
- [ ] Animation polish (Reanimated + Lottie ready)
- [ ] Sound effects integration
- [ ] Tutorial/onboarding flow
- [ ] Performance optimization (profiling ready)
- [ ] A/B testing setup
- [ ] Play Store asset preparation
- [ ] App Store review submission

## Deployment Steps

### Firebase Setup

1. **Create Firebase Project**
   ```bash
   firebase init
   firebase login
   ```

2. **Enable Services**
   - Authentication (Email + Anonymous)
   - Firestore Database
   - Cloud Functions
   - Remote Config
   - Cloud Storage
   - Cloud Messaging

3. **Create Firestore Collections**
   ```
   players/     (user profiles)
   farms/       (farm state)
   marketListings/
   contracts/
   transactions/
   ```

4. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   firebase deploy --only functions
   ```

### RevenueCat Integration

1. Create account at https://www.revenuecat.com
2. Get API key from dashboard
3. Configure iOS app in App Store Connect
4. Configure Android app in Google Play Console
5. Install SDK: `npm install react-native-purchases`
6. Initialize in App.tsx with API key

### Play Store Submission

1. **App Signing**
   ```bash
   keytool -genkey -v -keystore ~/keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. **Build APK**
   ```bash
   eas build --platform android --auto-submit
   ```

3. **Submit to Play Store**
   - Generate screenshots
   - Write description
   - Set price & in-app products
   - Submit for review

### App Store Submission

1. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

2. **Submit to App Store**
   - Generate TestFlight build
   - Prepare marketing materials
   - Configure in-app purchases
   - Submit for review

## Performance Optimization

### Code Splitting
- Screens load on-demand
- Image lazy loading implemented
- Firebase persistence reduces network calls

### State Management
- Zustand minimal re-renders via selectors
- Only subscribed components update
- AsyncStorage for offline cache

### Animations
- React Native Reanimated native thread
- Runs at 60 FPS without blocking JS
- Lottie complex animations precompiled

### Database Indexing
- Composite indexes for common queries
- TTL policies on temporary data
- Archive old transactions monthly

## Security

### Frontend
- TypeScript strict mode prevents type errors
- Input validation on all user actions
- No sensitive data in logs

### Backend
- Cloud Functions validate all transactions
- Server-side timestamp prevents time cheating
- Firestore security rules enforce ownership
- Rate limiting on sensitive operations

### API Keys
- Use `.env` for secrets (never commit)
- Restrict Firebase API key to app
- Rotate keys quarterly
- Monitor Firebase Console alerts

## Monitoring & Analytics

### Firebase Analytics
- Track user progression events
- Monitor daily/monthly active users
- Identify monetization funnels
- Set up custom dashboards

### Crashlytics
- Auto-crash reporting
- Symbol upload for stack traces
- Alerts for critical crashes
- Release notes tracking

### Remote Config
- A/B test balance changes
- Disable features server-side
- Gradual rollout of updates
- Instant config updates (no app version needed)

## Debugging

### Development
```bash
# View logs
npx react-native log-android
npx react-native log-ios

# Debug mode
npm start --dev

# Use Flipper for network inspection
# Download at https://fbflipper.com
```

### Firebase Emulator
```bash
firebase emulators:start
# Access at http://localhost:4000
```

### Performance Profiling
```bash
# Android profiler in Android Studio
# Xcode instruments for iOS
# React DevTools for component performance
```

## Common Issues & Solutions

### npm install hangs
```bash
npm install --legacy-peer-deps --no-package-lock
```

### Firebase SDK errors
- Verify credentials in `.env`
- Check Firestore security rules
- Ensure Cloud Functions deployed

### iOS app crashes
- Check pod installation: `cd ios && pod install`
- Verify Xcode build settings
- Use Xcode Console for crash logs

### Android app crashes
- Check Android Studio Logcat
- Verify package name matches Play Store
- Test on physical device if emulator fails

## Next Steps

1. **Complete Cloud Functions** (see functions/cloudFunctions.example.ts)
2. **Test with Firebase Emulator**
3. **Set up CI/CD pipeline** (GitHub Actions)
4. **Prepare app store submissions**
5. **Run beta tests** (TestFlight/Play Store Beta)
6. **Monitor and iterate** based on user analytics

## Support & Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

## License

MIT - Feel free to use and modify

---

**Last Updated:** 2026-08-06
**Project Status:** Ready for Beta Testing
**Next Release:** v1.0.0 (Play Store)
