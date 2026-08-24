# FarmGame UI Redesign Audit
## Converting Dashboard → Interactive Farm World

**Date:** August 24, 2026  
**Status:** Audit Complete — Ready for Implementation  
**Project:** FarmGame (React Native + Expo + Firebase)

---

## EXECUTIVE SUMMARY

### Current State
- ✅ **Solid game logic foundation** with Zustand stores, Firebase integration, and game mechanics
- ❌ **Dashboard/business UI** with emoji cards and grid navigation (HomeScreen with 8 action buttons)
- ⚠️ **No world simulation** — screens are separate views, not connected to a game world

### Target State
- 🎮 **Immersive farm world** with player movement, interactive objects, and visual game environment
- 📍 **Single persistent farm screen** that remains the primary interface after login
- 🏡 **2D top-down farm with crops, animals, buildings, and a player character**
- 🎨 **Game-style graphics** (tileset-based, isometric or top-down, friendly/colorful)

### Feasibility: ✅ **HIGHLY ACHIEVABLE**
- Existing game logic is solid and modular
- Stores are well-structured and can remain unchanged
- React Native Reanimated 3 is available for smooth animations
- Can reuse all backend Firebase services
- No need to replace the entire architecture

---

## CURRENT ARCHITECTURE ANALYSIS

### 1. Navigation & Screen Management

**Current Pattern:**
```
App.tsx (root)
  → renderScreen() switch statement
    → HomeScreen (dashboard with 8 buttons)
    → FarmScreen (grid of plots)
    → AnimalScreen (list view)
    → InventoryScreen (card list)
    → MarketScreen (list view)
    → ContractsScreen (list view)
    → ShopScreen (card grid)
    → UpgradesScreen (list view)
    → BuildingsScreen (list view)
```

**uiStore.ts:**
- `currentScreen: Screen` enum (home, farm, animals, buildings, etc.)
- `setCurrentScreen()` — navigates between full-screen views
- Notifications system already in place

**Assessment:**
- ✅ Navigation system is flexible and can adapt
- ⚠️ Need to introduce a new "worldMap" or "gameWorld" screen that becomes the primary interface
- ⚠️ Inventory/Shop/Contracts should become overlays on top of the farm world, not separate screens

**Recommended Change:**
- Keep existing screen navigation for backward compatibility
- Add new `worldMap` screen that becomes the default post-login
- Convert overlays (Shop, Inventory, Market, Contracts) to modal dialogs instead of full screens
- Farm world remains active in background while overlays are open

---

### 2. Existing Stores (Zustand)

**playerStore.ts** ✅
```typescript
- player: Player | null
- setPlayer(player: Player)
- updateCoins(amount)
- updateGems(amount)
- updateEnergy(amount)
- updateXP(amount)
- levelUp()
```
**Status:** Ready to use — no changes needed

**farmStore.ts** ✅
```typescript
- farm: Farm | null
- setFarm(farm: Farm)
- addPlantedCrop(crop: PlantedCrop)
- harvestCrop(id: string)
- addAnimal(animal: AnimalInstance)
- updateAnimal(id: string, updates)
- updateStorage(itemName, quantity)
```
**Status:** Ready to use — no changes needed

**uiStore.ts** ⚠️
```typescript
- currentScreen: Screen
- addNotification()
- removeNotification()
```
**Status:** Needs expansion:
- Add `world-state` for player position
- Add `overlay-state` for modals (shop, inventory, etc.)
- Keep backward compatibility

**marketStore.ts, remoteConfigStore.ts** ✅
**Status:** Ready to use — no changes needed

---

### 3. Game Data Types

**game.ts** ✅ All essential types already defined:
```typescript
✅ Player (uid, level, xp, coins, gems, energy, inventory)
✅ PlantedCrop (id, cropId, plantedAt, harvestAt, plotIndex)
✅ AnimalInstance (id, animalId, slotIndex, health, lastProduction)
✅ Building (id, name, type, level)
✅ Farm (uid, plots, animals, buildings, storage)
```

