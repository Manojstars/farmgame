# Phase 1 Build & Test Guide

## Current Development Environment

**Status:** Code-Complete ✅ | Build Tools Unavailable ⚠️

| Component | Status | Notes |
|-----------|--------|-------|
| TypeScript Compilation | ✅ PASS | 0 errors, strict mode |
| Unit Tests | ✅ PASS | 42/42 tests passing |
| Code Quality | ✅ PASS | No regressions |
| Expo CLI | ❌ Not Working | Windows bug with spaced paths |
| Java/JDK | ❌ Not Installed | Required for Android build |
| Gradle | ❌ Not Installed | Required for Gradle build |
| Android SDK | ❌ Unknown | Build environment not ready |

## Why Local Build Failed

The Windows development environment lacks:
1. **Java Development Kit (JDK)** - Required by Gradle
2. **Android SDK** - Required by React Native
3. **Gradle** - Build tool for Android
4. **Working Expo CLI** - Expo 0.17.13 on Windows has a bug with spaced paths (`_internal.projectRoot` assertion)

## Solution: Build on Linux/macOS or Cloud

### Option 1: EAS Cloud Build (Recommended) ⭐

**Requirements:** Expo/Expo.dev account (free)

```bash
npm install --legacy-peer-deps

# First time only - link project to Expo
npx eas-cli@latest build:configure --platform android

# Build in cloud
npx eas build --platform android --output game.apk

# APK will be downloaded when ready
```

**Pros:**
- No local build environment needed
- Fully managed cloud build
- Works on any OS
- Automatic signing

**Time:** ~5-10 minutes

### Option 2: macOS/Linux Machine

**Requirements:** macOS or Linux machine with Node.js v18+

```bash
# Clone repo on macOS/Linux
git clone <repo-url>
cd FarmGame.worktrees/vscode-dev-infrastructure-setup

npm install --legacy-peer-deps

# Start dev server
npx expo start

# Scan QR code with Pixel_8 emulator via Expo Go
# OR build APK locally
npx eas build --platform android --local

# Install APK on Pixel_8
adb install -r game.apk
```

**Pros:**
- Full local control
- Fastest iteration
- No cloud dependency

**Requirements:**
- Xcode/Android Studio
- JDK 17+
- Gradle
- Android SDK

**Time:** Setup 30 min, Build 10-15 min

### Option 3: GitHub Actions CI/CD (Easiest)

**Requirements:** GitHub repository push

```bash
# Push to GitHub
git push origin agents/vscode-dev-infrastructure-setup

# GitHub Actions automatically triggers Android build
# Download APK from Actions artifacts tab
```

**Pros:**
- Zero local setup
- Fully automated
- Works from any machine

**Note:** Requires `.github/workflows/build.yml` configuration

**Time:** ~10-15 minutes

### Option 4: Docker (Advanced)

```bash
# On Windows machine
docker run -it --rm -v %cd%:/workspace \
  node:18-alpine sh -c "
    cd /workspace && \
    npm install --legacy-peer-deps && \
    npx eas build --platform android --local
  "
```

**Pros:**
- Uses Linux container
- No local Java/Android SDK needed
- Reproducible build environment

**Cons:**
- Docker installation required
- Slower than native build

**Time:** Setup 20 min, Build 15-20 min

## Manual Testing on Pixel_8 Emulator

### Prerequisites (for any method)

1. **Android Emulator Running:** Pixel_8 API 34
2. **Phase 1 APK Built:** (via one of options above)
3. **Firebase Configured:** Use provided `.env` file
4. **Expo Go App:** Install from emulator Play Store (or via APK)

### Test Procedure

#### 1. Pre-Test Checklist

```bash
# Verify code is ready
npx tsc --noEmit  # Should pass ✅
npm test          # Should pass ✅
git log --oneline -1  # Should show Phase 1 commit
```

#### 2. Install APK

```bash
# After APK build (location depends on method used)
adb install -r game.apk

# Or via Expo Go (scan QR code from `npx expo start`)
```

#### 3. Launch App

- Open app on Pixel_8
- Should see **splash screen** → **login screen**

#### 4. Test Login Flow

```
Expected:
1. Email input field visible
2. Password input field visible
3. Login button visible

Action:
- Enter valid Firebase user credentials
- Click Login button

Expected Result:
- Loading state shows
- User authenticated
- Redirected to FARM WORLD (NOT dashboard)
- GameWorldScreen renders
```

#### 5. Test World Rendering

```
Expected:
- See tiled farm environment
- Grass tiles visible
- Dirt paths visible
- Farmhouse building visible
- Barn building visible
- At least 13 crop plots visible
- Fences visible
- Trees visible
- Player character visible in center

Visual Check:
- Does it look like a FARM? (Not a dashboard)
- Are graphics readable on mobile screen?
- Colors coherent?
```

#### 6. Test Player Movement

```
Expected:
- Virtual joystick visible (bottom-left corner)
- Semi-transparent circle background
- Touch-responsive

Action:
- Touch and drag joystick left/right/up/down
- Release

Expected Result:
- Player character moves in touched direction
- Movement smooth (no jumps)
- Camera follows player
- Player stays within farm boundaries
- Collision detection working (can't walk through buildings)
```

#### 7. Test HUD

```
Expected - Top left corner should show:
- "Lv X Farmer" (level)
- XP progress bar
- 💰 Coins amount
- 💎 Gems amount
- ⚡ Energy amount

Test:
- Move around and verify values update
- Values should be realistic (match initial player state)
```

#### 8. Test Crop Interaction

```
Expected Setup:
- Farm has multiple empty crop plots
- Can navigate to one with joystick

Action:
- Approach empty crop plot (within 1.5 units)
- Tap on the plot

Expected Result:
- Interaction indicator appears
- Menu shows "Plant Crop" option
- Can see crop choices: Wheat, Corn
```

