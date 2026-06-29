import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "dummy",
  authDomain: "dummy",
  projectId: "avesdo-cs-hub",
  storageBucket: "avesdo-cs-hub.appspot.com",
  messagingSenderId: "dummy",
  appId: "dummy",
  measurementId: "dummy"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAgents() {
  const querySnapshot = await getDocs(collection(db, 'support_tickets'));
  const agents = new Set();
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data['Assigned Agent Name']) {
      agents.add(data['Assigned Agent Name']);
    }
  });
  console.log("Unique agents in Support Tickets:", Array.from(agents));
}

checkAgents();