**Missing for World Simulation:**
- `WorldObject` — base type for anything clickable on the map
- `PlayerPosition` — x, y coordinates for character movement
- `CameraState` — viewport and tracking info

---

### 4. Game Services

**gameLoopService.ts** ✅
- Handles crop growth, animal production, energy regeneration
- Uses Zustand stores directly with `getState()`
- Runs on 5-second intervals
- **No changes needed** — will work with world rendering

**firebaseService.ts** ✅
- Authentication, Firestore, Functions, Remote Config all initialized
- **No changes needed**

**offlineProgressService.ts** ✅
- Calculates offline progression
- Syncs on app open
- **No changes needed**

**economyService.ts, cloudFunctionsService.ts** ✅
- Premium services for game logic
- **No changes needed**

---

### 5. Existing Components

**HomeScreen.tsx** ⚠️ **WILL BE REPLACED**
- Currently shows dashboard with resource cards + 8 action buttons
- Will be replaced by `GameWorldScreen.tsx`
- Logic (sync offline progress) can be moved to world screen

**FarmScreen.tsx** ⚠️ **WILL BE REFACTORED**
- Currently shows grid of plot cards with plant/harvest buttons
- Logic can be reused (crop planting, harvesting)
- Will become interactive plot objects on world map

**AnimalScreen.tsx, InventoryScreen.tsx, ShopScreen.tsx, etc.** ⚠️ **WILL BECOME MODALS**
- Convert from full-screen navigations to overlay modals
- Keep the same content/logic
- Add close button and overlay backdrop

---

### 6. Assets

**Current State:**
```
assets/
  ├── .gitkeep
  ├── adaptive-icon.png (70 bytes, placeholder)
  ├── favicon.png (70 bytes, placeholder)
  ├── icon.png (70 bytes, placeholder)
  └── splash.png (70 bytes, placeholder)
```

**Status:** ❌ **NO GAME GRAPHICS EXIST**
- Only placeholder icons
- No tileset, no sprites, no backgrounds
- No farmer character, no crops, no animals, no buildings

**Asset Strategy Required:**
1. **Immediate (Development):** Use SVG/ASCII placeholders
2. **Mid-term:** Integrate free/open tileset (e.g., LPC tileset, Kenney assets)
3. **Final:** Commission/create custom pixel art

---

### 7. TypeScript Strict Mode

**tsconfig.json:**
```json
"strict": true
"esModuleInterop": true
"skipLibCheck": true
```

✅ **Compilation passes** — No errors currently

**Constraints:**
- Must maintain strict mode
- All new code requires explicit types
- No `any` types
- No `@ts-ignore` comments

---

### 8. Dependencies

**Key for World Building:**
```json
✅ react-native-reanimated: ^3.8.0 (smooth animations/movement)
✅ react-native-gesture-handler: ^2.14.0 (touch input/joystick)
✅ zustand: ^4.5.0 (state management)
✅ expo: ^50.0.0 (framework)
✅ react-native: 0.74.0 (framework)
```

**NOT included (would need to add if needed):**
- Canvas rendering library (optional, React Native supports basic drawing)
- Physics engine (not needed for initial MVP)
- Extra sprite library (can use React Native View/Image)

---

## WHAT CAN BE REUSED ✅

1. **playerStore** — Player level, resources, inventory
2. **farmStore** — Farm plots, animals, buildings, storage
3. **marketStore** — Marketplace listings and contracts
4. **uiStore** — Notification system, partial screen management
5. **gameLoopService** — Crop growth, animal production, energy
6. **firebaseService** — All auth, database, functions
7. **All game constants** (CROPS, ANIMALS, GAME_CONFIG)
8. **Existing types** (Player, Farm, PlantedCrop, AnimalInstance, etc.)
9. **Tests** (economy.test.ts, farming.test.ts, animals.test.ts)
10. **Firebase schema and business logic**

