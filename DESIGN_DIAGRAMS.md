# FarmGame UI Redesign — Visual Diagrams

## Current vs. Target Architecture

### CURRENT (Dashboard Model)
```
┌─────────────────────────────────────────────┐
│                    APP.TSX                  │
│               (Root Navigation)             │
└────────────────────┬────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ↓               ↓               ↓
 LoginScreen    HomeScreen       FarmScreen
                (Dashboard)      (Grid)
                    │
     ┌──────────────┼──────────────┐
     ↓              ↓              ↓
AnimalScreen  MarketScreen    ShopScreen
(Each is a full-screen view)

❌ Problems:
- Disconnected experiences
- No world or sense of place
- Feels like business software
- Navigation takes you away from game
```

### TARGET (World Model)
```
┌─────────────────────────────────────────────┐
│                    APP.TSX                  │
│               (Root Navigation)             │
└────────────────────┬────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ↓               ↓               ↓
LoginScreen   GameWorldScreen  (Legacy: HomeScreen)
              (PRIMARY)
                     │
         ┌───────────┼───────────┬────────────┐
         ↓           ↓           ↓            ↓
   MapRenderer  Player + Joystick  HUD   BottomMenu
                                        ├─→ Inventory Modal
                                        ├─→ Shop Modal
                                        ├─→ Market Modal
                                        └─→ Contracts Modal

✅ Benefits:
- Single coherent world
- Feels like a game
- Modals overlay the world (immersive)
- Persistent farm experience
```

---

## Screen Layout (Mockup)

### Game World Screen
```
┌──────────────────────────────────────────────────────┐
│  L5 Farmer | XP ████░░░ | 💰 540 | 💎 25 | ⚡ 95/100 │  ← HUD (Compact)
├──────────────────────────────────────────────────────┤
│                                                      │
│              🌿🌿🏡🌿🌿                             │
│              🌿👨🌿🐄🌿                             │
│              🌿🌾🌿🌿🌿                             │  ← Game World (Interactive)
│              🛍️ 🌿🌿🌿🏢                           │
│              🌿🌿🌿🌿🌿                             │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [FARM] [ANIMALS] [INVENTORY] [SHOP] [MARKET] [+]   │  ← Bottom Menu
└──────────────────────────────────────────────────────┘

⊕ Virtual Joystick (bottom-left, not shown in mockup)
```

### With Modal Overlay (Shop)
```
┌──────────────────────────────────────────────────────┐
│  L5 Farmer | XP ████░░░ | 💰 540 | 💎 25 | ⚡ 95/100 │
├──────────────────────────────────────────────────────┤
│                                                      │
│    🌿🌿🏡🌿🌿  ┌──────────────────────┐             │
│    🌿👨🌿🐄🌿  │     🛍️ SHOP           │             │
│    🌿🌾🌿🌿🌿  ├──────────────────────┤             │
│    🛍️ 🌿🌿🌿🏢 │ 🌾 Wheat Seed        │             │
│    🌿🌿🌿🌿🌿  │   💰 10 coins [BUY] │             │
│                 │                     │             │
│    (World dims) │ 🌽 Corn Seed        │             │
│    (Modal on)   │   💰 15 coins [BUY] │             │
│                 │                     │             │
│                 │ 🐄 Cow              │             │
│                 │   💰 100 coins [BUY]│             │
│                 │                     │             │
│                 │ ✕ Close             │             │
│                 └──────────────────────┘             │
├──────────────────────────────────────────────────────┤
│  [FARM] [ANIMALS] [INVENTORY] [SHOP] [MARKET] [+]   │
└──────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### GameWorldScreen Structure
```
GameWorldScreen (main component)
├── MapRenderer (background tiles)
│   └── TileComponent × many (individual tiles)
│
├── InteractiveObjects Layer
│   ├── InteractivePlot × N (crop plots)
│   │   └── Shows: empty | growing | ready to harvest
│   ├── InteractiveAnimal × N (animals)
│   │   └── Shows: health, feed status
│   └── InteractiveBuilding × N (buildings)
│       └── Shows: shop, barn, farmhouse
│
├── Player (farmer character)
│   └── Shows: position, walking animation
│
├── GameHUD (top bar)
│   ├── Player name + level
│   ├── XP progress bar
│   └── Resource display (coins, gems, energy)
│
├── VirtualJoystick (bottom-left input)
│   ├── Outer ring
│   └── Inner knob
│
├── BottomMenu (bottom bar)
│   ├── Tab buttons
│   └── Opens modals on press
│
└── ModalManager (overlay system)
    ├── InventoryModal
    ├── ShopModal
    ├── MarketModal
    ├── ContractsModal
    └── Backdrop (semi-transparent)
