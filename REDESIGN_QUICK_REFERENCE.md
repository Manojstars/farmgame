# FarmGame UI Redesign — Quick Reference

## The Ask
Convert FarmGame from a **dashboard UI** to an **interactive farm world** where players move around a visual farm, tap objects to interact, and modals appear for secondary menus.

## Current State
- HomeScreen displays 8 action buttons in a grid
- Screens navigate full-screen (Farm → Animals → Market, etc.)
- Game logic (stores, services) is solid
- No world rendering or player movement

## Target State
- GameWorldScreen is the primary interface post-login
- Player character moves around a 2D top-down farm world
- Tap crop plots to plant/harvest
- Tap animals for feeding/collecting
- Bottom menu opens modals (Inventory, Shop, Market) over the world
- Compact HUD shows resources at top

## Reusable Code ✅
```
✅ playerStore.ts
✅ farmStore.ts
✅ uiStore.ts
✅ gameLoopService.ts
✅ firebaseService.ts
✅ All game constants (CROPS, ANIMALS, etc.)
✅ All tests
✅ All types in game.ts
```

## New Code 🆕
```
src/world/
├── components/
│   ├── GameWorldScreen.tsx
│   ├── MapRenderer.tsx
│   ├── Player.tsx
│   ├── VirtualJoystick.tsx
│   ├── GameHUD.tsx
│   ├── InteractivePlot.tsx
│   ├── InteractiveAnimal.tsx
│   └── ... (more UI components)
├── systems/
│   ├── worldService.ts
│   ├── collisionService.ts
│   ├── cameraService.ts
│   └── interactionService.ts
└── store/
    └── worldStore.ts

src/modals/
├── InventoryModal.tsx
├── ShopModal.tsx
├── MarketModal.tsx
├── ContractsModal.tsx
└── ModalManager.tsx
```

## Architecture
```
React Native App
  ↓
GameWorldScreen (new main screen)
  ├── MapRenderer (tiles, static world)
  ├── Player (farmer character)
  ├── InteractivePlots, InteractiveAnimals (world objects)
  ├── GameHUD (resources bar)
  ├── VirtualJoystick (movement input)
  ├── BottomMenu (action buttons)
  └── ModalManager (inventory, shop overlays)
  
Data Flow:
worldStore (position) → MapRenderer (render world)
worldStore + farmStore → Interactive objects (render crops/animals)
Tap object → interactionService → farmStore update → UI refresh
```

## 8-Phase Timeline

| # | Phase | Duration | Deliverable |
|---|-------|----------|-------------|
| 1 | Foundation | 3-4d | Static tiled world |
| 2 | Movement | 4-5d | Player + joystick + camera |
| 3 | Interactions | 5-6d | Tappable crops/animals |
| 4 | UI/HUD | 4-5d | Top bar + bottom menu |
| 5 | Modals | 5-6d | Inventory/Shop overlays |
| 6 | Integration | 3-4d | Game loop + mechanics |
| 7 | Polish | 5-6d | Graphics + animations |
| 8 | Testing | 3-4d | Build + deploy |

**Total: 6-8 weeks**

## Phase 1 Deliverables (START HERE)

### Files to Create
1. `src/world/store/worldStore.ts` — Player position + camera state
2. `src/world/systems/worldService.ts` — Tile generation, collision
3. `src/world/components/MapRenderer.tsx` — Render tiles
4. `src/world/components/GameWorldScreen.tsx` — Main container
5. Update `App.tsx` — Add 'worldmap' screen case
6. Update `src/store/uiStore.ts` — Add 'worldmap' to Screen type

### Expected Result
✅ Green tiled 15×10 world renders without errors  
✅ `npx tsc --noEmit` passes  
✅ `npm test -- --runInBand` passes  
✅ Builds on Android  

## Key Decisions

### Movement Controls
→ **Virtual Joystick** (Phase 2)  
Bottom-left analog stick for touch input

### Graphics Strategy
→ **Phase 1-4:** SVG placeholders (colored squares)  
→ **Phase 5-6:** Free tileset (Kenney or OpenGameArt)  
→ **Phase 7:** Polish/optional custom art

### World Size
→ **15 × 10 tiles** (750 × 500 px)  
→ Fits mobile screen  
→ Expandable later

### Modal Approach
→ Overlays on top of farm world  
→ Close button to return to world  
→ World stays visible/running in background

## Git Workflow

After each major task:
```bash
git add .
git commit -m "Phase X.Y: Brief description

- Bullet point 1
- Bullet point 2

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Build & Test

```bash
# Check TypeScript
npx tsc --noEmit

# Run tests
npm test -- --runInBand

# Build APK
npm run android

# Verify on device
# Test on Pixel_8 emulator
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Player doesn't move | Joystick state not updating | Check panResponder, verify setPlayerPosition called |
| World doesn't render | Tile map not generated | Verify worldService.generateWorld() is called |
| Camera doesn't follow | Camera position not updating | Check setCameraPosition in joystick handler |
| Objects in wrong spots | Coordinate math wrong | Remember: screenPos = worldPos * tileSize - cameraPos |
| TypeScript errors | Strict mode violation | Add proper types, no `any` |

## Acceptance Criteria (ALL 17 REQUIRED)

```
✅ 1. Login works
✅ 2. Player enters farm directly (no dashboard)
✅ 3. Farm is visually represented as game world
✅ 4. Player can move around
✅ 5. Camera follows player
✅ 6. Player can interact with crop plots
✅ 7. Player can plant crops
✅ 8. Player can harvest crops
✅ 9. Player can interact with animals
✅ 10. Inventory opens from farm (modal)
✅ 11. Shop opens from farm (modal)
✅ 12. Contracts/marketplace accessible (modal)
✅ 13. Resources visible in compact HUD
✅ 14. Firebase auth remains functional
✅ 15. Game state/persistence works
✅ 16. No dashboard/card grid as primary screen
✅ 17. Feels like a farming game (not admin software)
```

## What Does NOT Change

```
❌ Firebase architecture
❌ playerStore, farmStore
❌ Game loop service
❌ Crop/animal mechanics
❌ Economy system
❌ Existing tests
❌ Type definitions
❌ Cloud functions
❌ Remote config
```

## What Does Change

```
✅ Navigation flow (login → farm world directly)
✅ Primary screen (HomeScreen → GameWorldScreen)
✅ Screen types (add 'worldmap' to Screen union)
✅ Screens → Modals (Shop, Inventory, Market, Contracts)
✅ Visual presentation (dashboard → world)
✅ User input (button clicks → movement + taps)
```

## Full Documentation

For complete details, see:
- **FARM_WORLD_REDESIGN_AUDIT.md** (22KB) — Complete analysis
- **IMPLEMENTATION_ROADMAP.md** (19KB) — Phase 1-2 with code examples
- **REDESIGN_SUMMARY.md** (11KB) — Executive overview

## Ready to Begin?

### Before Phase 1 Starts:
1. Review audit + roadmap documents
2. Confirm Phase 1 architecture is acceptable
3. Get approval for graphics strategy
4. Confirm timeline works for your team

### Phase 1 Kickoff:
```bash
# Estimated: 3-4 days
# Create worldStore, worldService, MapRenderer
# Result: Static tiled world renders
```

---

**Status: READY FOR APPROVAL** ✅

All planning documents complete. Waiting for go-ahead to begin Phase 1.

