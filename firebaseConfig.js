import { initializeApp } from "firebase/app"
import { initializeAuth } from "firebase/auth"
import { getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getFirestore, doc, setDoc, getDoc, updateDoc, persistentLocalCache, disableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from "expo-constants"

// Your web app's Firebase configuration

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.API_KEY,
    authDomain: Constants.expoConfig.extra.AUTH_DOMAIN,
    projectId: Constants.expoConfig.extra.PROJECT_ID,
    storageBucket: Constants.expoConfig.extra.STORAGE_BUCKET,
    messagingSenderId: Constants.expoConfig.extra.MESSAGING_SENDER_ID,
    appId: Constants.expoConfig.extra.APP_ID
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, getDoc, setDoc, doc, updateDoc, storage }




