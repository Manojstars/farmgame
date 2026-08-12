# Development Workflow

## Quick Start

### 1. First Time Setup

```bash
# Clone repository
git clone https://github.com/Manojstars/farmgame.git
cd farmgame

# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Run health check
npm run health-check
```

### 2. Start Development

```bash
# Terminal 1: Start Firebase Emulator (optional but recommended)
firebase emulators:start

# Terminal 2: Start Expo development server
npm start

# Press 'a' for Android or 'i' for iOS
```

### 3. Open Developer Debug Panel (Dev Only)

- Shake device or press Ctrl+M (Android) / Cmd+D (iOS)
- Select "Show Dev Panel"
- Modify player state, money, XP for testing

## Using VS Code Tasks

All common commands are available as VS Code tasks:

Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to see tasks:

- **Farm Life: Full Health Check** - Validate project setup
- **Farm Life: Start** - Start Expo dev server
- **Farm Life: Start Clean** - Clear cache and restart
- **Farm Life: Type Check** - Run TypeScript validation
- **Farm Life: Expo Doctor** - Diagnose Expo environment
- **Farm Life: Firebase Emulator** - Start local Firebase
- **Farm Life: Test** - Run Jest tests
- **Farm Life: Build Preview** - Build preview APK

## Development Cycle

### For UI Changes

```bash
# 1. Make component changes
nano src/components/HomeScreen.tsx

# 2. TypeScript validation (automatic in VS Code)
npm run tsc

# 3. App hot-reloads automatically (usually)
# If not, press 'r' in terminal to refresh

# 4. Test on device/emulator
```

### For Game Logic Changes

```bash
# 1. Update game logic
nano src/services/economyService.ts

# 2. Update types if needed
nano src/types/index.ts

# 3. Run TypeScript check
npm run tsc

# 4. Run relevant tests
npm test -- economy.test.ts

# 5. Manual test in app
```

### For Store/State Changes

```bash
# 1. Update store
nano src/store/playerStore.ts

# 2. TypeScript validation
npm run tsc

# 3. Components using store auto-update
# (Zustand will re-render consumers)

# 4. Check DevTools in Debug Panel
```

## Testing Workflow

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- farming.test.ts

# Run in watch mode (reruns on changes)
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Manual Testing

1. **Start app**
   ```bash
   npm start
   ```

2. **Open Debug Panel**
   - Shake device (or Ctrl+M on Android)
   - Select "Show Dev Panel"

3. **Test features**
   - Add coins/gems to test economy
   - Complete crops/animals to test mechanics
   - Check Firestore updates

4. **Verify Firestore**
   - Open Emulator UI: http://localhost:4000
   - Navigate to Firestore tab
   - Check player data was updated correctly

## Debugging

### In VS Code

1. **Open Terminal**
   - `npm start`

2. **Press 'd'** to open React Native Debugger
   - Breakpoints
   - Step through code
   - Inspect variables

3. **Logs**
   - Press 'j' for logs
   - Filter by module: `console.log('[Module] message')`

### In Emulator UI

**Firebase Emulator UI**: http://localhost:4000

- **Authentication**: Create test users
- **Firestore**: Browse database structure
- **Functions**: Monitor function calls
- **Logs**: View all emulator activity

### Common Issues

#### App won't start
```bash
# 1. Clear cache
expo cache clean

# 2. Clear bundler cache
rm -rf node_modules/.cache

# 3. Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps

# 4. Start fresh
npm start
```

#### TypeScript errors
```bash
# 1. Check errors
npm run tsc

# 2. Common fixes:
# - Import missing types
# - Add type annotations
# - Check for typos

# Example:
# ❌ const player = undefined;  // Type error
# ✅ const player: Player | undefined = undefined;  // Fixed
```

#### Firebase emulator won't connect
```bash
# 1. Verify emulator is running
# Open http://localhost:4000

# 2. Check app environment
# .env should have: APP_ENV=development

# 3. Check firebaseService.ts
# Verify connectAuthEmulator and connectFirestoreEmulator are called

# 4. Restart emulator
firebase emulators:stop
firebase emulators:start
```

#### Data not persisting
```bash
# 1. Check AsyncStorage
# Debug Panel shows storage size

# 2. Check Firestore
# Emulator UI → Firestore tab

# 3. Check permissions
# If real Firebase: verify security rules allow writes
```

## Code Organization

### When to Create a New File

