import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com",
  storageBucket: "avesdo-cs-hub.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function backfillUnits() {
  console.log('Loading initial_imports.json...');
  const rawData = fs.readFileSync('./src/data/initial_imports.json', 'utf-8');
  const initialImports = JSON.parse(rawData);

  const unitsMap = {};
  for (const row of initialImports) {
    if (row.projectName && row.units) {
      unitsMap[row.projectName] = row.units;
    }
  }

  console.log(`Loaded ${Object.keys(unitsMap).length} project unit mappings.`);

  const querySnapshot = await getDocs(collection(db, 'projects'));
  let updatedCount = 0;

  const updatePromises = [];
  querySnapshot.forEach((document) => {
    const data = document.data();
    if (data.name && unitsMap[data.name]) {
      updatePromises.push(updateDoc(doc(db, 'projects', document.id), {
        units: unitsMap[data.name]
      }));
      updatedCount++;
    }
  });

  console.log(`Found ${updatedCount} projects to update. Applying updates...`);
  await Promise.all(updatePromises);
  console.log('Successfully backfilled units!');
  process.exit(0);
}

backfillUnits().catch(err => {
  console.error(err);
  process.exit(1);
});