#### 9. Test Planting

```
Current State:
- Empty plot tapped
- Plant menu visible
- Wheat selected

Action:
- Click "Plant Wheat"

Expected Result:
- Plant confirmation shows
- Coins decrease (by 20)
- Energy decreases (by GAME_CONFIG.ENERGY_COST_PLANT)
- Plot now shows "Planting..."
- Timer visible on plot (e.g., "3:00")
- Plot state: GROWING
```

#### 10. Test Growth & Harvest

```
Current State:
- Plot has planted Wheat
- Timer counting down

Option A - Wait for Real Timer:
- Wait ~3 minutes for wheat to grow
- Plot should change appearance when ready

Option B - Accelerate for Testing:
- Edit src/utils/constants.ts (CROPS section)
- Change wheat growthTimeSeconds: 180 to 5 (5 seconds)
- Rebuild and install
- Test again with 5-second timer

Expected After Growth:
- Plot changes appearance (ready state)
- Timer disappears
- Plot becomes interactive again

Action After Ready:
- Tap plot again
- "Harvest" button shows

Expected On Harvest:
- Crop removed from plot
- Inventory increases (+1 Wheat)
- Coins increase (reward)
- XP increases (reward)
- Plot returns to EMPTY state
- Can plant again immediately
```

#### 11. Test Multiple Plots

```
Action:
- Repeat planting process on 5-6 different plots
- Plant different crops (Wheat, Corn)
- Plant at different times

Expected:
- Multiple plots grow independently
- Timers display correctly on each
- Can harvest one while others growing
- Inventory accumulates different crops
```

#### 12. Test Collision Detection

```
Action:
- Try to walk through buildings (farmhouse, barn)
- Try to walk off farm edges
- Try to walk through fences

Expected:
- Player cannot pass through solid objects
- Player stopped at boundaries
- No clipping through buildings
```

#### 13. Stress Test

```
Action:
- Plant all 13 plots at once
- Move rapidly around farm
- Harvest while others growing
- Rapid taps on multiple plots
- Extended play session (10+ minutes)

Expected:
- No crashes
- No memory issues
- Performance acceptable (60 FPS goal)
- All state updates correctly
- No graphical glitches
```

#### 14. Firebase Integration Test

```
Expected:
- App uses real Firebase backend
- Player data persists
- Inventory saved
- Can close app and reopen
- State restored correctly

Action:
- Plant crops
- Close app
- Reopen app
- Login again

Expected Result:
- Farm world appears
- Plots still have growing crops
- Inventory has harvested items
- Resources match previous state
```

## Success Criteria for Phase 1

### Code Quality ✅

- [x] TypeScript: 0 errors (strict mode)
- [x] Tests: 42/42 passing
- [x] No regressions in existing systems
- [x] All game logic integrated
- [x] All systems reuse existing code

### Device Testing 🎮

- [ ] App launches successfully
- [ ] Login flow works
- [ ] Redirects to farm world (not dashboard)
- [ ] Visual farm environment renders
- [ ] Player character visible
- [ ] Camera follows player
- [ ] Virtual joystick functional
- [ ] Player movement smooth
- [ ] Collision detection working
- [ ] Farm boundaries enforced
- [ ] HUD displays all resources
- [ ] Crop plots are interactive
- [ ] Planting works end-to-end
- [ ] Growth timer displays
- [ ] Harvesting works
- [ ] Inventory updates
- [ ] Coins/XP rewards apply
- [ ] Firebase persistence works
- [ ] No crashes during 30-min play session
- [ ] Performance acceptable (target 60 FPS)

### User Experience 🎯

- [ ] Feels like a farming game, not a dashboard
- [ ] Controls intuitive on mobile
- [ ] Visual style coherent and friendly
- [ ] No confusion about what to do next
- [ ] Progression feels rewarding
- [ ] Graphics readable on phone screen
- [ ] Smooth animations
- [ ] Responsive to input

## Troubleshooting

### "App keeps crashing on launch"
1. Clear app data: `adb shell pm clear com.farmgame.app`
2. Reinstall: `adb install -r game.apk`
3. Check Firebase config in `.env`
4. Check logs: `adb logcat | grep -i farmgame`

### "Joystick not responding"
1. Check if bottom-left corner clear
2. Tap and hold (not tap-tap-tap)
3. Verify touch input in emulator settings
4. Check `VirtualJoystick` component mounted

### "Crops not growing"
1. Check if timer started (should show on plot)
2. Verify system clock (game uses Date.now())
3. Check console for errors
4. Verify CropPlot component updated

### "Inventory not changing"
1. Check if harvest completed (plot should be empty)
2. Verify farmStore integration
3. Check console for addPlantedCrop errors
4. Verify inventory screen shows new items

### "Can walk through buildings"
1. Check collision detection in worldService
2. Verify object.collidable flag set correctly
3. Check AABB bounds calculation

### "Camera not following"
1. Verify player position updates in worldStore
2. Check camera position calculation
3. Verify MapRenderer uses camera position
4. Check viewport culling bounds

## Next Steps After Phase 1 Success

Once Phase 1 passes device testing:

1. **Phase 2:** Animals and buildings
2. **Phase 3:** Marketplace integration
3. **Phase 4:** Contracts system
4. **Phase 5:** Upgrades and progression
5. **Phase 6:** Polish and optimization
6. **Phase 7:** Final testing and deployment

---

**For questions or blockers, refer to:**
- [PHASE_1_TEST_RESULTS.md](./PHASE_1_TEST_RESULTS.md) - Code validation results
- [README.md](./README.md) - Project overview
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Environment setup
