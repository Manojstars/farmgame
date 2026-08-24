# FarmGame World Redesign — Step-by-Step Implementation Roadmap

## Quick Reference

### Current Problem
```
App.tsx
  → HomeScreen (Dashboard with 8 buttons)
     💰💎⚡🌾🐄🏢⭐🎒🏪📋🛍️
     
User navigates between disconnected screens
```

### Target Solution
```
App.tsx
  → GameWorldScreen
     ┌─────────────────────────────┐
     │ Level 1 Farmer | XP ████░   │ ← HUD
     ├─────────────────────────────┤
     │  🌿🌿🏡🌿🌿                 │
     │  🌿👨🌿🐄🌿                 │ ← Game World
     │  🌿🌾🌿🌿🌿                 │
     │  🛍️ 🌿🌿🌿🏢               │
     ├─────────────────────────────┤
     │ Farm | Inv | Shop | Market  │ ← Menu Bar
     └─────────────────────────────┘

User moves through world, taps objects
Modals open on top when needed
```

---

## PHASE 1: World Foundation (Estimated: 3-4 days)

**Goal:** Render a static farm world with basic structure

### Tasks

#### 1.1 Create worldStore.ts
**File:** `src/world/store/worldStore.ts`

```typescript
import create from 'zustand';

interface WorldState {
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  worldWidth: number;
  worldHeight: number;
  selectedObjectId: string | null;
}

interface WorldStore extends WorldState {
  setPlayerPosition: (x: number, y: number) => void;
  setCameraPosition: (x: number, y: number) => void;
  setSelectedObject: (id: string | null) => void;
}

export const useWorldStore = create<WorldStore>((set) => ({
  playerPosition: { x: 5, y: 5 },
  cameraPosition: { x: 0, y: 0 },
  worldWidth: 15,
  worldHeight: 10,
  selectedObjectId: null,
  
  setPlayerPosition: (x, y) => set({ playerPosition: { x, y } }),
  setCameraPosition: (x, y) => set({ cameraPosition: { x, y } }),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
}));
```

**Verification:**
```bash
npx tsc --noEmit  # Should compile
```

#### 1.2 Create worldService.ts
**File:** `src/world/systems/worldService.ts`

```typescript
export interface Tile {
  type: 'grass' | 'dirt' | 'water' | 'path';
  x: number;
  y: number;
}

export interface WorldObject {
  id: string;
  type: 'crop' | 'animal' | 'building' | 'player';
  x: number;
  y: number;
  width: number;
  height: number;
  collidable: boolean;
  data?: Record<string, any>;
}

export class WorldService {
  private tileMap: Tile[][] = [];
  private worldWidth = 15;
  private worldHeight = 10;
  private tileSize = 50; // pixels

  generateWorld(): Tile[][] {
    // Generate a simple grass world
    const tiles: Tile[][] = [];
    for (let y = 0; y < this.worldHeight; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.worldWidth; x++) {
        row.push({
          type: 'grass',
          x,
          y,
        });
      }
      tiles.push(row);
    }
    this.tileMap = tiles;
    return tiles;
  }

  getTile(x: number, y: number): Tile | null {
    if (y < 0 || y >= this.tileMap.length) return null;
    if (x < 0 || x >= this.tileMap[0].length) return null;
    return this.tileMap[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    return tile.type !== 'water';
  }
}

export const worldService = new WorldService();
```

**Verification:**
```bash
npx tsc --noEmit
```

#### 1.3 Create MapRenderer.tsx
**File:** `src/world/components/MapRenderer.tsx`

```typescript
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useWorldStore } from '../store/worldStore';
import { worldService } from '../systems/worldService';

const TILE_SIZE = 50;
const { width, height } = Dimensions.get('window');

interface TileProps {
  type: 'grass' | 'dirt' | 'water' | 'path';
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

const TileComponent: React.FC<TileProps> = ({ type, x, y, offsetX, offsetY }) => {
  const colors: Record<string, string> = {
    grass: '#7cb342',
    dirt: '#8b7355',
    water: '#2196f3',
    path: '#d7ccc8',
  };

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors[type],
          left: x * TILE_SIZE - offsetX,
          top: y * TILE_SIZE - offsetY,
        },
      ]}
    />
  );
};

export const MapRenderer: React.FC = () => {
  const cameraPosition = useWorldStore((state) => state.cameraPosition);
  const worldWidth = useWorldStore((state) => state.worldWidth);
  const worldHeight = useWorldStore((state) => state.worldHeight);

  const tiles = useMemo(() => worldService.generateWorld(), []);

  const visibleTiles = tiles.flat().filter((tile) => {
    const screenX = tile.x * TILE_SIZE - cameraPosition.x;
    const screenY = tile.y * TILE_SIZE - cameraPosition.y;
    return screenX + TILE_SIZE > 0 && screenX < width && screenY + TILE_SIZE > 0 && screenY < height;
  });

  return (
    <View style={styles.mapContainer}>
      {visibleTiles.map((tile) => (
        <TileComponent
          key={`${tile.x}-${tile.y}`}
          type={tile.type}
          x={tile.x}
          y={tile.y}
          offsetX={cameraPosition.x}
          offsetY={cameraPosition.y}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#7cb342',
    overflow: 'hidden',
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderWidth: 1,
    borderColor: '#6ba436',
  },
});
```

