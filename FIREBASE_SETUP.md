# 🚀 Firebase Deployment Guide - FarmGame

## Step 1: Verify Your Firebase Project

Your Firebase Project ID: **206359236610**

Go to [Firebase Console](https://console.firebase.google.com) and verify:
- ✅ Project exists
- ✅ Firestore Database is enabled
- ✅ Authentication is set up (Email + Anonymous)
- ✅ Cloud Functions is enabled

## Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Or use npx:
```bash
npx firebase --version
```

## Step 3: Login to Firebase

```bash
firebase login
```

This will open a browser window to authenticate. Once done, return to terminal.

## Step 4: Verify Firebase Configuration

The following files have been created for you:

✅ `.firebaserc` - Project configuration (project ID: 206359236610)
✅ `firebase.json` - Deployment settings
✅ `functions/package.json` - Cloud Functions dependencies
✅ `functions/tsconfig.json` - TypeScript configuration
✅ `functions/index.ts` - 5 Production-ready Cloud Functions

## Step 5: Deploy Cloud Functions

### Option A: Using Firebase CLI (Recommended)

```bash
cd "c:\Users\AQO1COB\farm life\FarmGame"
npx firebase deploy --only functions
```

### Option B: Deploy Specific Functions

```bash
npx firebase deploy --only functions:onSellCrop
npx firebase deploy --only functions:updateMarketPrices
npx firebase deploy --only functions:generateDailyContracts
npx firebase deploy --only functions:onCompleteContract
npx firebase deploy --only functions:calculateOfflineProgress
npx firebase deploy --only functions:onPurchaseComplete
```

## Step 6: Test Deployment

After deployment completes, you should see:

```
✓ Deploy complete!

Function URL: https://us-east1-206359236610.cloudfunctions.net/...
```

Test a function:
```bash
npx firebase functions:call onSellCrop --data '{"cropName":"wheat","quantity":5,"basePrice":100}'
```

## Step 7: Set Up Firestore Collections

Go to [Firebase Console](https://console.firebase.google.com) → Firestore Database → Create Collection:

```
players/       - User profiles and progression
farms/         - Player farm state (crops, animals, buildings)
marketListings/- Marketplace items and prices
contracts/     - Daily contracts
transactions/  - All in-game transactions
```

## Step 8: Add Firebase Credentials to App

Update `.env` file with these values from Firebase Console > Project Settings > Web App:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=206359236610
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 9: Test the App Locally

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web

Create an account and test:
1. Plant crops on farm
2. Sell items at market (uses `onSellCrop` function)
3. Complete contracts (uses `onCompleteContract` function)
4. Check Firestore for transactions

## Cloud Functions Deployed

### 1. **onSellCrop**
- Validates player has items
- Deducts from inventory
- Adds coins to player
- Logs transaction

### 2. **updateMarketPrices** (Hourly)
- Runs automatically every hour
- Adjusts marketplace prices
- Updates price history

### 3. **generateDailyContracts** (Daily 2 AM UTC)
- Runs automatically daily
- Creates 3 random contracts per player
- Sets 24-hour expiration

### 4. **onCompleteContract**
- Validates contract ownership
- Checks item availability
- Distributes rewards (coins + XP)

### 5. **calculateOfflineProgress**
- Called on app open
- Calculates energy regeneration
- Processes crop growth

### 6. **onPurchaseComplete** (Optional)
- Verifies gem purchases
- Grants gems to player
- Logs IAP transactions

## Troubleshooting

### Firebase CLI not found
```bash
npm install -g firebase-tools
```

### Authentication errors
```bash
firebase logout
firebase login
```

### Deployment fails
```bash
firebase deploy --debug
```

### Check function logs
```bash
firebase functions:log
```

### View real-time logs
```bash
firebase functions:log --follow
```

## Next Steps

1. ✅ Deploy Cloud Functions (this page)
2. ✅ Test locally with `npm start`
3. ✅ Verify Firestore transactions
4. → Build APK/IPA with `eas build`
5. → Submit to app stores

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Ready to deploy?** Run this in your terminal:

```bash
cd "c:\Users\AQO1COB\farm life\FarmGame"
npx firebase deploy --only functions
```

Your Cloud Functions will be live in Firebase! 🚀
