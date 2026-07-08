import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDodN6jpozyXsH1WP3JNxCrpxZ0PoesFkk",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  projectId: "avesdo-cs-hub",
  storageBucket: "avesdo-cs-hub.firebasestorage.app",
  messagingSenderId: "599925324995",
  appId: "1:599925324995:web:547f46480e609680ac3676"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkKB() {
  const snapshot = await getDocs(collection(db, 'kb_articles'));
  console.log(`Found ${snapshot.docs.length} KB articles.`);
  snapshot.docs.forEach(doc => {
    console.log(doc.id, doc.data().title);
  });
  process.exit(0);
}

checkKB();
