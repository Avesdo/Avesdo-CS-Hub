import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import * as readline from 'readline';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDodN6jpozyXsH1WP3JNxCrpxZ0PoesFkk',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'avesdo-cs-hub.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'avesdo-cs-hub',
};

async function run() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log("=== Firestore DB Migration: Backfill Region ===");
  console.log("This will apply the 'US' region (or your choice) to all existing projects.");
  
  const defaultRegion = await question('Enter the default region to apply (e.g., US, Canada): ');
  
  if (!defaultRegion.trim()) {
    console.log("Migration aborted. No region provided.");
    process.exit(1);
  }

  const email = await question('Enter your Avesdo Admin Email: ');
  const password = await question('Enter your Password: ');
  rl.close();

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    console.log('\nLogging in...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Logged in successfully.');
  } catch (error) {
    console.error("Login failed:", error.message);
    process.exit(1);
  }

  console.log('Fetching projects...');
  const snapshot = await getDocs(collection(db, 'projects'));
  
  const batch = writeBatch(db);
  let count = 0;

  for (const document of snapshot.docs) {
    const data = document.data();
    if (!data.region) {
      const ref = doc(db, 'projects', document.id);
      batch.update(ref, { region: defaultRegion.trim() });
      count++;
      console.log(`Assigned region '${defaultRegion}' to project: ${document.id}`);
    }
  }

  if (count > 0) {
    console.log(`\nCommitting batch with ${count} updates...`);
    await batch.commit();
    console.log('Done!');
  } else {
    console.log('\nNo projects needed region backfilling.');
  }

  process.exit(0);
}

run().catch(console.error);
