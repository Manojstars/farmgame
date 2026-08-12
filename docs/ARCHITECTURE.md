# Farm Life Architecture

## Project Overview

Farm Life is a React Native farm management game built with modern web technologies:

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Build System**: Expo EAS
- **Language**: TypeScript (strict mode)

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React Native | 0.74.0 | Mobile app framework |
| Expo | 51.0.0 | React Native tooling |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.0 | Type safety |
| Zustand | 4.5.0 | State management |
| AsyncStorage | 1.24.0 | Local persistence |
| Firebase | 21.0.0 | Backend services |

## Architecture Layers

```
┌─────────────────────────────────────┐
│   React Native Components           │
│   (src/components/)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Zustand Stores                    │
│   (src/store/)                      │
│   - Player State                    │
│   - Farm State                      │
│   - Market State                    │
│   - UI State                        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Game Services                     │
│   (src/services/)                   │
│   - Game Loop                       │
│   - Economy Calculations            │
│   - Offline Progress                │
│   - Firebase Integration            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Firebase Backend                  │
│   - Firestore Database              │
│   - Authentication                  │
│   - Cloud Functions                 │
│   - Remote Config                   │
└─────────────────────────────────────┘
```

## Directory Structure

```
FarmGame/
├── src/
│   ├── components/           # React Native screens & UI components
│   │   ├── HomeScreen.tsx
│   │   ├── FarmScreen.tsx
│   │   ├── MarketScreen.tsx
│   │   └── DeveloperDebugPanel.tsx (dev-only)
│   │
│   ├── store/                # Zustand state management
│   │   ├── playerStore.ts    # Player level, resources, XP
│   │   ├── farmStore.ts      # Farm plots, animals, buildings
│   │   ├── marketStore.ts    # Market data, contracts
│   │   ├── uiStore.ts        # UI state (current screen, etc.)
│   │   └── remoteConfigStore.ts  # Game balance config
│   │
│   ├── services/             # External integrations & business logic
│   │   ├── firebaseService.ts    # Firebase setup & auth
│   │   ├── gameLoopService.ts    # Game tick updates
│   │   ├── economyService.ts     # Economy calculations
│   │   ├── offlineProgressService.ts  # Offline progression
│   │   └── cloudFunctionsService.ts   # Future server logic
│   │
│   ├── types/                # TypeScript interfaces
│   │   ├── player.ts
│   │   ├── farm.ts
│   │   ├── market.ts
│   │   └── index.ts
│   │
│   ├── utils/                # Helper functions
│   │   ├── constants.ts      # Game constants
│   │   ├── formatters.ts     # Display formatting
│   │   └── validators.ts     # Input validation
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useGameLoop.ts    # Game update cycle
│   │
│   └── App.tsx               # Root app component
│
├── tests/                    # Jest tests
│   ├── farming.test.ts
│   ├── animals.test.ts
│   ├── economy.test.ts
│   └── README.md
│
├── docs/                     # Developer documentation
│   ├── ARCHITECTURE.md       # This file
│   ├── FIREBASE.md           # Firebase setup
│   ├── DEVELOPMENT.md        # Development workflow
│   └── GAME_ECONOMY.md       # Economy mechanics
│
├── scripts/                  # Developer scripts
│   ├── health-check.ps1      # Project validation
│   └── validate-assets.ps1   # Asset validation
│
├── .vscode/                  # VS Code configuration
│   ├── tasks.json            # Development tasks
│   ├── settings.json         # Editor settings
│   └── extensions.json       # Recommended extensions
│
├── .github/
│   └── copilot-instructions.md  # AI development guidelines
│
├── functions/                # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
├── tsconfig.json
├── app.json                  # Expo configuration
├── firebase.json             # Firebase configuration
├── firestore.rules           # Firestore security rules
├── .env.example              # Environment template
└── .gitignore
```

## State Management (Zustand)

### Player Store (`src/store/playerStore.ts`)

```typescript
interface PlayerState {
  // Identity
  uid: string;
  
  // Progression
  level: number;
  xp: number;
  
  // Resources
  coins: number;
  gems: number;
  energy: number;
  
  // Inventory
  inventory: Record<string, number>;
  
  // Actions
  addCoins(amount: number): void;
  addGems(amount: number): void;
  addXP(amount: number): void;
  setEnergy(amount: number): void;
}
```

### Farm Store (`src/store/farmStore.ts`)

