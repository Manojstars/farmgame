# FarmGame - AI Development & Project Constraints

## Project Overview

FarmGame is a React Native farm management game built with Expo, Firebase, and Zustand. This document provides guidance for AI agents and developers on maintaining code quality and architectural integrity.

## CRITICAL PROJECT CONSTRAINTS

⚠️ **DO NOT VIOLATE THESE CONSTRAINTS**

- **Expo SDK 50** — Do not upgrade Expo unless explicitly approved. Currently running Expo 51.x; SDK 50 is our target.
- **React Native 0.74.0** — Do not upgrade unless explicitly approved.
- **TypeScript strict mode** — Always `strict: true`. No `any` or `@ts-ignore`.
- **Firebase is the backend** — Do not introduce a custom backend.
- **Client-side gameplay** — Keep gameplay logic client-side unless server-side validation is genuinely required.
- **Zustand for state** — No Redux or other state managers.
- **AsyncStorage for persistence** — Local state storage only.
- **Firestore for sync** — Cloud persistence and synchronization.
- **No speculative upgrades** — Do not upgrade dependencies without approval.
- **No production data** — Do not modify production Firebase data during local development.
- **Preserve existing architecture** — Do not rewrite working code.
- **Small, reversible changes** — Make minimal changes that can be undone if needed.
- **TypeScript validation** — Run `npx tsc --noEmit` after every meaningful code change.
- **No duplicate services** — Find and reuse existing types, stores, and services before creating new ones.

## AI AGENT RULES

When working on this project, AI agents MUST:

1. **Understand before changing** — Read existing architecture and code patterns before making changes.
2. **Find and reuse** — Search for existing types, stores, and services. Do not duplicate.
3. **Make the smallest safe change** — Solve the problem with minimal modifications.
4. **Never hide TypeScript errors** — All code must compile with strict mode. No `any` or `@ts-ignore`.
5. **Never upgrade Expo** — Respect SDK 50 constraint. If Expo features are needed, request approval first.
6. **Validate after changes** — Run `npx tsc --noEmit` after code changes.
7. **Run relevant tests** — After changing gameplay logic, run tests to verify behavior.
8. **Protect production data** — Never modify production Firebase data. Use emulator for local dev.
9. **Keep configuration data-driven** — Store balance values in Remote Config, not hardcoded.
10. **Avoid duplicate architecture** — Do not create duplicate services, stores, or utilities.

### Before Starting Any Change

- [ ] Find existing types in `src/types/` that match your use case
- [ ] Check existing stores in `src/store/` for related state
- [ ] Search existing services in `src/services/` for functionality
- [ ] Read existing components in `src/components/` for patterns
- [ ] Verify if a utility function already exists in `src/utils/`

### After Making Any Change

- [ ] Run `npx tsc --noEmit` to verify TypeScript compilation
- [ ] Run relevant tests if gameplay logic changed
- [ ] Verify no production Firebase writes during development
- [ ] Confirm change is reversible and minimal

## Development Environment Setup

### Prerequisites
- Node.js v18+
- npm v9+
- Expo CLI installed globally (`npm install -g expo-cli`)
- Firebase project created with authentication and Firestore

### Initial Setup
```bash
cd FarmGame
npm install
npm start
```

### Verify Environment
```bash
npm run health-check          # Full health check (RECOMMENDED)
npm run tsc                    # TypeScript validation
npx expo --version            # Verify Expo version (should be ~51.0.0)
npx expo doctor                # Check Expo environment
```

### Environment Variables
Create a `.env` file in the project root (use `.env.example` as template):
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
REVENUECAT_API_KEY=your_revenuecat_key
APP_ENV=development
DEBUG_MODE=true
```

**IMPORTANT:** Never commit `.env` file. Use `.env.example` for templates only.

## Project Structure

```
FarmGame/
├── src/
│   ├── components/          # React Native UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # External service integrations (Firebase, APIs)
│   ├── store/               # Zustand state management stores
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/               # Helper functions and constants
│   └── App.tsx              # Root app component
├── functions/               # Firebase Cloud Functions (TypeScript)
├── scripts/                 # Developer scripts (health-check, etc.)
├── tests/                   # Automated tests
├── docs/                    # Developer documentation
├── .vscode/                 # VS Code configuration
│   ├── tasks.json           # Development tasks
│   ├── settings.json        # Editor settings
│   └── extensions.json      # Recommended extensions
├── .github/
│   └── copilot-instructions.md  # This file
├── .env.example             # Environment variables template
├── tsconfig.json            # TypeScript configuration (strict: true)
├── package.json             # Dependencies & npm scripts
└── app.json                 # Expo app configuration
```

### Key Directories

- **src/components/**: React Native UI components (screens, dialogs, etc.)
- **src/hooks/**: Custom React hooks for shared logic
- **src/services/**: External integrations
  - `firebaseService.ts`: Firebase initialization and auth
  - `gameLoopService.ts`: Game tick updates
  - `offlineProgressService.ts`: Offline progression
  - `economyService.ts`: Balance calculations
- **src/store/**: Zustand stores (one file per store)
  - `playerStore.ts`: Player state (level, XP, resources)
  - `farmStore.ts`: Farm state (crops, animals, buildings)
  - `marketStore.ts`: Market listings and contracts
  - `remoteConfigStore.ts`: Game configuration from Firebase
  - `uiStore.ts`: UI state (current screen, notifications)
- **src/types/**: TypeScript interfaces for all data structures
- **src/utils/**: Constants, helper functions, formatters

## Coding Standards

### TypeScript (STRICT MODE REQUIRED)

- **`strict: true`** in `tsconfig.json` — All code must pass strict compilation
- **No `any` type** — Use explicit types for all variables and function parameters
- **No `@ts-ignore`** — Never use to hide errors. Fix the issue instead.
- **Explicit return types** — Functions must have explicit return types
- **No optional chaining without guards** — Check for null/undefined explicitly
- **All data structures** must have TypeScript interfaces in `src/types/`

Example:
```typescript
// ✅ GOOD
interface Player {
  id: string;
  level: number;
  coins: number;
}