**Verification:**
```bash
npx tsc --noEmit
npm test -- --runInBand
```

#### 1.4 Create GameWorldScreen.tsx (Skeleton)
**File:** `src/world/components/GameWorldScreen.tsx`

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { useFarmStore } from '../../store/farmStore';
import { useGameUpdate } from '../../hooks/useGameUpdate';
import { offlineProgressService } from '../../services/offlineProgressService';
import { MapRenderer } from './MapRenderer';

export const GameWorldScreen: React.FC = () => {
  const player = usePlayerStore((state) => state.player);
  const farm = useFarmStore((state) => state.farm);

  // Start game loop (crop growth, animal production, etc.)
  useGameUpdate();

  useEffect(() => {
    // Sync offline progress on app open
    offlineProgressService.syncOfflineProgress();
  }, []);

  if (!player || !farm) {
    return (
      <View style={styles.container}>
        <Text>Loading farm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main game world */}
      <MapRenderer />

      {/* TODO: Add HUD, Player, Objects, Joystick */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

#### 1.5 Update App.tsx to Use GameWorldScreen
**File:** `App.tsx` (modify)

In the `renderScreen()` function, add:

```typescript
case 'worldmap':
  return <GameWorldScreen />;
```

And in the auth state change handler (around line 43):

```typescript
const unsubscribe = auth.onAuthStateChanged((user) => {
  if (user) {
    setIsSignedIn(true);
    setCurrentScreen('worldmap');  // Changed from 'home'
  } else {
    setIsSignedIn(false);
    setCurrentScreen('login');
  }
  setLoading(false);
});
```

#### 1.6 Update uiStore.ts to Include 'worldmap' Screen
**File:** `src/store/uiStore.ts` (modify)

```typescript
export type Screen =
  | 'splash'
  | 'login'
  | 'signup'
  | 'worldmap'  // NEW
  | 'home'
  | 'farm'
  | ... (rest unchanged)
```

### Phase 1 Verification Checklist

```bash
# TypeScript compilation
npx tsc --noEmit

# Run tests
npm test -- --runInBand

# Build and install
npm run android

# Manual test on Pixel_8:
# - Login
# - Should see a green tiled map
# - No errors in console
```

---

## PHASE 2: Player & Movement (Estimated: 4-5 days)

**Goal:** Add player character and basic movement controls

### Tasks

#### 2.1 Create Player Component
**File:** `src/world/components/Player.tsx`

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useWorldStore } from '../store/worldStore';

const TILE_SIZE = 50;
const PLAYER_SIZE = 30;

export const Player: React.FC = () => {
  const playerPosition = useWorldStore((state) => state.playerPosition);
  const cameraPosition = useWorldStore((state) => state.cameraPosition);

  const screenX = playerPosition.x * TILE_SIZE + TILE_SIZE / 2 - PLAYER_SIZE / 2 - cameraPosition.x;
  const screenY = playerPosition.y * TILE_SIZE + TILE_SIZE / 2 - PLAYER_SIZE / 2 - cameraPosition.y;

  return (
    <View
      style={[
        styles.player,
        {
          left: screenX,
          top: screenY,
        },
      ]}
    >
      {/* Placeholder: Green circle representing farmer */}
    </View>
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6f00',
    borderWidth: 2,
    borderColor: '#e65100',
  },
});
```

#### 2.2 Create VirtualJoystick Component
**File:** `src/world/components/VirtualJoystick.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useWorldStore } from '../store/worldStore';
import { worldService } from '../systems/worldService';

const JOYSTICK_SIZE = 100;
const OUTER_RADIUS = JOYSTICK_SIZE / 2;
const INNER_RADIUS = 15;