```typescript
interface FarmState {
  uid: string;
  plots: Plot[];
  animals: Animal[];
  buildings: Building[];
  
  // Actions
  plantCrop(plotId: string, cropType: string): void;
  harvestCrop(plotId: string): void;
  completeCrop(plotId: string): void;
  // ... more actions
}
```

## Data Flow

### Local State Update

```
User Action (tap button)
         ↓
Component Handler
         ↓
Zustand Action
         ↓
Update Local Store
         ↓
AsyncStorage (persist)
         ↓
Re-render Component
```

### Firebase Sync

```
Local Store Updated
         ↓
Service Layer (gameLoopService)
         ↓
Firebase Write
  (player/{uid})
         ↓
Firestore Database
         ↓
Real-time Listener Updates Store
         ↓
Re-render Components
```

## Game Loop

The game loop runs continuously, updating game state:

```typescript
// In App.tsx
useEffect(() => {
  const interval = setInterval(() => {
    // Update crop growth
    // Update animal production
    // Regenerate energy
    // Check for notifications
    // Sync with Firebase
  }, 1000); // Every second
  
  return () => clearInterval(interval);
}, []);
```

## Firebase Integration

### Collections

| Collection | Purpose | Access |
|-----------|---------|--------|
| `players/{uid}` | Player game state | Private (self only) |
| `farms/{uid}` | Farm layout | Private (self only) |
| `marketListings/*` | Price data | Public read |
| `contracts/{contractId}` | Daily orders | Private (self only) |
| `transactions/*` | Audit trail | Private (self only) |

### Real-time Listeners

Components subscribe to Firestore data:

```typescript
// In component
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'players', userId),
    (doc) => {
      // Update store when data changes
      setPlayerData(doc.data());
    }
  );
  
  return () => unsubscribe();
}, [userId]);
```

## Offline First Architecture

The app works offline:

1. **Local First**: All gameplay happens locally in Zustand stores
2. **Persistent**: State is saved to AsyncStorage
3. **Sync**: Background service syncs to Firebase when online
4. **Conflict Resolution**: Server-side timestamps resolve conflicts

Example:

```
Player is offline
  ↓
Harvest wheat (local store updated)
  ↓
AsyncStorage saves state
  ↓
User comes online
  ↓
Background sync pushes harvest to Firebase
  ↓
Firebase real-time listener updates store
```

## Type Safety

All data structures have TypeScript interfaces:

```typescript
// src/types/player.ts
export interface Player {
  uid: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  inventory: Inventory;
  settings: PlayerSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Components use types
function PlayerCard(props: { player: Player }) {
  return <Text>{props.player.level}</Text>;
}
```

## Error Handling

### Development

- TypeScript strict mode catches type errors
- Console logs for debugging
- Developer Debug Panel for inspection

### Production

- Firebase Crashlytics for error tracking
- Silent error handling (don't crash app)
- Graceful degradation when services fail

## Performance Optimizations

### Render Optimization
- Zustand selectors prevent unnecessary re-renders
- Memoized components for expensive renders
- Lazy loading of screens

### Bundle Size
- No Redux (use Zustand)
- Tree-shake unused dependencies
- Target: < 50 MB app bundle

### Game Loop Efficiency
- Throttle expensive calculations
- Cache computed values
- Batch Firebase writes

## Testing Strategy

### Unit Tests
- Game logic (economy, farming)
- Calculations (offline progress, earnings)

### Integration Tests
- Store updates trigger Firebase writes
- Offline sync works correctly

### E2E Tests
- Full game flow (plant → harvest → sell)

## Deployment

### Development
- Local Firebase Emulator
- Expo development server
- TypeScript type checking

### Production
- EAS Build for Android/iOS
- Production Firebase project
- Remote Config for live balance
- Sentry for error tracking

## Future Improvements

- [ ] Cloud Functions for economy validation
- [ ] Real-time multiplayer (trading between players)
- [ ] Leaderboards
- [ ] Social features
- [ ] Advanced analytics
- [ ] Push notifications

## Common Patterns

### Creating New Feature

1. **Define Types** (`src/types/`)
2. **Create Store** (`src/store/`)
3. **Add Services** (`src/services/`)
4. **Build Components** (`src/components/`)
5. **Write Tests** (`tests/`)
6. **Update Docs** (`docs/`)

### Adding Game Balance Parameter

1. Create Remote Config parameter
2. Add selector to `remoteConfigStore`
3. Use in `economyService`
4. Test with different values
5. Deploy to production

## See Also

- [Firebase Setup](./FIREBASE.md)
- [Game Economy](./GAME_ECONOMY.md)
- [Development Workflow](./DEVELOPMENT.md)
