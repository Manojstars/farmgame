# FarmGame - American Farm Management Game

A comprehensive farm management game for React Native with Firebase backend, built with Expo for easy deployment to Play Store and App Store.

## 🎮 Game Overview

FarmGame is a management/tycoon farm simulation where players:
- Plant and harvest crops
- Raise and care for animals
- Manage buildings and upgrades
- Participate in a global marketplace
- Complete timed contracts for bonuses
- Experience weather events and random occurrences
- Progress through levels and unlock new content

## 🛠 Tech Stack

### Frontend
- **React Native** with **Expo** for cross-platform development
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native Reanimated** v4 for smooth animations
- **Lottie** for complex animations
- **AsyncStorage** for local persistence

### Backend
- **Firebase Authentication** for user accounts
- **Firestore** for real-time database
- **Cloud Functions** for server-side logic
- **Remote Config** for live balance tuning
- **Cloud Messaging** for push notifications
- **Analytics & Crashlytics** for monitoring
- **Cloud Storage** for assets
- **RevenueCat** for subscriptions and IAP

## 📁 Project Structure

```
FarmGame/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase and external services
│   ├── store/           # Zustand stores (state management)
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utility functions
├── functions/           # Cloud Functions (TypeScript)
├── assets/             # Images, icons, animations
├── app.json            # Expo configuration
├── tsconfig.json       # TypeScript configuration
├── babel.config.js     # Babel configuration
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Expo CLI: `npm install -g expo-cli`
- Firebase account with a project created

### Installation

1. **Clone the repository**
   ```bash
   cd FarmGame
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a `.env` file based on `.env.example`
   - Add your Firebase credentials from the Firebase Console
   - Update `src/services/firebaseService.ts` with your config

4. **Start the development server**
   ```bash
   npm start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📱 Development Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

## 🔥 Firebase Setup

### Required Firestore Collections

- **players**: User account and level data
- **farms**: Farm state (crops, animals, buildings)
- **marketListings**: Global marketplace prices
- **contracts**: Active contracts/quests
- **transactions**: Transaction audit trail

### Required Cloud Functions

- `onSellCrop()` - Marketplace sell validation
- `updateMarketPrices()` - Hourly price simulation
- `generateDailyContracts()` - Create daily orders
- `calculateOfflineProgress()` - Simulate offline progression
- `triggerWeatherEvent()` - Random event broadcast
- `onPurchaseComplete()` - Handle IAP receipts (via RevenueCat)

### Remote Config Parameters

- `cropGrowthSpeedMultiplier` (number)
- `coinEarningMultiplier` (number)
- `xpEarningMultiplier` (number)
- `startingCoins` (number)
- And more for live balance tuning

## 🎯 Implementation Phases

### Phase 1: Project Setup ✅
- [x] Initialize React Native + Expo
- [x] Set up Firebase configuration
- [x] Create TypeScript interfaces
- [x] Set up Zustand stores

### Phase 2: Core Gameplay (In Progress)
- [ ] Farm UI & farming mechanics
- [ ] Animal production system
- [ ] Buildings & storage
- [ ] Upgrade & tech tree

### Phase 3: Economy & Progression
- [ ] Marketplace system
- [ ] Contracts/quests
- [ ] Weather & events
- [ ] Cloud Functions

### Phase 4: Monetization
- [ ] RevenueCat integration
- [ ] Gem system
- [ ] In-app purchases
- [ ] Subscriptions

### Phase 5: Push Notifications
- [ ] Cloud Messaging setup
- [ ] Smart engagement notifications
- [ ] Analytics integration

### Phase 6: Polish & Optimization
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Game balance tuning
- [ ] Play Store submission

## 📊 Game Economy

### Resource Types
- **Coins**: Soft currency earned through gameplay
- **Gems**: Premium currency for purchases
- **Energy**: Action points for farm activities
- **XP**: Experience for leveling up

### Progression
- **Levels**: Unlock new crops, animals, buildings
- **Upgrades**: Improve farm efficiency
- **Contracts**: Time-based orders for bonuses

## 🔐 Security

- Firebase Security Rules enforce user isolation
- Cloud Functions validate all economy transactions
- RevenueCat handles IAP receipt validation
- Offline calculations use server-side timestamps to prevent cheating

## 📈 Analytics

- Track level progression curves
- Monitor player retention
- Measure gem conversion rates
- Identify churn points
- A/B test balance changes via Remote Config

## 🐛 Debugging

Enable debug mode in `.env`:
```
DEBUG_MODE=true
```

View logs:
```bash
npm start
```

Use Firebase Console for:
- Firestore data inspection
- Cloud Function logs
- Analytics dashboards
- Crash reports

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Follow the existing code style (ESLint/Prettier)
3. Add TypeScript types for new code
4. Test changes locally
5. Commit with clear messages
6. Submit a pull request

## 📄 License

MIT

## 🎓 Learning Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🤝 Support

For issues, questions, or suggestions, please file an issue in the repository.

---

**Status**: Currently in Phase 1 (Project Setup)
**Target Release**: Q4 2024 (Google Play Store & Apple App Store)
