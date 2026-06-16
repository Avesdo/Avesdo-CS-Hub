import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'avesdo-cs-hub',
  authDomain: 'avesdo-cs-hub.firebaseapp.com',
  databaseURL: 'https://avesdo-cs-hub.firebaseio.com'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearIntake() {
  console.log('Clearing current Data Intake...');
  const q = query(collection(db, 'aliases'), where('status', '==', 'pending_approval'));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log('Data Intake is already empty.');
    return;
  }
  let count = 0;
  const deletePromises = [];
  snapshot.forEach((d) => {
    deletePromises.push(deleteDoc(doc(db, 'aliases', d.id)));
    count++;
  });
  await Promise.all(deletePromises);
  console.log('Successfully deleted ' + count + ' pending aliases from Data Intake.');
}

clearIntake().catch(console.error);
