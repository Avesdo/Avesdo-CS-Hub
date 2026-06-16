import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import * as xlsxImport from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const xlsx = xlsxImport.default ? xlsxImport.default : xlsxImport;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function run() {
  console.log("Fetching projects from Firestore...");
  const projectsSnapshot = await getDocs(collection(db, "projects"));
  const projects = [];
  projectsSnapshot.forEach(d => {
    projects.push({ id: d.id, ...d.data() });
  });
  console.log("Loaded " + projects.length + " projects.");

  const filePath = "c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/Projects Developmentid.xlsx";
  const workbook = xlsx.readFile(filePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  let exactMatches = 0;
  let missing = 0;

  for (const row of data) {
    const devId = row.DevelopmentId;
    const avesdoId = row.Id;
    const buildingName = row.BuildingName;

    if (!avesdoId || !buildingName) continue;

    const matchedProject = projects.find(p => p.name && p.name.toLowerCase().trim() === buildingName.toLowerCase().trim());

    if (matchedProject) {
      const updates = { avesdoId: String(avesdoId) };
      if (devId) updates.developmentId = String(devId);
      await updateDoc(doc(db, "projects", matchedProject.id), updates);
      
      const aliasId = "A-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      await setDoc(doc(db, "aliases", aliasId), {
        type: "project",
        rawName: String(avesdoId),
        targetId: matchedProject.id,
        status: "verified"
      });
      exactMatches++;
    } else {
      const aliasId = "A-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      const targetId = "P-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      await setDoc(doc(db, "aliases", aliasId), {
        type: "project",
        rawName: String(avesdoId),
        targetId: targetId,
        status: "pending_approval",
        contextName: buildingName
      });
      missing++;
    }
  }

  console.log("Exact matches processed: " + exactMatches);
  console.log("Unmatched sent to Admin Hub: " + missing);
  process.exit(0);
}

run().catch(console.error);