---

## WHAT NEEDS TO BE CREATED 🆕

### 1. World/Map System
- **WorldMap.tsx** — Main game world component with rendering
- **MapRenderer.tsx** — Handles tileset rendering and viewport
- **worldStore.ts** — Player position, camera state, interactive objects
- **worldService.ts** — World logic (pathfinding, collision, object queries)

### 2. Player Character
- **Player component** — Visual representation with sprite/animation
- **PlayerController.ts** — Movement logic, input handling
- **PlayerAnimator.ts** — Idle, walking, action animations

### 3. Interactive Objects
- **InteractivePlot.tsx** — Clickable crop plot with state
- **InteractiveAnimal.tsx** — Clickable animal with menu
- **InteractiveBuilding.tsx** — Shop, barn, house interactions
- **interactionService.ts** — Handle tap/interaction logic

### 4. UI/HUD System
- **GameHUD.tsx** — Compact top HUD (coins, gems, energy, level)
- **BottomMenu.tsx** — Bottom action bar for quick access
- **InteractionPanel.tsx** — Context menu for tapping objects

### 5. Modal/Overlay System
- **InventoryModal.tsx** — Converted from InventoryScreen
- **ShopModal.tsx** — Converted from ShopScreen
- **MarketModal.tsx** — Converted from MarketScreen
- **ContractsModal.tsx** — Converted from ContractsScreen
- **ModalManager.tsx** — Central modal state and rendering

### 6. Graphics/Assets
- **Tileset** — Grass, dirt, water, paths (16x16 or 32x32 tiles)
- **Sprites** — Farmer character, animals, crops, buildings
- **UI graphics** — Buttons, panels, icons

### 7. New Store (worldStore.ts)
```typescript
interface WorldStore {
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  isMoving: boolean;
  selectedObject: WorldObject | null;
  
  setPlayerPosition(x, y)
  updateCamera(x, y)
  setSelectedObject(object)
  clearSelectedObject()
}
```

### 8. Input Handling
- **VirtualJoystick.tsx** — On-screen joystick for mobile
- Or **TapToMove.tsx** — Tap-to-move system
- **TouchGestures.tsx** — Tap detection for object interaction

---

## RECOMMENDED FARM WORLD ARCHITECTURE

### Directory Structure (NEW)
```
src/
├── world/                          # NEW: All world-related code
│   ├── components/
│   │   ├── GameWorldScreen.tsx     # Main world screen
│   │   ├── MapRenderer.tsx         # Tileset rendering
│   │   ├── Player.tsx              # Player character
│   │   ├── WorldObject.tsx         # Base interactive object
│   │   ├── InteractivePlot.tsx     # Crop plot
│   │   ├── InteractiveAnimal.tsx   # Animal object
│   │   ├── InteractiveBuilding.tsx # Building object
│   │   ├── GameHUD.tsx             # Top resource bar
│   │   ├── BottomMenu.tsx          # Bottom navigation
│   │   ├── InteractionPanel.tsx    # Context menu
│   │   └── VirtualJoystick.tsx     # Touch input
│   │
│   ├── systems/
│   │   ├── worldService.ts         # World logic
│   │   ├── collisionService.ts     # Collision detection
│   │   ├── cameraService.ts        # Camera/viewport
│   │   └── interactionService.ts   # Object interactions
│   │
│   └── store/
│       └── worldStore.ts           # Player position, camera, selection
│
├── modals/                         # NEW: Modal overlays
│   ├── InventoryModal.tsx
│   ├── ShopModal.tsx
│   ├── MarketModal.tsx
│   ├── ContractsModal.tsx
│   └── ModalManager.tsx
│
├── assets/                         # EXISTING
│   ├── graphics/
│   │   ├── tileset.png
│   │   ├── sprites.png
│   │   └── ui.png
│   └── ...
│
└── ... (existing structure unchanged)
```