```

---

## Data Flow Diagram

### Initial Load
```
App.tsx opens
  ↓
Firebase auth check
  ↓
User logged in? YES
  ↓
setCurrentScreen('worldmap')
  ↓
GameWorldScreen mounts
  ↓
useGameUpdate() starts game loop
  ↓
offlineProgressService.syncOfflineProgress()
  ↓
Render:
  - MapRenderer (world tiles)
  - Player at stored position
  - Interactive objects from farmStore
  - HUD from playerStore
  ↓
READY ✅
```

### Player Movement
```
User drags joystick
  ↓
VirtualJoystick.panResponder detects
  ↓
Calculate joystick position (x, y)
  ↓
worldService.isWalkable(newX, newY)?
  ↓
YES → setPlayerPosition(newX, newY) in worldStore
  ↓
useWorldStore re-renders
  ↓
MapRenderer updates camera position
  ↓
All components with position-based rendering re-render
  ↓
Player appears to move on screen
  ↓
Camera follows (setCameraPosition)
  ↓
Visual: Player moves, world scrolls
```

### Tap Interaction (Crop)
```
User taps on crop plot
  ↓
InteractivePlot.onPress() fires
  ↓
interactionService.handleCropInteraction(cropId)
  ↓
IF crop is empty:
  Show "Plant Crop" panel
  ↓
  User selects crop type
  ↓
  Check: coins? energy? plot available?
  ↓
  YES → useFarmStore.addPlantedCrop()
  → usePlayerStore.updateCoins(-cost)
  → usePlayerStore.updateEnergy(-cost)
  ↓
IF crop is growing:
  Show "Wheat - 2m 31s remaining"
  ↓
  Timer counts down in real-time
  ↓
IF crop is mature/ready:
  Show "Harvest" button
  ↓
  User taps
  ↓
  useFarmStore.harvestCrop(id)
  → useFarmStore.updateStorage('wheat', +quantity)
  → usePlayerStore.updateCoins(+harvestValue)
  → usePlayerStore.updateXP(+xpReward)
  ↓
Stores update → Components re-render → UI reflects changes
```

### Open Modal (Shop)
```
User taps [SHOP] in bottom menu
  ↓
BottomMenu.handleShop()
  ↓
useUIStore.setCurrentScreen('worldmap')  ← Keep world as background
useModalManager.openShop()               ← Open modal
  ↓
ModalManager renders ShopModal overlay
  ↓
Backdrop appears (semi-transparent)
  ↓
World is still visible but dimmed
  ↓
User sees shop items, can scroll, tap [BUY]
  ↓
[BUY] → handlePurchase()
  → Check: coins? inventory space?
  → usePlayerStore.updateCoins(-cost)
  → useFarmStore.updateStorage(item, +quantity)
  ↓
User taps [✕ Close]
  ↓
useModalManager.closeShop()
  ↓
ShopModal unmounts
  ↓
Backdrop disappears
  ↓
Back to game world with joystick active
```

---

## Game Loop Integration

```
gameLoopService (5-second ticks)
  │
  ├─→ updateEnergy()
  │   └─→ playerStore.updateEnergy(+1)
  │
  ├─→ updateCropGrowth()
  │   └─→ farmStore.plots.forEach(crop)
  │       └─→ IF harvestAt <= now
  │           └─→ WorldObject ready state changes
  │               └─→ MapRenderer shows "ready" visual
  │
  ├─→ updateAnimalProduction()
  │   └─→ farmStore.animals.forEach(animal)
  │       └─→ IF nextProduction <= now
  │           └─→ Add to storage
  │           └─→ Reset timer
  │
  └─→ checkContractDeadlines()
      └─→ IF contract expired
          └─→ Remove from active
          └─→ Add to completed

All updates flow through Zustand stores
Components with selectors auto-re-render
World updates in real-time visually
```

---

## Collision Detection

```
Player at (x=5.2, y=3.8)
Wants to move to (x=5.5, y=3.8)

worldService.isWalkable(5.5, 3.8)?
  ↓
Check tile at grid position floor(5.5)=5, floor(3.8)=3
  ↓
getTile(5, 3)
  ↓
IF type === 'water' → NOT WALKABLE → Don't move
IF type === 'grass' → WALKABLE → Allow move
  ↓
Check collidable objects (crops, animals, buildings)
  ↓
AABB collision test:
  playerBox = { x: 5.5, y: 3.8, w: 0.4, h: 0.4 }
  objectBox = { x: 6, y: 3, w: 1, h: 1 }
  
  Overlap? NO
  ↓
