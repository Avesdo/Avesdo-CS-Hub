import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com",
  storageBucket: "avesdo-cs-hub.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearUploadLogs() {
  console.log('Clearing upload logs...');
  
  try {
    const q = query(collection(db, 'system_logs'), where('entityType', '==', 'Upload'));
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'system_logs', document.id)));
    });
    await Promise.all(deletePromises);
    console.log(`Cleared ${deletePromises.length} upload logs from system_logs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing upload logs:', error);
    process.exit(1);
  }
}

clearUploadLogs();