### Data Flow

```
Player Input (touch/joystick)
  ↓
VirtualJoystick/TapToMove component
  ↓
PlayerController (worldService)
  ↓
Update worldStore.playerPosition
  ↓
MapRenderer re-renders with new viewport
  ↓
WorldObjects re-render at their positions
  ↓
Collision detection runs
  ↓
Camera follows player

---

Tap on Crop Plot
  ↓
InteractivePlot.onPress()
  ↓
interactionService.handleCropInteraction()
  ↓
Show InteractionPanel or trigger action
  ↓
Update farmStore (plant/harvest)
  ↓
Update playerStore (coins/XP)
  ↓
UI reflects changes
```

---

## GRAPHICS/ASSET STRATEGY

### Phase 1: Development (ASCII/SVG Placeholders)
Use simple SVG rectangles with labels:
- Green square = crop plot
- Brown square = animal pen
- Orange square = building
- Blue circle = player

No external assets needed.

### Phase 2: Placeholder Graphics
Integrate free tileset:
- **Kenney Asset Packs** (kenney.nl) — Free, licensed for games
- **LPC Tileset** (Open Game Art) — Fantasy/farm themed
- **Or:** Simple pixel art generated with Aseprite/Piskel

Store in `src/assets/graphics/`

### Phase 3: Polish (Future)
Commission custom art or create with tools like:
- Aseprite (pixel art)
- Tiled (tilemap editor)

---

## IMPLEMENTATION PHASES

### Phase 0: Preparation ✅ (AUDIT)
- [x] Audit existing code
- [x] Identify reusable components
- [x] Plan architecture
- [x] Document constraints

### Phase 1️⃣: World Foundation (Week 1)
- [ ] Create worldStore.ts
- [ ] Create GameWorldScreen.tsx
- [ ] Create MapRenderer with basic tileset
- [ ] Create placeholder graphics (SVG)
- [ ] Render static farm background
- **Verification:** World renders without errors

### Phase 2️⃣: Player & Movement (Week 2)
- [ ] Create Player component
- [ ] Create VirtualJoystick or TapToMove
- [ ] Implement player movement logic
- [ ] Add collision detection
- [ ] Implement camera following player
- **Verification:** Player moves around farm, camera follows

### Phase 3️⃣: Interactive Objects (Week 3)
- [ ] Create InteractivePlot component
- [ ] Implement crop tap handling (plant/harvest)
- [ ] Create InteractiveAnimal component
- [ ] Implement animal interaction menu
- [ ] Create InteractiveBuilding component
- **Verification:** Can tap objects and trigger interactions

### Phase 4️⃣: UI & HUD (Week 4)
- [ ] Create GameHUD (top bar)
- [ ] Create BottomMenu
- [ ] Create InteractionPanel
- [ ] Connect to playerStore (resources update HUD)
- **Verification:** HUD updates in real-time as resources change

### Phase 5️⃣: Modal System (Week 5)
- [ ] Convert InventoryScreen → InventoryModal
- [ ] Convert ShopScreen → ShopModal
- [ ] Convert MarketScreen → MarketModal
- [ ] Convert ContractsScreen → ContractsModal
- [ ] Create ModalManager for central state
- [ ] Hook bottom menu buttons to open modals
- **Verification:** Modals open/close cleanly over farm world

### Phase 6️⃣: Game Loop Integration (Week 6)
- [ ] Verify gameLoopService works with world rendering
- [ ] Sync crop growth with interactive plots
- [ ] Sync animal production with interactive animals
- [ ] Test offline progression
- **Verification:** All game mechanics work in world

### Phase 7️⃣: Polish & Graphics (Week 7)
- [ ] Replace placeholder graphics with tileset
- [ ] Add animations (walking, idle, harvest, etc.)
- [ ] Add visual feedback (particles, highlights)
- [ ] Optimize rendering performance
- **Verification:** Game looks polished, runs smoothly at 60fps

