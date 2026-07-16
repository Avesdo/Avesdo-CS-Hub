import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDodN6jpozyXsH1WP3JNxCrpxZ0PoesFkk',
  authDomain: 'avesdo-cs-hub.firebaseapp.com',
  projectId: 'avesdo-cs-hub',
};

// Simplified copy of slug generator
function createBaseSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function generateUniqueSlug(name, existingSlugs) {
  const baseSlug = createBaseSlug(name);
  if (!baseSlug) return `entity-${Math.random().toString(36).substring(2, 6)}`;
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let uniqueSlug = '';
  let attempts = 0;
  do {
    const hash = Math.random().toString(36).substring(2, 6);
    uniqueSlug = `${baseSlug}-${hash}`;
    attempts++;
  } while (existingSlugs.has(uniqueSlug) && attempts < 10);

  return uniqueSlug;
}

import * as readline from 'readline';

async function run() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  const email = await question('Enter your Avesdo Admin Email: ');
  const password = await question('Enter your Password: ');
  rl.close();

  try {
    console.log('Logging in...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Logged in!');
  } catch (error) {
    console.error("Login failed. Check your credentials.");
    process.exit(1);
  }

  const existingSlugs = new Set();
  
  console.log('Fetching projects...');
  const snapshot = await getDocs(collection(db, 'projects'));
  
  const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  // Register existing valid slugs
  projects.forEach(p => {
    if (p.slug) existingSlugs.add(p.slug);
  });

  const batch = writeBatch(db);
  let count = 0;

  for (const p of projects) {
    if (!p.slug) {
      const newSlug = generateUniqueSlug(p.name, existingSlugs);
      existingSlugs.add(newSlug);
      
      const ref = doc(db, 'projects', p.id);
      batch.update(ref, { slug: newSlug });
      count++;
      console.log(`Assigned slug to ${p.id}: ${newSlug}`);
    }
  }

  if (count > 0) {
    console.log(`Committing batch with ${count} updates...`);
    await batch.commit();
    console.log('Done!');
  } else {
    console.log('No projects needed slug backfilling.');
  }

  process.exit(0);
}

run().catch(console.error);
