import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  authDomain: "avesdo-cs-hub.firebaseapp.com",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com",
  storageBucket: "avesdo-cs-hub.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixSettings() {
  const docRef = doc(db, 'settings', 'global_config');
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) {
    console.log('No global_config found.');
    process.exit(1);
  }

  const settings = snap.data();
  let modified = false;

  // 1. Add settingsData if missing
  if (!settings.settingsData) {
    settings.settingsData = [
      { category: 'ServiceOutcome', name: 'Success', color: 'green', icon: 'CheckCircle2' },
      { category: 'ServiceOutcome', name: 'Pending', color: 'orange', icon: 'ClockAlert' },
      { category: 'ServiceOutcome', name: 'Failed', color: 'red', icon: 'CircleX' },
      { category: 'ServiceStatus', name: 'Active', color: 'green', icon: 'PlayCircle' },
      { category: 'ServiceStatus', name: 'Completed', color: 'blue', icon: 'CheckCircle2' },
      { category: 'ServiceStatus', name: 'Cancelled', color: 'slate', icon: 'Ban' }
    ];
    modified = true;
  }

  // 2. Add serviceTypes if missing
  if (!settings.serviceTypes) {
    settings.serviceTypes = [
      { name: 'Consulting', color: 'indigo', icon: 'Briefcase' },
      { name: 'Implementation', color: 'blue', icon: 'Blocks' },
      { name: 'Training', color: 'orange', icon: 'Users' },
      { name: 'Support', color: 'teal', icon: 'Wrench' }
    ];
    modified = true;
  }

  // 3. Fix missing icons in other arrays
  const arrayFields = ['managers', 'clientTypes', 'statuses', 'timelines', 'phases'];
  for (const field of arrayFields) {
    if (Array.isArray(settings[field])) {
      settings[field] = settings[field].map(item => {
        if (typeof item === 'object' && item !== null && !item.icon) {
          modified = true;
          return { ...item, icon: field === 'managers' ? 'User' : 'CircleDashed' };
        }
        return item;
      });
    }
  }

  if (modified) {
    await setDoc(docRef, settings);
    console.log('Settings patched successfully! Re-added default Outcomes, Statuses, Types, and Icons.');
  } else {
    console.log('Settings already have all required data.');
  }
  
  process.exit(0);
}

fixSettings();
