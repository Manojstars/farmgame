# FarmGame - Development Instructions

## Project Overview

FarmGame is a React Native farm management game built with Expo, Firebase, and Zustand. This document provides guidance for development and maintaining code quality.

## Development Environment Setup

### Prerequisites
- Node.js v18+
- npm v9+
- Expo CLI installed globally
- Firebase project created

### Initial Setup
```bash
cd FarmGame
npm install
npm start
```

## Code Organization

- **src/components/**: React components for UI
- **src/hooks/**: Custom React hooks
- **src/services/**: External service integrations (Firebase, APIs)
- **src/store/**: Zustand state management stores
- **src/types/**: TypeScript interface definitions
- **src/utils/**: Helper functions and constants
- **functions/**: Firebase Cloud Functions (TypeScript)

## Coding Standards

### TypeScript
- All new code must be written in TypeScript
- Use strict mode: `strict: true` in tsconfig.json
- Define interfaces for all data structures in `src/types/`

### Code Style
- Use ESLint for linting: `npm run lint`
- Use Prettier for formatting: `npm run format`
- Line length: max 100 characters
- Indentation: 2 spaces

### React & React Native
- Use functional components with hooks
- Follow React best practices for performance
- Keep components focused and reusable
- Use Zustand for global state (no Redux)

## Firebase Configuration

### Required Environment Variables
Create a `.env` file in the project root:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
REVENUECAT_API_KEY=your_revenuecat_key
```

### Firestore Structure
```
players/{uid}/
  - level, xp, coins, gems, energy, inventory
farms/{uid}/
  - plots[], animals[], buildings[], storage
marketListings/{itemId}/
  - itemName, basePrice, currentPrice, supplyLevel
contracts/{contractId}/
  - itemName, quantity, dueAt, reward, completed
transactions/{transactionId}/
  - type, itemName, quantity, timestamp
```

## State Management (Zustand)

Stores are located in `src/store/`:
- `playerStore.ts`: Player level, resources, inventory
- `farmStore.ts`: Farm state (crops, animals, buildings)
- `marketStore.ts`: Marketplace listings and contracts
- `remoteConfigStore.ts`: Game balance parameters from Firebase Remote Config
- `uiStore.ts`: Current screen, notifications, loading state

### Adding New State
1. Create a store file in `src/store/`
2. Define TypeScript interface for the store
3. Implement Zustand store with persist middleware
4. Export the hook for use in components

Example:
```typescript
export const useNewStore = create<NewStore>()(
  persist(
    (set) => ({
      // state and actions
    }),
    {
      name: 'new-store',
      storage: AsyncStorage,
    }
  )
);
```

## Services & APIs

### Firebase Services
Located in `src/services/firebaseService.ts`:
- Authentication
- Firestore (real-time database)
- Cloud Functions (server logic)
- Remote Config (live balance tuning)
- Analytics (tracking)
- Crashlytics (error monitoring)
- Cloud Messaging (push notifications)
- Cloud Storage (assets)

### Game Services
- `gameLoopService.ts`: Timed game updates
- `offlineProgressService.ts`: Offline progression calculation
- `economyService.ts`: Game balance calculations

## Development Workflow

### Creating a New Feature

1. **Plan**: Identify required components, stores, and services
2. **Types**: Define TypeScript interfaces in `src/types/`
3. **Store**: Update Zustand store if state is needed
4. **Services**: Create services if external API calls needed
5. **Components**: Build UI components in `src/components/`
6. **Integration**: Connect components to stores and services
7. **Testing**: Test locally on iOS/Android
8. **Styling**: Use React Native StyleSheet for performance

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Performance Guidelines

- Use Zustand selectors to avoid unnecessary re-renders
- Memoize expensive computations
- Lazy-load components and screens
- Profile animations with Reanimated DevTools
- Keep bundle size < 50 MB

## Push Notifications (Cloud Messaging)

Notifications are sent via Firebase Cloud Messaging (FCM):
- Crop ready notifications
- Contract deadline alerts
- Weather event broadcasts
- Marketplace price alerts

Configuration:
- Test locally with Expo notification tool
- Set quiet hours in user settings (e.g., 10pm-8am)

## Analytics & Monitoring

### Firebase Analytics Events
Track in-game actions for retention analysis:
- `level_up`: Player progression
- `crop_sold`: Economy tracking
- `gem_purchased`: Monetization
- `contract_completed`: Engagement
- `app_opened`, `screen_viewed`: Retention

### Crashlytics
Automatic error tracking - no additional setup needed beyond Firebase initialization.

## Cloud Functions Development

Cloud Functions handle critical game logic:

1. Create function in `functions/src/`
2. Export function: `export const myFunction = functions.https.onCall(...)`
3. Deploy: `firebase deploy --only functions`
4. Test: Use Firebase Emulator Suite

### Function Examples
- `calculateOfflineProgress()`: Prevent time cheating
- `onSellCrop()`: Marketplace transaction validation
- `updateMarketPrices()`: Price simulation (hourly)
- `generateDailyContracts()`: Create daily orders

## Remote Config for Live Balance

Tune game balance without app updates:

1. Go to Firebase Console → Remote Config
2. Add parameters (e.g., `cropGrowthSpeedMultiplier`)
3. Fetch in app: `useRemoteConfigStore.getState().fetchConfig()`
4. Use values: `remoteConfig.getConfigValue('key', defaultValue)`

Common parameters:
- `cropGrowthSpeedMultiplier` (0.5 - 2.0)
- `coinEarningMultiplier` (0.5 - 2.0)
- `xpEarningMultiplier` (0.5 - 2.0)
- `energyRegenerationRate` (0.5 - 2.0)

## Debugging

### Enable Debug Mode
Set `DEBUG_MODE=true` in `.env`

### View Logs
```bash
npm start
# Press 'j' for logs
```

### Inspect Firestore
Firebase Console → Firestore Database → Browse collections

### Profile Performance
```bash
# React Native debugger
npm start
# Press 'd' to open debugger
```

## Deployment

### Play Store
1. Build signed APK/AAB: `eas build --platform android --distribution store`
2. Create Play Store listing in Google Play Console
3. Submit for review (24-48 hours)

### App Store
1. Build for iOS: `eas build --platform ios --distribution store`
2. Upload to App Store Connect
3. Submit for review (1-3 days)

## Common Issues

### Firebase not initializing
- Check `.env` file has correct credentials
- Verify Firebase Console project settings
- Clear cache: `expo cache clean`

### Zustand state not persisting
- Check AsyncStorage permissions (Android 13+)
- Verify persist middleware configuration
- Clear AsyncStorage in settings if needed

### npm install fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Use `npm ci` for CI/CD environments

## Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Zustand GitHub](https://github.com/pmndrs/zustand)

## Questions?

Refer to project README.md or Firebase Console documentation for more details.
