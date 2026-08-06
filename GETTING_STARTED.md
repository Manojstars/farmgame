# 🚀 Getting Started - Step by Step

## Phase 0: Set Up Your Environment (If Not Done)

```bash
# 1. Install Node.js 18+ from https://nodejs.org

# 2. Install Expo CLI
npm install -g expo-cli

# 3. Install Firebase CLI
npm install -g firebase-tools

# 4. Clone or open the project
cd "c:\Users\AQO1COB\farm life\FarmGame"

# 5. Install dependencies (already done, but just in case)
npm install --legacy-peer-deps
```

---

## Phase 1: Set Up Firebase (Required to Run)

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it "FarmGame"
4. Enable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Create Web App

1. In Firebase Console, click the Web icon (</> symbol)
2. App name: "FarmGame Web"
3. Copy the config object

### 1.3 Add Firebase Config to Project

Create `.env` file in project root:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### 1.4 Enable Firebase Services

In Firebase Console:

1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Anonymous"
   - Enable "Email/Password"

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create Database"
   - Start in Test mode
   - Choose "us-east1" region

3. **Cloud Functions**
   - Go to Cloud Functions (will deploy later)

4. **Remote Config**
   - Go to Remote Config
   - Add parameters for game balance

5. **Analytics & Crashlytics**
   - Enable automatically when you run the app

### 1.5 Create Firestore Collections

Go to Firestore Database → Start Collection:

Create these empty collections (we'll populate with code):
- `players`
- `farms`
- `marketListings`
- `contracts`
- `transactions`

---

## Phase 2: Test the App Locally

### 2.1 Start Development Server

```bash
cd "c:\Users\AQO1COB\farm life\FarmGame"
npm start
```

You should see:
```
Expo Go Terminal
Press i – open iOS simulator
Press a – open Android emulator
Press w – open web
Press j – open debugger
Press r – reload app
Press m – toggle menu
Press o – open Expo Go
```

### 2.2 Run on Your Device

**Android:**
```bash
Press a
# Wait for emulator to start
# You should see the FarmGame splash screen
```

**iOS (Mac only):**
```bash
Press i
# Wait for simulator to start
```

**Web:**
```bash
Press w
# Opens http://localhost:19006 in browser
```

### 2.3 Test the Gameplay

1. **Login Screen**
   - Tap "Login as Guest" to enter game
   
2. **Home Screen**
   - See player level and stats
   - See 9 buttons for different screens

3. **Farm Screen**
   - Tap empty plot to plant wheat
   - Watch progress bar fill (growth)
   - Tap to harvest when ready

4. **Animal Screen**
   - Buy a chicken
   - Wait for production to complete
   - Collect the eggs

5. **Market Screen**
   - Sell your crops for coins

6. **Shop Screen**
   - See gem packages (not functional yet - needs RevenueCat)

---

## Phase 3: Deploy Cloud Functions

### 3.1 Set Up Firebase Project Locally

```bash
# 1. Login to Firebase
firebase login

# 2. Initialize Firebase in your project
firebase init
# Select:
# - Firestore
# - Cloud Functions
# - Leave defaults for other options
```

### 3.2 Add Cloud Functions

Copy content from `functions/cloudFunctions.example.ts` to `functions/index.ts`:

```bash
# In functions/ directory
cp cloudFunctions.example.ts index.ts
```

### 3.3 Install Cloud Function Dependencies

```bash
cd functions
npm install firebase-functions firebase-admin
```

### 3.4 Deploy to Firebase

```bash
firebase deploy --only functions
```

Wait for deployment to complete. You should see:
```
✓ Deploy complete!
Function URL: https://us-east1-farmgame.cloudfunctions.net/...
```

### 3.5 Verify Deployment

In Firebase Console:
- Go to Cloud Functions
- You should see 9 functions listed
- Each should have a green checkmark

---

## Phase 4: Test Cloud Functions

### 4.1 Test Marketplace Sale

In your app:
1. Go to FarmScreen
2. Plant and harvest crops
3. Go to MarketScreen
4. Sell items
5. Check Firestore Database → transactions collection
6. Should see your sale logged

### 4.2 Test Contracts

In your app:
1. Go to ContractsScreen
2. Should see 3 daily contracts
3. Complete a contract
4. Check Firebase Console → Cloud Functions logs

---

## Phase 5: Set Up RevenueCat (Optional - For Monetization Testing)

### 5.1 Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com)
2. Sign up
3. Create app "FarmGame"
4. Get API Key

### 5.2 Configure In-App Products

#### For iOS (via App Store Connect):
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create app "FarmGame"
3. Add in-app purchase products:
   - ID: `com.farmgame.gems.50`, Price: $0.99
   - ID: `com.farmgame.gems.500`, Price: $4.99
   - ID: `com.farmgame.gems.2500`, Price: $19.99
   - ID: `com.farmgame.gems.6500`, Price: $49.99

#### For Android (via Google Play Console):
1. Go to [Google Play Console](https://play.google.com/console)
2. Create app "FarmGame"
3. Add in-app products with same IDs

### 5.3 Link to RevenueCat

In RevenueCat dashboard:
1. Connect App Store products
2. Connect Google Play products
3. Copy API Key to your code

---

## Phase 6: Prepare for App Store Submission

### 6.1 Generate Screenshots

Take screenshots on iOS/Android of:
- Splash screen
- Home screen
- Farm screen with crops
- Animal screen
- Market screen
- Shop screen

### 6.2 Write App Description

**Title:** FarmGame - American Farm Simulator

**Subtitle:** Build Your Dream Farm

**Description:**
```
Experience the complete American farm life! Plant crops, raise animals, 
build structures, and manage your farm to grow it into a thriving business.

Features:
🌾 Plant and harvest 5 crop types
🐄 Raise animals for production
🏢 Build farm structures
💰 Buy and sell at the marketplace
⚡ Manage energy and resources
💎 Unlock upgrades and technology
🏆 Compete on leaderboards
📱 Play offline anytime

Play the most realistic farming simulator!
```

### 6.3 Create Privacy Policy

Create a simple privacy policy stating:
- You collect minimal data
- You don't sell user data
- You use Firebase for data storage
- You use analytics to improve the game

Put it on a website (e.g., GitHub Pages) and get the URL.

### 6.4 Create App Icon

Create a 512x512 pixel icon and update in `app.json`:
```json
{
  "icon": "./assets/icon.png"
}
```

### 6.5 Create Splash Screen

Create a 1242x2688 pixel splash image and update in `app.json`:
```json
{
  "splash": {
    "image": "./assets/splash.png"
  }
}
```

---

## Phase 7: Build for Production

### 7.1 Build Android APK

```bash
# Using Expo EAS (easiest)
npm install -g eas-cli
eas login

# Configure for Android
eas build --platform android

# Build will complete in ~5 minutes
# Download APK from dashboard
```

### 7.2 Build iOS IPA

```bash
# Requires Mac
eas build --platform ios

# Will prompt for Apple developer account
# Download IPA when complete
```

### 7.3 Test APK/IPA

Install on physical device:
- **Android**: Connect phone via USB, drag APK to device
- **iOS**: Use TestFlight link from Apple

---

## Phase 8: Submit to App Stores

### 8.1 Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create app
3. Fill in store listing
4. Upload screenshots
5. Upload APK build
6. Set price and regions
7. Add in-app products
8. Submit for review (takes 1-4 hours)

### 8.2 App Store

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create app
3. Fill in store listing
4. Upload screenshots
5. Upload IPA build
6. Set price and regions
7. Add in-app products
8. Submit for review (takes 1-3 days)

---

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
npm start -- --clear
npm install --legacy-peer-deps
```

### Firebase connection fails
- Check `.env` file has correct credentials
- Check Firebase project has Firestore enabled
- Check security rules allow test access

### Cloud Functions won't deploy
```bash
firebase deploy --only functions --debug
# Check the error message
```

### Emulator won't start
```bash
# Install Android SDK
# Or use Expo Go app on phone instead
```

---

## Success Checklist ✅

- [ ] Firebase project created
- [ ] App runs on Android/iOS/Web
- [ ] Can plant and harvest crops
- [ ] Can buy/sell items
- [ ] Can complete contracts
- [ ] Cloud Functions deployed
- [ ] Can see data in Firestore
- [ ] RevenueCat configured
- [ ] Screenshots prepared
- [ ] App store listings created
- [ ] Builds uploaded
- [ ] Submitted for review

---

## You're Ready! 🎉

You've built a complete farming game. Now it's time to share it with the world!

**Questions?** Check these docs:
- DEPLOYMENT_GUIDE.md - Detailed setup
- QUICK_REFERENCE.md - Developer commands
- PROJECT_COMPLETE.md - Feature summary

**Need help?** 
- Read error messages carefully
- Check Firebase Console logs
- Use Chrome DevTools to debug

---

Good luck! 🚀🌾🐄
