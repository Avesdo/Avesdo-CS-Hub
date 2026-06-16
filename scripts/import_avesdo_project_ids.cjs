const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');

admin.initializeApp({ projectId: 'avesdo-cs-hub' });
const db = admin.firestore();

async function run() {
  console.log('Fetching projects...');
  const projectsSnapshot = await db.collection('projects').get();
  const projects = [];
  projectsSnapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
  
  const filePath = path.join(__dirname, '..', 'Projects Developmentid.xlsx');
  const workbook = xlsx.readFile(filePath);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  let exactMatches = 0; let missing = 0;
  for (const row of data) {
    const avesdoId = row.Id;
    const buildingName = row.BuildingName;
    if (!avesdoId || !buildingName) continue;

    const matchedProject = projects.find(p => p.name && p.name.toLowerCase().trim() === buildingName.toLowerCase().trim());
    if (matchedProject) {
      await db.collection('projects').doc(matchedProject.id).update({ avesdoId: String(avesdoId) });
      const aliasId = 'A-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
      await db.collection('aliases').doc(aliasId).set({ type: 'project', rawName: String(avesdoId), targetId: matchedProject.id, status: 'verified' });
      exactMatches++;
    } else {
      const aliasId = 'A-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
      const targetId = 'P-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
      await db.collection('aliases').doc(aliasId).set({ type: 'project', rawName: String(avesdoId), targetId: targetId, status: 'pending_approval', contextName: buildingName });
      missing++;
    }
  }
  console.log(`Exact matches: ${exactMatches}, Unmatched sent to Admin Hub: ${missing}`);
}
run().catch(console.error);
