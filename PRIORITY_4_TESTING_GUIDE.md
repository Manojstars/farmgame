# PRIORITY 4 — LOCAL APPLICATION VALIDATION

## Infrastructure Status ✓

All infrastructure checks passed:

```
TypeScript           [PASS]
Tests                [PASS] (42/42)
Health Check         [PASS] (14/14)
Expo SDK             [PASS] (50.0.0)
React Native         [PASS] (0.74.0)
Node.js              [PASS] (v24.15.0)
npm                  [PASS] (v11.12.1)
Firebase Config      [PASS]
Assets               [PASS]
Dependencies         [PASS]
Project Structure    [PASS]
Git Repository       [PASS]
```

The project is ready for application-level validation.

---

## STEP 1: Start Expo Development Server

**Option A: Batch File (Windows)**
```powershell
C:\Dev\FarmGame\start_expo.bat
```

**Option B: PowerShell**
```powershell
cd C:\Dev\FarmGame
npx expo start --clear
```

**Option C: Command Prompt**
```cmd
cd C:\Dev\FarmGame
npx expo start --clear
```

### Expected Output

You should see:
```
› Press 'a' to open Android
› Press 'i' to open iOS
› Press 'w' to open web
› Press 'r' to reload app
› Press 'q' to quit
```

Keep this window open during all testing.

---

## STEP 2: Connect to App

### Option A: Android Phone with Expo Go (RECOMMENDED)
1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Scan the QR code shown in the terminal
4. App loads on your phone

### Option B: Android Emulator
1. Start Android Studio emulator
2. Press `a` in the Expo terminal
3. App launches in emulator

### Option C: Web (if supported)
1. Press `w` in the Expo terminal
2. App opens in your web browser
3. Note: Some React Native features may not work in web

---

## STEP 3: Test Application Startup

**Expected Behavior:**
- App icon appears on device
- Splash screen displays
- No immediate crashes or red error screens

**Report:**
- [ ] App launches without crashing
- [ ] Splash screen appears
- [ ] App is responsive (no frozen UI)

---

## STEP 4: Test Authentication & Navigation

**Test Sequence:**

1. **Login/Signup Screen**
   - [ ] Can you see the login screen?
   - [ ] Can you tap to signup?
   - [ ] Can you enter credentials?

2. **Create Test Account**
   - [ ] Signup works
   - [ ] You reach the home screen
   - [ ] No authentication errors

3. **Navigation Menu**
   - [ ] Home screen visible
   - [ ] Farm screen accessible
   - [ ] Animals screen accessible
   - [ ] Buildings screen accessible
   - [ ] Inventory screen accessible
   - [ ] Market screen accessible
   - [ ] Shop screen accessible
   - [ ] Settings accessible

**Report:**
- [ ] Auth flow works
- [ ] All screens navigate correctly
- [ ] No navigation errors

---

## STEP 5: Test Core Gameplay Loop

**Plant & Harvest Test:**

1. **Plant Crop**
   - [ ] Go to Farm screen
   - [ ] Tap an empty plot
   - [ ] Select a crop (e.g., wheat)
   - [ ] Confirm plant
   - [ ] Crop appears in plot

2. **Skip Time (Optional)**
   - [ ] If there's a time skip option in debug panel, use it
   - [ ] Or wait for crop to grow naturally (~30 seconds to 5 minutes)

3. **Harvest**
   - [ ] Crop is ready (visual change, glow, etc.)
   - [ ] Tap crop to harvest
   - [ ] Crop disappears from plot
   - [ ] Coins increase
   - [ ] Inventory increases

4. **Inventory Check**
   - [ ] Go to Inventory screen
   - [ ] Verify harvested crop is there
   - [ ] Quantity matches what you harvested

5. **Sell Crop**
   - [ ] Go to Market screen
   - [ ] Find the harvested crop
   - [ ] Tap to sell
   - [ ] Coins increase in player info
   - [ ] Crop disappears from inventory

**Report:**
- [ ] Plant → Grow → Harvest → Collect → Inventory → Sell works
- [ ] Coins update when selling
- [ ] No gameplay errors

---

## STEP 6: Test Developer Debug Panel

**Access Debug Panel:**
- On development builds only, there may be a debug button/screen
- Look for: "Developer Debug Panel" or similar
- Try swiping from edges or looking for a dev menu button

**If Debug Panel Accessible:**

1. **Add Test Coins**
   - [ ] Find "Add coins" button
   - [ ] Tap to add coins
   - [ ] Coins increase in player profile
   - Confirm amount added

2. **Add XP**
   - [ ] Find "Add XP" button
   - [ ] Add XP
   - [ ] Check player level/XP in profile

3. **Complete Crop**
   - [ ] Plant a crop
   - [ ] Use debug button to "Complete crop" or skip growth time
   - [ ] Crop becomes ready instantly
   - [ ] Harvest it

4. **Reset Local State**
   - [ ] Find "Reset" or "Clear all data" button
   - [ ] Confirm you want to reset
   - [ ] App returns to clean state

