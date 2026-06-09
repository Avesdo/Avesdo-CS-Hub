/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

try {
  enableIndexedDbPersistence(db).catch((err: any) => {
    console.warn("Offline persistence failed:", err.code);
  });
} catch(e) {}
