import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, limit, getDocs, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(100));
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} logs`);
  snap.forEach(doc => {
    const data = doc.data();
    if (data.action === 'update_settings' || data.entityType === 'settings' || data.action?.includes('settings')) {
      console.log('Found setting log!', doc.id, data.action, data.entityType);
    }
  });
  process.exit(0);
}

run();