### Phase 8️⃣: Testing & Deployment (Week 8)
- [ ] Run full test suite
- [ ] Test on Pixel_8 Android emulator
- [ ] Test on iOS simulator
- [ ] Verify Firebase persistence
- [ ] Build and install APK
- **Verification:** All 14 acceptance criteria pass

---

## TECHNICAL DETAILS

### Player Movement Implementation

**Option A: Virtual Joystick (RECOMMENDED)**
```typescript
// src/world/components/VirtualJoystick.tsx
- Left joystick on bottom-left
- Analog input for direction/speed
- Smooth acceleration/deceleration
- Touch-based input

// Connects to:
PlayerController.handleInput(direction, magnitude)
  → worldStore.setPlayerPosition(newX, newY)
  → MapRenderer re-renders viewport
  → Camera follows
```

**Option B: Tap-to-Move**
```typescript
// src/world/components/TapToMove.tsx
- Tap anywhere on map to move there
- Shows movement path (optional)
- Pathfinding to avoid obstacles
```

**Recommendation:** Start with joystick (more game-like), add tap-to-move as option.

### Collision Detection

```typescript
// src/world/systems/collisionService.ts

interface WorldObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collidable: boolean;
  type: 'crop' | 'animal' | 'building' | 'player';
}

function checkCollision(playerPos, objectPos): boolean {
  // AABB (axis-aligned bounding box) collision
  return (
    playerPos.x < objectPos.x + objectPos.width &&
    playerPos.x + playerWidth > objectPos.x &&
    playerPos.y < objectPos.y + objectPos.height &&
    playerPos.y + playerHeight > objectPos.y
  );
}
```

### Camera/Viewport

```typescript
// src/world/systems/cameraService.ts

interface CameraState {
  x: number;              // Top-left corner of viewport
  y: number;
  width: number;          // Viewport dimensions
  height: number;
  followTarget?: {x, y};  // Follow player position
  zoomLevel: number;      // For pinch-zoom (future)
}

function updateCamera(player, farm) {
  // Center camera on player
  // Keep player centered in viewport
  // Don't let camera scroll outside farm bounds
}
```

### Rendering with React Native

React Native doesn't have Canvas by default, but can use:

**Option 1: View/Image-based (SIMPLEST)**
```typescript
// MapRenderer creates a grid of Image components
<View style={styles.mapContainer}>
  {tileGrid.map((row, y) =>
    row.map((tileId, x) => (
      <Image
        key={`${x}-${y}`}
        source={tileMap[tileId]}
        style={{
          position: 'absolute',
          left: x * TILE_SIZE - camera.x,
          top: y * TILE_SIZE - camera.y,
          width: TILE_SIZE,
          height: TILE_SIZE,
        }}
      />
    ))
  )}
  
  {/* World objects on top */}
  <InteractivePlot x={...} y={...} />
  <InteractiveAnimal x={...} y={...} />
  <Player x={...} y={...} />
</View>
```

**Option 2: SkiaView (if performance needed)**
- Use `react-native-skia` for GPU-accelerated rendering
- More complex but very fast
- Only if View-based approach has performance issues

**Recommendation:** Start with View/Image-based, optimize if needed.

---

## TESTING STRATEGY

### TypeScript Validation
```bash
npx tsc --noEmit
```
Must pass before any code commit.

### Unit Tests
```bash
npm test -- --runInBand
```
Update existing tests:
- economy.test.ts (no changes needed)
- farming.test.ts (no changes needed)
- animals.test.ts (no changes needed)

Add new tests:
- world.test.ts (worldStore, collision, camera)
- movement.test.ts (player movement logic)

### Integration Tests
- Player enters farm
- Player moves to crop
- Player taps crop
- Crop plant/harvest flow works
- Resources update
- Offline progression works