MOVE ALLOWED ✅
```

---

## World Coordinate System

```
World Grid (15 × 10 tiles)

(0,0) ──────→ (14,0)
  │
  │  🌿 (1,1)  🏡 (3,1)
  │  
  │  👨 (1,2)
  │
  ↓
(0,9) ──────→ (14,9)

Each tile = 50 pixels

Screen space = world space - camera offset

Player at world (5, 5) with camera at (0, 0):
  screenX = 5 * 50 - 0 = 250
  screenY = 5 * 50 - 0 = 250

Player at world (5, 5) with camera at (100, 0):
  screenX = 5 * 50 - 100 = 150
  screenY = 5 * 50 - 0 = 250
  
(Camera follows player, so player stays centered)
```

---

## Modal State Management

```
ModalManager (central state)
├── openModals: ['shop']
├── activeModal: ShopModal
└── backdrop: visible

When user opens modal:
  setModalState({ type: 'shop' })
  ↓
  ModalManager renders:
  - Backdrop (touches setModalState(null) on press)
  - ShopModal on top

When user closes:
  setModalState(null)
  ↓
  ModalManager unmounts backdrop + modal
  ↓
  gameWorldScreen is interactive again
```

---

## Graphics/Asset Layering

```
Layer 0: Map Tiles (Background)
  🌿 🌿 🏡 🌿 🌿
  🌿 🌿 🌿 🌿 🌿
  🌿 🌾 🌿 🌿 🌿

Layer 1: Static Buildings
  (Shop, Barn, Farmhouse with fixed positions)

Layer 2: World Objects
  🌾 Crops (grow over time)
  🐄 Animals (with animations)

Layer 3: Player
  👨 Farmer (moves with input)

Layer 4: UI
  HUD bar (top)
  Bottom menu (bottom)
  Joystick (bottom-left)

Layer 5: Modals
  Backdrop (semi-transparent)
  Modal window (shop, inventory, etc.)
```

---

## Error Handling Flow

```
MapRenderer fails to render
  ↓
Error boundary catches
  ↓
Show fallback: "Failed to load world"
  ↓
Retry button available

Player movement throws error
  ↓
gameLoopService catches
  ↓
Log to console (dev)
  ↓
Send to Crashlytics (production)
  ↓
Player doesn't move (safe)
  ↓
Game loop continues

Modal open fails
  ↓
ModalManager catches
  ↓
Show error notification
  ↓
Game continues in world
```

---

## Performance Considerations

```
MapRenderer optimization:
- Only render visible tiles (viewport culling)
- Use React.memo for Tile components
- Cache tile images

Player movement:
- Use Reanimated 3 for smooth animations
- Reduce joystick update frequency if needed
- Use interpolation for frame-rate independence

Object rendering:
- Only render objects in viewport
- Use object pooling for many crops/animals
- Lazy-load distant objects

Overall:
- Target 60 FPS on mobile
- Profile with React DevTools
- Monitor game loop tick time
```

---

## Testing Strategy

```
Unit Tests:
├── worldService.ts
│   ├── generateWorld() produces correct grid
│   ├── isWalkable() returns correct values
│   └── getTile() handles edge cases
├── interactionService.ts
│   ├── Plant crop updates store correctly
│   ├── Harvest updates storage + coins + XP
│   └── Feed animal updates health
└── Camera math
    └── screenPos calculation is correct

Component Tests:
├── MapRenderer renders tiles
├── Player position updates visually
├── InteractivePlot responds to taps
└── Modal opens/closes correctly

Integration Tests:
├── Player moves and world scrolls
├── Tap crop → plant flow
├── Tap animal → feed flow
├── Offline progression syncs
└── Firebase persist works
```

---

## Deployment Checklist

```
Before Phase 1 Release:
□ TypeScript compilation passes
□ All tests pass
□ No console errors
□ Builds on Android
□ Tested on Pixel_8 emulator
□ Works on iOS simulator
□ Performance acceptable (60 FPS)
□ Collisions working
□ Camera following properly

Before Phase 8 Release:
□ All 17 acceptance criteria pass
□ Visual polish complete
□ No crashes after 1 hour of play
□ Offline progression tested
□ Firebase sync verified
□ APK builds and installs
□ Play Store submission ready
```

---

## Summary

This redesign transforms FarmGame from a dashboard UI into an immersive farming game experience with:

✅ Interactive 2D world  
✅ Player movement and camera  
✅ Tappable world objects  
✅ Compact HUD overlay  
✅ Bottom menu with modals  
✅ Preserved game logic  
✅ Smooth animations  
✅ Mobile-friendly design  

The architecture is modular, testable, and maintains all existing game systems while providing a completely new visual experience.