**New Component**: `src/components/MyComponent.tsx`
- Screens: `src/components/MyScreen.tsx`
- Reusable UI: `src/components/MyButton.tsx`

**New Store**: `src/store/myStore.ts`
- Only if managing substantial new state
- Check existing stores first
- Use Zustand pattern from existing stores

**New Service**: `src/services/myService.ts`
- External API calls
- Complex calculations
- Async operations
- Check existing services first

**New Type**: `src/types/myType.ts`
- All custom types in `src/types/`
- Export from `src/types/index.ts`
- Use in components and stores

**New Utility**: `src/utils/myUtil.ts`
- Helper functions
- Constants
- Formatters

### Import Organization

Always organize imports in this order:

```typescript
// 1. React & React Native
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. External libraries
import { LinearGradient } from 'expo-linear-gradient';

// 3. Services
import { firebaseService } from '@services/firebaseService';

// 4. Stores
import { usePlayerStore } from '@store/playerStore';

// 5. Components
import { PlayerCard } from '@components/PlayerCard';

// 6. Types
import type { Player } from '@types/index';

// 7. Utils & constants
import { COLORS } from '@utils/constants';
```

## Git Workflow

### Committing Changes

```bash
# Check what changed
git status

# Stage specific files
git add src/components/MyComponent.tsx

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add new farming feature"

# Or run task (auto-formats commit message)
# VS Code: Run "Commit" task
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

Examples:
- `feat: add market screen`
- `fix: prevent negative coin bug`
- `docs: update Firebase setup guide`
- `refactor: simplify economy calculations`

### Before Push

```bash
# 1. Run full health check
npm run health-check

# 2. Run tests
npm test

# 3. Type check
npm run tsc

# 4. Push to branch
git push origin feature/my-feature
```

## Performance Optimization

### Profiling

**React Native Profiler**:
```bash
npm start
# Press 'd' to open debugger
# Tools → Performance Monitor
```

**Memory Usage**:
```bash
# Press 'd' to open debugger
# Tools → React Profiler
# Identify heavy components
```

### Common Optimizations

#### Prevent Re-renders

**Before** (causes re-render of everything):
```typescript
function Home() {
  const store = usePlayerStore();
  return <Text>{store.level}</Text>;
}
```

**After** (only re-render when level changes):
```typescript
function Home() {
  const level = usePlayerStore(state => state.level);
  return <Text>{level}</Text>;
}
```

#### Memoize Components

```typescript
import React from 'react';

const PlayerCard = React.memo(({ player }: { player: Player }) => {
  return <View>{/* render */}</View>;
});
```

#### Lazy Load Heavy Screens

```typescript
const MarketScreen = lazy(() => import('./MarketScreen'));

<Suspense fallback={<Loading />}>
  <MarketScreen />
</Suspense>
```

## Adding New Features

### Step-by-Step Example: Add new crop

1. **Define Type** (`src/types/index.ts`)
   ```typescript
   export interface Crop {
     id: string;
     type: 'wheat' | 'corn' | 'pumpkin' | 'newCrop';
     level: number;
     plantedAt: Date;
   }
   ```

2. **Add to Store** (`src/store/farmStore.ts`)
   ```typescript
   plantCrop(type: CropType): void {
     // Add crop to plots
   }
   ```

3. **Create Component** (`src/components/CropCard.tsx`)
   ```typescript
   export const CropCard: React.FC<{ crop: Crop }> = ({ crop }) => {
     // Display crop
   }
   ```

4. **Update Economy** (`src/services/economyService.ts`)
   ```typescript
   const cropEarnings = {
     wheat: 50,
     newCrop: 100,
   };
   ```

5. **Write Tests** (`tests/farming.test.ts`)
   ```typescript
   test('new crop has correct earnings', () => {
     // Test earnings
   });
   ```

6. **Run TypeScript**
   ```bash
   npm run tsc
   ```

7. **Test in App**
   ```bash
   npm start
   # Use Debug Panel to test
   ```

## Release Checklist

Before making a production build:

- [ ] Run `npm run health-check`
- [ ] Run `npm test`
- [ ] Run `npm run tsc`
- [ ] Test core features on device
- [ ] Update documentation
- [ ] Update version in `app.json`
- [ ] Create release notes
- [ ] Tag release in git: `git tag v1.0.0`

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Run `npm run health-check`
3. Check Firebase Emulator UI: http://localhost:4000
4. Review test files for examples
5. Read error messages carefully (TypeScript is very helpful!)
