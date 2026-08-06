import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import '@react-native-firebase/remote-config';
import '@react-native-firebase/analytics';
import '@react-native-firebase/crashlytics';
import '@react-native-firebase/messaging';
import '@react-native-firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const functions = firebase.functions();
export const remoteConfig = firebase.remoteConfig();
export const analytics = firebase.analytics();
export const crashlytics = firebase.crashlytics();
export const messaging = firebase.messaging();
export const storage = firebase.storage();

// Configure Remote Config
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour
  fetchTimeoutMillis: 60000,
};

// Enable offline persistence for Firestore
firestore.settings({
  persistence: true,
});

export default firebase;