### Device Testing
```bash
npm run android
# Install on Pixel_8 emulator
# Test:
# - Login
# - Enter farm world
# - Move player
# - Tap objects
# - Open modals
# - Check HUD updates
```

---

## DEBUGGING & DEVELOPMENT

### Enable Debug Mode
In `.env`:
```
DEBUG_MODE=true
```

### Visual Debugger
Add overlay showing:
- Player position (x, y)
- Camera viewport
- Collision boxes
- World bounds

```typescript
// src/world/components/DebugOverlay.tsx
{DEBUG_MODE && (
  <Text>Player: ({playerX}, {playerY})</Text>
  <Text>Camera: ({cameraX}, {cameraY})</Text>
)}
```

### Performance Monitoring
- Use React DevTools Profiler
- Monitor frame rate with `fps-alert` or Reanimated metrics
- Log game loop tick timing

---

## IMPORTANT CONSTRAINTS & GOTCHAS

### ⚠️ DO NOT

1. ❌ Upgrade Expo beyond current version
2. ❌ Replace Zustand with Redux
3. ❌ Remove Firebase
4. ❌ Break existing tests
5. ❌ Use `any` types or `@ts-ignore`
6. ❌ Modify production Firebase data
7. ❌ Remove existing screens before modals are ready
8. ❌ Hardcode asset paths (use constants)

### ✅ DO

1. ✅ Keep TypeScript strict mode
2. ✅ Maintain backward compatibility in stores
3. ✅ Write tests for new world code
4. ✅ Use SVG/placeholders until final art is ready
5. ✅ Commit frequently with clear messages
6. ✅ Verify builds on Pixel_8 after each phase
7. ✅ Keep world code modular and testable
8. ✅ Document any new patterns

---

## ACCEPTANCE CRITERIA CHECKLIST

After Phase 8, verify:

- [ ] 1. Login works (existing functionality preserved)
- [ ] 2. Player enters farm directly (no dashboard)
- [ ] 3. Farm is visually represented as a game world
- [ ] 4. Player can move around the farm
- [ ] 5. Camera follows player
- [ ] 6. Player can interact with crop plots
- [ ] 7. Player can plant crops
- [ ] 8. Player can harvest crops
- [ ] 9. Player can interact with animals
- [ ] 10. Inventory opens from farm (modal)
- [ ] 11. Shop opens from farm (modal)
- [ ] 12. Contracts/marketplace accessible from farm (modal)
- [ ] 13. Resources visible in compact HUD
- [ ] 14. Firebase authentication remains functional
- [ ] 15. Game state/persistence remains functional
- [ ] 16. No dashboard/card grid as primary screen
- [ ] 17. Experience feels like a FARMING GAME

---

## NEXT STEPS

### For Approval
1. Review this audit document
2. Confirm Phase 1 architecture is acceptable
3. Approve graphics/asset strategy (placeholders → tileset)
4. Confirm 8-week timeline is reasonable

### After Approval
1. Create task tracking in SQL todos table
2. Begin Phase 1 (world foundation)
3. Weekly check-ins and progress reports
4. Adjust timeline as needed

---

## RESOURCES

### Learning
- React Native Docs: https://reactnative.dev/
- Reanimated Docs: https://docs.swmansion.com/react-native-reanimated/
- Game Development Patterns: https://gameprogrammingpatterns.com/

### Assets
- Kenney.nl: https://kenney.nl/assets
- OpenGameArt.org: https://opengameart.org/
- itch.io: https://itch.io/game-assets/free

### Tools
- Aseprite: Pixel art editor
- Tiled: Tilemap editor
- Piskel: Free online pixel art

---

**END OF AUDIT**

This document provides a complete roadmap for converting FarmGame from a dashboard UI to an interactive farm world. The existing game logic is solid and reusable. The main work is building the world rendering, movement system, and converting screens to modals.

Proceed to implementation when approved. ✅
