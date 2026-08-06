# ✅ Firebase Deployment Checklist - FarmGame

**Status:** Ready for Deployment ✅

---

## 🔐 Firebase Project Information

| Item | Value |
|------|-------|
| **Project Name** | farm life |
| **Project ID** | farm-in-america |
| **Region** | (Default) |
| **API Key** | AIzaSyAs8wWVZWN0_M0j0FOMCoPWeHOSNIZ6smM |
| **Auth Domain** | farm-in-america.firebaseapp.com |
| **Storage Bucket** | farm-in-america.firebasestorage.app |
| **App ID** | 1:206359236610:web:1fe84f8ef3d8088c76571b |
| **Messaging Sender ID** | 206359236610 |
| **Measurement ID** | G-DFNNSFT5CN |

---

## 📋 Configuration Files (✅ All Created)

### Root Level
- ✅ `.env` - Firebase credentials (ready to use)
- ✅ `.firebaserc` - Project configuration (farm-in-america)
- ✅ `firebase.json` - Deployment settings
- ✅ `firestore.rules` - Database security rules

### Functions Directory
- ✅ `functions/index.ts` - 6 Cloud Functions implemented
- ✅ `functions/package.json` - Dependencies installed (253 packages)
- ✅ `functions/tsconfig.json` - TypeScript configuration
- ✅ `functions/.gitignore` - Ignore files

### Services
- ✅ `src/services/firebaseService.ts` - Updated to use .env credentials
- ✅ `src/services/cloudFunctionsService.ts` - Ready to call functions
- ✅ `src/services/offlineProgressService.ts` - Uses calculateOfflineProgress
- ✅ `src/services/economyService.ts` - Game economy logic

---

## ☁️ Cloud Functions Ready to Deploy

| Function | Type | Purpose |
|----------|------|---------|
| **onSellCrop** | Callable | Marketplace sales with anti-cheat |
| **updateMarketPrices** | Scheduled | Hourly price adjustments |
| **generateDailyContracts** | Scheduled | Daily contract generation (2 AM UTC) |
| **onCompleteContract** | Callable | Contract completion with rewards |
| **calculateOfflineProgress** | Callable | Offline progression (energy, crops) |
| **onPurchaseComplete** | Callable | IAP verification & gem granting |

All functions use Firestore transactions for data consistency and server timestamps to prevent cheating.

---

## 🗄️ Firestore Collections Ready

Security rules configured for:
- `players/` - User profiles (read/write own)
- `farms/` - Farm data (read/write own)
- `marketListings/` - Public listings (read-only)
- `contracts/` - Player contracts (read own)
- `transactions/` - Transaction audit log (read own)
- `weatherEvents/` - Weather events (read-only)
- `leaderboards/` - Leaderboards (read-only)
- `analyticsEvents/` - Player events (read own)

---

## 🚀 Deployment Steps

### Step 1: Verify Firebase CLI
```bash
npm install -g firebase-tools
firebase --version
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Deploy Cloud Functions
```bash
cd "c:\Users\AQO1COB\farm life\FarmGame"
npx firebase deploy --only functions
```

**Expected output:**
```
✓ Deploy complete!

Function URL (onSellCrop): https://us-east1-farm-in-america.cloudfunctions.net/onSellCrop
Function URL (updateMarketPrices): https://us-east1-farm-in-america.cloudfunctions.net/updateMarketPrices
... [etc]
```

### Step 4: Deploy Firestore Rules
```bash
npx firebase deploy --only firestore:rules
```

### Step 5: Set Up Firestore Collections
Go to Firebase Console > farm-in-america > Firestore and create these collections:
1. `players` (with test document for initial setup)
2. `farms`
3. `marketListings`
4. `contracts`
5. `transactions`
6. `weatherEvents`
7. `leaderboards`
8. `analyticsEvents`

### Step 6: Test Local Connection
```bash
npm start
```
- Press `a` for Android Emulator
- Press `i` for iOS Simulator  
- Press `w` for Web

Then:
1. Create account (Firebase Auth email/anonymous)
2. View Home screen
3. Plant crops on Farm
4. Sell at Market (tests `onSellCrop` function)
5. Complete contracts (tests `onCompleteContract` function)
6. Check Firestore console to see data writes ✅

---

## 🔍 Verification Checklist

### Before Deployment
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase authenticated (`firebase login`)
- [ ] `.env` file exists with all credentials
- [ ] `functions/index.ts` exists
- [ ] `firestore.rules` exists
- [ ] `.firebaserc` has correct project ID (farm-in-america)

### After Deployment
- [ ] All 6 Cloud Functions appear in Firebase Console
- [ ] Firestore security rules deployed
- [ ] All 8 collections created in Firestore
- [ ] App starts without crashes
- [ ] Can create account
- [ ] Firestore writes succeed (check in Console)
- [ ] Cloud Function calls succeed (check logs)

---

## 🔧 Troubleshooting

### Firebase CLI Not Found
```bash
npm install -g firebase-tools
npx firebase login
```

### Deploy Fails with Permission Error
```bash
firebase logout
firebase login  # Re-authenticate
firebase deploy --only functions
```

### Environment Variables Not Loading
1. Ensure `.env` file exists in project root
2. Restart `npm start` after editing `.env`
3. Check variables with: `console.log(process.env.EXPO_PUBLIC_FIREBASE_API_KEY)`

### Firestore Writes Fail
1. Check security rules: `firebase deploy --only firestore:rules`
2. Verify user is authenticated in app
3. Check Firestore Console for errors

### Cloud Functions Not Callable
1. Verify functions deployed: `firebase functions:list`
2. Check logs: `firebase functions:log --follow`
3. Verify app region matches function region (us-east1)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **FIREBASE_SETUP.md** | Step-by-step Firebase setup |
| **DEPLOYMENT_GUIDE.md** | App Store submission guide |
| **QUICK_REFERENCE.md** | Developer cheatsheet |
| **README.md** | Project overview |

---

## ✨ Next Steps (In Order)

1. ✅ **Deploy Cloud Functions** ← YOU ARE HERE
   - Run: `npx firebase deploy --only functions`
   
2. ✅ **Deploy Firestore Rules**
   - Run: `npx firebase deploy --only firestore:rules`
   
3. ✅ **Create Firestore Collections**
   - Manually in Firebase Console or via code

4. ✅ **Test Locally**
   - Run: `npm start`
   - Test all game features

5. ✅ **Fine-tune Gameplay**
   - Adjust economy via Remote Config
   - Monitor Cloud Function logs

6. → **Build for App Stores**
   - Android: `eas build --platform android`
   - iOS: `eas build --platform ios`

7. → **Submit to Stores**
   - Google Play Store
   - Apple App Store

---

## 📞 Quick Commands Reference

```bash
# Login to Firebase
firebase login

# List all functions
firebase functions:list

# View function logs (real-time)
firebase functions:log --follow

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# Test a function locally
firebase functions:shell
> onSellCrop({cropName: 'wheat', quantity: 5, basePrice: 100})
```

---

## 🎯 You're All Set!

Everything is configured and ready. Your app will connect to Firebase project **farm-in-america** with:
- ✅ All credentials in `.env`
- ✅ Cloud Functions ready to deploy
- ✅ Firestore security rules ready
- ✅ 8 collections defined
- ✅ Database transaction logic implemented

**Run the deployment now:**
```bash
cd "c:\Users\AQO1COB\farm life\FarmGame"
npx firebase deploy --only functions
```

Your Cloud Functions will be live! 🚀