**If Debug Panel NOT Accessible:**
- Debug panel is hidden in production builds (expected)
- This is correct behavior

**Report:**
- [ ] Debug panel accessible in development
- [ ] Debug controls work correctly
- [ ] Debug panel NOT visible in production

---

## STEP 7: Test Persistence & Restart

1. **Create State**
   - [ ] Plant crops
   - [ ] Build structures
   - [ ] Accumulate resources
   - [ ] Remember key values (coins, level, inventory items)

2. **Save**
   - [ ] App auto-saves (most games do this)
   - [ ] Close app completely (swipe away from app switcher)

3. **Restart**
   - [ ] Close Expo if needed
   - [ ] Reopen app from home screen
   - [ ] App should restore to saved state

4. **Verify Persistence**
   - [ ] Same coins as before
   - [ ] Same level as before
   - [ ] Same crops/buildings as before
   - [ ] Same inventory as before

**Report:**
- [ ] App saves state
- [ ] App restores state on restart
- [ ] No data loss on restart

---

## STEP 8: Test Additional Features

### Animals
- [ ] Can you build animal buildings?
- [ ] Do animals produce resources?
- [ ] Can you harvest animal production?

### Buildings
- [ ] Can you construct buildings?
- [ ] Do buildings have costs?
- [ ] Do buildings provide bonuses?

### Contracts/Tasks
- [ ] Are there contracts available?
- [ ] Can you accept contracts?
- [ ] Can you complete them?

### Shop/Upgrades
- [ ] Is there a shop to buy items?
- [ ] Can you purchase upgrades?
- [ ] Do upgrades affect gameplay?

**Report:**
- [ ] Animals work
- [ ] Buildings work
- [ ] Contracts work
- [ ] Shop/upgrades work

---

## STEP 9: Firebase Emulator (If Java 21+ Available)

**Current Status:**
- Java version detected: 1.8 (too old)
- Firebase Emulator requires: Java 11 or later
- Recommended: Java 21

**To Enable Firebase Emulator:**
```powershell
# First, check Java
java -version

# If Java 21+:
firebase emulators:start

# Then restart Expo
```

**Testing Firebase Emulator:**
1. Emulator should show local URLs
2. Create account in Auth Emulator
3. Save data to Firestore Emulator
4. Verify no production data is modified

**Report:**
- [ ] Java version adequate?
- [ ] Firebase Emulator starts?
- [ ] Auth Emulator works?
- [ ] Firestore Emulator works?
- [ ] Can connect app to emulator?

---

## STEP 10: Summary Report

After testing, create a summary with these results:

```
PRIORITY 4 VALIDATION RESULTS
═════════════════════════════════════════

APP STARTUP              [PASS/FAIL]
AUTHENTICATION           [PASS/FAIL]
NAVIGATION               [PASS/FAIL]
CORE GAMEPLAY LOOP       [PASS/FAIL]
  - Plant                [PASS/FAIL]
  - Harvest              [PASS/FAIL]
  - Inventory            [PASS/FAIL]
  - Sell                 [PASS/FAIL]
ANIMALS                  [PASS/FAIL]
BUILDINGS                [PASS/FAIL]
INVENTORY SYSTEM         [PASS/FAIL]
MARKET                   [PASS/FAIL]
CONTRACTS                [PASS/FAIL]
SHOP/UPGRADES            [PASS/FAIL]
PERSISTENCE              [PASS/FAIL]
DEBUG PANEL              [PASS/FAIL]
FIREBASE EMULATOR        [PASS/WARN/FAIL]

ISSUES FOUND:
(List any errors, crashes, or unexpected behavior)

NEXT STEPS:
(What should we fix or improve?)
```

---

## Troubleshooting

### Expo won't start
- Delete `.expo` folder: `rm -r .expo`
- Clear cache: `npx expo start --clear`
- Restart terminal

### App keeps crashing
- Check terminal for red error messages
- Capture the full error text
- Report to developer

### Can't connect with Expo Go
- Make sure phone is on same WiFi network as computer
- Restart Expo (press `r` in terminal)
- Restart Expo Go app
- Try again with QR code

### Persisting data doesn't work
- Check if AsyncStorage permissions are granted (especially Android 13+)
- Look for warnings in Expo terminal
- May require app reinstall with proper permissions

### Debug panel missing
- Ensure you're in development mode (not production build)
- Expo development server should show debug options
- Try hot reload: press `r` in Expo terminal

---

## Files to Reference

- Project root: `C:\Dev\FarmGame`
- Game code: `C:\Dev\FarmGame\src`
- Stores: `C:\Dev\FarmGame\src\store`
- Components: `C:\Dev\FarmGame\src\components`
- App entry: `C:\Dev\FarmGame\App.tsx`

---

## Next Phase

Once PRIORITY 4 testing is complete:

1. **If all systems PASS**: Move to PRIORITY 5 (new feature development)
2. **If systems WARN**: Fix known issues, re-test
3. **If systems FAIL**: Investigate root causes before continuing

---

Generated: 2024
Location: `C:\Dev\FarmGame\PRIORITY_4_TESTING_GUIDE.md`
