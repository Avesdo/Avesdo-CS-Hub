import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com",
  storageBucket: "avesdo-cs-hub.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collectionName) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises = [];
  querySnapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
  });
  await Promise.all(deletePromises);
  console.log(`Cleared ${deletePromises.length} documents from ${collectionName}`);
}

async function clearData() {
  console.log('Clearing dummy data using Web SDK...');
  
  try {
    await clearCollection('clients');
    await clearCollection('projects');
    await clearCollection('services');
    await clearCollection('system_logs');
    
    // Note: We are leaving the 'settings' collection intact so the user has the default dropdowns/tags to work with.
    
    console.log('Dummy data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing dummy data:', error);
    process.exit(1);
  }
}

clearData();