export const VirtualJoystick: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const setPlayerPosition = useWorldStore((state) => state.setPlayerPosition);
  const playerPosition = useWorldStore((state) => state.playerPosition);
  const setCameraPosition = useWorldStore((state) => state.setCameraPosition);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const x = Math.max(
        -OUTER_RADIUS,
        Math.min(OUTER_RADIUS, gestureState.dx)
      );
      const y = Math.max(
        -OUTER_RADIUS,
        Math.min(OUTER_RADIUS, gestureState.dy)
      );
      setPosition({ x, y });

      // Convert joystick input to world movement
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude > 10) {
        const dirX = x / magnitude;
        const dirY = y / magnitude;
        
        // Calculate new position
        const speed = 0.2;
        const newX = playerPosition.x + dirX * speed;
        const newY = playerPosition.y + dirY * speed;

        // Check if walkable
        if (
          worldService.isWalkable(Math.floor(newX), Math.floor(newY))
        ) {
          setPlayerPosition(newX, newY);
          
          // Update camera to follow player
          const tileSize = 50;
          const { width, height } = Dimensions.get('window');
          const cameraX = newX * tileSize - width / 2;
          const cameraY = newY * tileSize - height / 2;
          setCameraPosition(cameraX, cameraY);
        }
      }
    },
    onPanResponderRelease: () => {
      setPosition({ x: 0, y: 0 });
    },
  });

  return (
    <View style={styles.joystickContainer} {...panResponder.panHandlers}>
      {/* Outer ring */}
      <View style={styles.joystickOuter}>
        {/* Inner knob */}
        <View
          style={[
            styles.joystickInner,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
  },
  joystickOuter: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: OUTER_RADIUS,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickInner: {
    width: INNER_RADIUS * 2,
    height: INNER_RADIUS * 2,
    borderRadius: INNER_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
```

#### 2.3 Create GameHUD Component
**File:** `src/world/components/GameHUD.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';

export const GameHUD: React.FC = () => {
  const player = usePlayerStore((state) => state.player);

  if (!player) return null;

  const xpPercent = (player.xp / player.xpToNextLevel) * 100;

  return (
    <View style={styles.hudContainer}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>Level {player.level} Farmer</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
        </View>
      </View>

      <View style={styles.resourcesRow}>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>💰</Text>
          <Text style={styles.resourceValue}>{player.coins}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>💎</Text>
          <Text style={styles.resourceValue}>{player.gems}</Text>
        </View>
        <View style={styles.resourceItem}>
          <Text style={styles.resourceLabel}>⚡</Text>
          <Text style={styles.resourceValue}>
            {player.energy}/{player.maxEnergy}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 100,
  },
  playerInfo: {
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  resourcesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resourceLabel: {
    marginRight: 4,
    fontSize: 16,
  },
  resourceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
```

#### 2.4 Update GameWorldScreen to Include New Components
**File:** `src/world/components/GameWorldScreen.tsx` (modify)

```typescript
import { VirtualJoystick } from './VirtualJoystick';
import { Player } from './Player';
import { GameHUD } from './GameHUD';

export const GameWorldScreen: React.FC = () => {
  // ... existing code ...

  return (
    <View style={styles.container}>
      {/* Main game world */}
      <MapRenderer />

      {/* Game HUD */}
      <GameHUD />

      {/* Player character */}
      <Player />

      {/* Joystick input */}
      <VirtualJoystick />

      {/* TODO: Add interactive objects, modals, etc. */}
    </View>
  );
};
```

### Phase 2 Verification Checklist

```bash
npx tsc --noEmit
npm test -- --runInBand
npm run android

# Manual test on Pixel_8:
# - Player should see orange circle (player) in center
# - HUD shows Level, XP, Coins, Gems, Energy
# - Joystick appears bottom-left
# - Dragging joystick moves player
# - Camera follows player
# - Boundaries prevent leaving farm
```

---

## PHASE 3: Interactive Objects (Estimated: 5-6 days)

**Goal:** Make crop plots and animals tappable

### Key Files to Create
- `src/world/components/InteractivePlot.tsx`
- `src/world/components/InteractiveAnimal.tsx`
- `src/world/components/InteractionPanel.tsx`
- `src/world/systems/interactionService.ts`

### High-level Steps
1. Create types for world objects
2. Spawn crop plots from farmStore into world
3. Spawn animals from farmStore into world
4. Handle tap detection on objects
5. Show interaction menu
6. Execute plant/harvest/feed actions
7. Update stores on success

---

## PHASE 4-8: Remaining Phases

Following the same detailed breakdown...

---

## Build & Test Commands

```bash
# TypeScript check
npx tsc --noEmit

# Tests
npm test -- --runInBand

# Build APK
npm run android

# Install on device
adb install -r ./android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep -i farmgame
```

---

## Git Commit Strategy

After each major task:

```bash
git add .
git commit -m "Phase 1.1: Create worldStore and basic structure

- Create worldStore.ts with player/camera state
- Create worldService.ts for world logic
- Create MapRenderer with tile rendering
- Create GameWorldScreen skeleton

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Debugging Tips

### The player doesn't move
- Check joystick position state
- Verify playerPosition in worldStore updates
- Check cameraPosition follows

### The world doesn't render
- Verify tileMap generation in worldService
- Check MapRenderer receives correct camera position
- Check styles.tile positioning math

### Objects appear in wrong positions
- Verify TILE_SIZE is consistent (50px)
- Check offsetX/offsetY calculation
- Remember: screen position = world * tileSize - camera

---

## Summary

This roadmap breaks the redesign into 8 digestible phases. After Phase 1 completion, you'll have a working foundation. Each subsequent phase adds more game features until the full farm world is operational.

**Estimated Total Time:** 6-8 weeks of focused development

**Key Success Metrics:**
- Phase 1: Renders without errors ✓
- Phase 2: Player moves and camera follows ✓
- Phase 3: Can tap and interact with objects ✓
- Phase 4-8: Full farm world with all systems ✓

Proceed to Phase 1 when ready. ✅
