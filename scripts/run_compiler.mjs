import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import * as readline from 'readline';

// Provide fallback for xlsx import to support ES modules
import * as xlsxImport from 'xlsx';
const xlsx = xlsxImport.default ? xlsxImport.default : xlsxImport;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: 'AIzaSyDodN6jpozyXsH1WP3JNxCrpxZ0PoesFkk',
  authDomain: 'avesdo-cs-hub.firebaseapp.com',
  projectId: 'avesdo-cs-hub',
  storageBucket: 'avesdo-cs-hub.firebasestorage.app',
  messagingSenderId: '599925324995',
  appId: '1:599925324995:web:547f46480e609680ac3676'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const monthsToAvg = ['Apr 1, 2026', 'May 1, 2026', 'Jun 1, 2026'];

function getAvg(row) {
  let sum = 0;
  let count = 0;
  for (const m of monthsToAvg) {
    if (row[m] !== undefined && !isNaN(parseInt(row[m]))) {
      sum += parseInt(row[m]);
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

async function run() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  const email = await question('Enter your Avesdo Admin Email: ');
  const password = await question('Enter your Password: ');
  rl.close();

  try {
    const auth = getAuth(app);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Successfully authenticated as ' + email);
  } catch (err) {
    console.error('Authentication failed:', err.message);
    process.exit(1);
  }

  console.log('Loading Firestore data...');
  const [projectsSnap, clientsSnap, aliasesSnap] = await Promise.all([
    getDocs(collection(db, 'projects')),
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'aliases'))
  ]);

  const projects = [];
  projectsSnap.forEach(d => projects.push({ docId: d.id, ...d.data() }));

  const clients = [];
  clientsSnap.forEach(d => clients.push({ docId: d.id, ...d.data() }));

  const aliases = [];
  aliasesSnap.forEach(d => aliases.push({ docId: d.id, ...d.data() }));

  console.log(`Loaded ${projects.length} projects, ${clients.length} clients, and ${aliases.length} aliases.`);

  let updateCount = 0;
  const batch = writeBatch(db);
  let aliasesAdded = 0;

  // 1. Process Userpilot Data
  console.log('--- Processing Userpilot Data ---');
  if (fs.existsSync(path.join(__dirname, '..', 'Userpilot_Sessions Started.csv')) && fs.existsSync(path.join(__dirname, '..', 'Userpilot_Page Views.csv'))) {
    const wbSessions = xlsx.readFile(path.join(__dirname, '..', 'Userpilot_Sessions Started.csv'));
    const sessionsData = xlsx.utils.sheet_to_json(wbSessions.Sheets[wbSessions.SheetNames[0]]);

    const wbViews = xlsx.readFile(path.join(__dirname, '..', 'Userpilot_Page Views.csv'));
    const viewsData = xlsx.utils.sheet_to_json(wbViews.Sheets[wbViews.SheetNames[0]]);

    const uniqueIDs = new Set([...sessionsData.map(r => String(r.ID)), ...viewsData.map(r => String(r.ID))].filter(id => id && id !== 'undefined' && id !== 'null_prod'));

    for (const id of uniqueIDs) {
      // Find matching project
      let targetProject = projects.find(p => p.developmentId && p.developmentId + '_prod' === id);
      if (!targetProject) {
        const aliasMatch = aliases.find(a => a.rawName === id && a.status === 'resolved' && a.type === 'project');
        if (aliasMatch) {
          targetProject = projects.find(p => p.id === aliasMatch.targetId);
        }
      }

      if (targetProject) {
        // Calculate scores
        const projSessions = sessionsData.filter(r => String(r.ID) === id && r.Email);
        let activeUsersCount = 0;
        let totalSessionsOfActiveUsers = 0;

        for (const r of projSessions) {
          const avgSessions = getAvg(r);
          if (avgSessions > 0) {
            activeUsersCount++;
            totalSessionsOfActiveUsers += avgSessions;
          }
        }
        const avgSessionsPerUser = activeUsersCount > 0 ? totalSessionsOfActiveUsers / activeUsersCount : 0;

        let userVolScore = 0;
        if (activeUsersCount >= 5) userVolScore += 50;
        else if (activeUsersCount >= 3) userVolScore += 35;
        else if (activeUsersCount >= 1) userVolScore += 15;

        if (avgSessionsPerUser >= 10) userVolScore += 50;
        else if (avgSessionsPerUser >= 4) userVolScore += 35;
        else if (avgSessionsPerUser >= 1) userVolScore += 15;

        const projViews = viewsData.filter(r => String(r.ID) === id && r['Tagged Page'] && r['Tagged Page'] !== 'Untagged Pages');
        let distinctFeatures = 0;
        let totalPageViews = 0;

        for (const r of projViews) {
          const avgViews = getAvg(r);
          if (avgViews > 0) {
            distinctFeatures++;
            totalPageViews += avgViews;
          }
        }
        const untaggedViewsRow = viewsData.find(r => String(r.ID) === id && r['Tagged Page'] === 'Untagged Pages');
        if (untaggedViewsRow) {
          totalPageViews += getAvg(untaggedViewsRow);
        }

        let opActivityScore = 0;
        if (distinctFeatures >= 4) opActivityScore += 50;
        else if (distinctFeatures >= 2) opActivityScore += 35;
        else if (distinctFeatures >= 1) opActivityScore += 15;

        if (totalPageViews >= 500) opActivityScore += 50;
        else if (totalPageViews >= 150) opActivityScore += 35;
        else if (totalPageViews >= 1) opActivityScore += 15;

        if (targetProject.userVol !== userVolScore || targetProject.opActivity !== opActivityScore) {
          await updateDoc(doc(db, 'projects', targetProject.docId), {
            userVol: userVolScore,
            opActivity: opActivityScore
          });
          updateCount++;
          console.log(`Updated Project '${targetProject.name}' (Userpilot): Active Users=${userVolScore}, Platform Engagement=${opActivityScore}`);
        }
      } else {
        // Create pending alias if it doesn't exist
        const aliasExists = aliases.some(a => a.rawName === id);
        if (!aliasExists) {
          const newAliasRef = doc(collection(db, 'aliases'));
          batch.set(newAliasRef, {
            type: 'project',
            rawName: id,
            targetId: '',
            status: 'pending_approval',
            contextName: 'Userpilot'
          });
          aliases.push({ rawName: id }); // prevent duplicates in same run
          aliasesAdded++;
        }
      }
    }
  } else {
    console.log('Userpilot CSVs not found. Skipping Userpilot ingestion.');
  }

  // 2. Process Satisfaction Report Data
  console.log('--- Processing Satisfaction Report Data ---');
  if (fs.existsSync(path.join(__dirname, '..', 'Satisfaction Report - Customer.csv'))) {
    const content = fs.readFileSync(path.join(__dirname, '..', 'Satisfaction Report - Customer.csv'), 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    for (const row of records) {
      const feedbackReceived = parseInt(row['Feedback Received'], 10) || 0;
      if (feedbackReceived > 0) {
        const rawName = row['Customer Name'] || 'Unknown Customer';
        const happy = parseInt(row['Happy'], 10) || 0;
        const csat = Math.round((happy / feedbackReceived) * 100);

        // Find matching client
        let targetClient = clients.find(c => c.companyName && c.companyName.toLowerCase() === rawName.toLowerCase());
        if (!targetClient) {
          const aliasMatch = aliases.find(a => a.rawName === rawName && a.status === 'resolved' && a.type === 'client');
          if (aliasMatch) {
            targetClient = clients.find(c => c.clientId === aliasMatch.targetId || c.id === aliasMatch.targetId);
          }
        }

        if (targetClient) {
          if (targetClient.clientCsat !== csat) {
            await updateDoc(doc(db, 'clients', targetClient.docId), {
              clientCsat: csat
            });
            updateCount++;
            console.log(`Updated Client '${targetClient.companyName}' (CSAT): CSAT=${csat}%`);
          }
        } else {
          // Create pending alias if it doesn't exist
          const aliasExists = aliases.some(a => a.rawName === rawName);
          if (!aliasExists) {
            const newAliasRef = doc(collection(db, 'aliases'));
            batch.set(newAliasRef, {
              type: 'client',
              rawName: rawName,
              targetId: '',
              status: 'pending_approval',
              contextName: 'Satisfaction Report'
            });
            aliases.push({ rawName: rawName }); // prevent duplicates
            aliasesAdded++;
          }
        }
      }
    }
  } else {
    console.log('Satisfaction Report CSV not found. Skipping Satisfaction Report ingestion.');
  }

  if (aliasesAdded > 0) {
    await batch.commit();
    console.log(`Pushed ${aliasesAdded} new unrecognized entries to Data Intake pipeline.`);
  }

  console.log(`Compiler finished. ${updateCount} entities updated, ${aliasesAdded} aliases pushed to Data Intake.`);
  process.exit(0);
}

run().catch(console.error);