function addCoins(player: Player, amount: number): Player {
  return { ...player, coins: player.coins + amount };
}

// ❌ BAD
function addCoins(player: any, amount: any) {
  player.coins += amount;  // Violates strict mode
  return player;
}

// ❌ BAD
function addCoins(player: Player, amount: number) {
  // @ts-ignore - hiding an error
  player.coins += amount;
  return player;
}
```

### Code Style

- **ESLint** — Check configuration in `.eslintrc.json`
- **Prettier** — Format code automatically
- **Line length** — Max 100 characters for readability
- **Indentation** — 2 spaces (configured in Prettier)
- **Imports** — Sort and group logically:
  1. React/React Native
  2. External libraries
  3. Internal services
  4. Internal stores
  5. Internal components
  6. Types

Example:
```typescript
// ✅ GOOD import order
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { firebaseService } from '@services/firebaseService';
import { usePlayerStore } from '@store/playerStore';
import { PlayerCard } from '@components/PlayerCard';
import type { Player } from '@types/player';
```

### React & React Native

- **Functional components with hooks** — No class components
- **React best practices** — Avoid unnecessary re-renders with selectors
- **Zustand selectors** — Use for granular store subscriptions
- **Keep components focused** — Single responsibility principle
- **Reusable components** — Extract common patterns into utilities
- **Performance** — Profile animations with Reanimated DevTools
- **AsyncStorage** — For local persistence only (Firestore for sync)

Example:
```typescript
// ✅ GOOD
const PlayerLevel: React.FC = () => {
  const level = usePlayerStore((state) => state.level);
  const addXP = usePlayerStore((state) => state.addXP);
  
  return (
    <View>
      <Text>Level: {level}</Text>
    </View>
  );
};

// ❌ BAD - causes unnecessary re-renders
const PlayerLevel: React.FC = () => {
  const playerStore = usePlayerStore();
  return <Text>Level: {playerStore.level}</Text>;
};
```

### No Duplicate Code

- **Check existing services** before creating new ones
- **Check existing stores** before adding new state
- **Check existing utilities** before adding helper functions
- **Check existing types** before defining new interfaces
- **Reuse patterns** from existing components

## Firebase Configuration & Safety

### Required Environment Variables

Create `.env` file in project root:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
REVENUECAT_API_KEY=your_revenuecat_key
APP_ENV=development
DEBUG_MODE=true
```

### ⚠️ PRODUCTION DATA PROTECTION

**CRITICAL RULES:**

1. **Never modify production data during local development**
   - Use Firebase Emulator for local development
   - Verify `APP_ENV=development` in `.env`
   - Never authenticate against production Firebase with test data

2. **Verify emulator is running before development**
   ```bash
   npm run firebase:emulator
   ```

3. **Production database is READ-ONLY** during development
   - If a script accesses production, it must be read-only
   - Cloud Functions handle all write operations
   - Client can only read player's own data

4. **Before any production write, ask:**
   - Is this user-initiated action?
   - Is this server-validated (Cloud Function)?
   - Is this the actual production environment?

### Firestore Structure

```
players/{uid}/
  - uid: string
  - level: number
  - xp: number
  - coins: number
  - gems: number
  - energy: number
  - inventory: { itemName: quantity }

farms/{uid}/
  - uid: string
  - plots: []
  - animals: []
  - buildings: []
  - storage: {}

marketListings/{itemId}/
  - itemName: string
  - basePrice: number
  - currentPrice: number
  - supplyLevel: number

contracts/{contractId}/
  - itemName: string
  - quantity: number
  - dueAt: timestamp
  - reward: { coins, xp }
  - completed: boolean

transactions/{transactionId}/
  - type: 'sell' | 'buy' | 'harvest'
  - itemName: string
  - quantity: number
  - timestamp: timestamp
```

### Firebase Security Rules

Security rules are defined in `firestore.rules`. Key principles:

- **Users can only read/write their own data**
- **Public reads** for market listings only
- **Server-side validation** via Cloud Functions for economy
- **No public writes** except through authenticated Cloud Functions

## Dependency Management

### ⚠️ STRICT VERSION RULES

**Current Versions (DO NOT UPGRADE):**
- Expo: 51.0.0 (SDK 51, target: 50 when ready)
- React Native: 0.74.0
- React: 18.2.0
- TypeScript: ~5.3.0
- Zustand: ^4.5.0

### When to Upgrade Dependencies

**Only if:**
1. Explicitly requested by project owner
2. Security vulnerability found
3. Breaking bug that blocks development

**Process:**
1. Request approval BEFORE upgrading
2. Upgrade one package at a time
3. Run `npm run health-check` after upgrade
4. Run full test suite
5. Test on device/emulator
6. Document breaking changes
7. Be prepared to revert if issues arise

### Adding New Dependencies

**Before installing:**
1. Check if functionality already exists in current deps
2. Verify package is actively maintained
3. Check bundle size impact
4. Request approval if major dependency
5. Update documentation

**Never add:**
- Redux (use Zustand)
- Custom state solutions (use Zustand)
- Custom backend solutions (Firebase only)
- Unnecessary polyfills
- Unmaintained packages


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
