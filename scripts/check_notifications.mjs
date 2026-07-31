import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming script runs from scratch dir, project is at C:\Users\roell\Downloads\CS_Hub\Avesdo_CS_Hub
dotenv.config({ path: 'C:\\Users\\roell\\Downloads\\CS_Hub\\Avesdo_CS_Hub\\.env' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkNotifications() {
  console.log('Fetching latest 5 notifications...');
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
  process.exit(0);
}

checkNotifications().catch(console.error);
