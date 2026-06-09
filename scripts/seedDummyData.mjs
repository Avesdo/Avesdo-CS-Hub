import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Parse service account key path from command line arguments or use default
const serviceAccountPath = process.argv[2] || './serviceAccountKey.json';

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK. Please ensure you have a valid serviceAccountKey.json file at the root or pass the path as an argument.');
  console.error('Usage: node scripts/seedDummyData.cjs [path/to/serviceAccountKey.json]');
  process.exit(1);
}

const db = getFirestore();

const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomScore = () => Math.floor(Math.random() * 10) + 1;
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min, max) => Math.floor(Math.random() * (max - min) + min) * 100;

async function seedData() {
  console.log('Seeding dummy data...');
  
  // Create 10 Clients
  const clientTypes = ['Enterprise', 'SMB', 'Startup', 'Agency'];
  const clientNames = ['Acme Corp', 'TechFlow', 'GlobalSys', 'InnoVate', 'Quantum', 'Nebula', 'Zenith', 'Apex', 'Pinnacle', 'Summit'];
  
  const clients = [];
  for (let i = 0; i < 10; i++) {
    const client = {
      companyName: clientNames[i] || `Client ${i + 1}`,
      clientType: pickRandom(clientTypes),
      healthScore: randomScore().toString(),
      accountManager: pickRandom(['Alice', 'Bob', 'Charlie']),
      notes: 'Auto-generated test client',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    };
    const docRef = await db.collection('clients').add(client);
    clients.push({ id: docRef.id, ...client });
  }
  console.log(`Created ${clients.length} clients.`);

  // Create 20 Projects
  const projectPhases = ['Kickoff', 'Implementation', 'Testing', 'Go-Live'];
  const projectStatuses = ['On Track', 'At Risk', 'Delayed'];
  
  const projects = [];
  for (let i = 0; i < 20; i++) {
    const client = pickRandom(clients);
    const project = {
      name: `Project ${String.fromCharCode(65 + i)}`,
      clientIds: [client.id],
      healthScore: randomScore().toString(),
      status: pickRandom(projectStatuses),
      onboardingPhase: pickRandom(projectPhases),
      manager: pickRandom(['Alice', 'Bob', 'Charlie']),
      units: Math.floor(Math.random() * 100) + 10,
      releaseDate: randomDate(new Date(), new Date(2027, 0, 1)).getTime(),
      features: ['Feature 1', 'Feature 2'],
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    };
    const docRef = await db.collection('projects').add(project);
    projects.push({ id: docRef.id, ...project });
  }
  console.log(`Created ${projects.length} projects.`);

  // Create 30 Services
  const serviceTypes = ['Consulting', 'Implementation', 'Training', 'Support'];
  const serviceOutcomes = ['Success', 'Pending', 'Failed'];
  const serviceStatuses = ['Active', 'Completed', 'Cancelled'];

  const services = [];
  for (let i = 0; i < 30; i++) {
    const project = pickRandom(projects);
    const service = {
      name: `Service ${i + 1}`,
      projectId: project.id,
      clientIds: project.clientIds,
      type: pickRandom(serviceTypes),
      outcome: pickRandom(serviceOutcomes),
      status: pickRandom(serviceStatuses),
      manager: pickRandom(['Alice', 'Bob', 'Charlie']),
      price: randomPrice(10, 100),
      date: randomDate(new Date(2025, 0, 1), new Date()).getTime(),
      invoiceSent: Math.random() > 0.5,
      invoicePaid: Math.random() > 0.7,
      commissionPaid: Math.random() > 0.8,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    };
    const docRef = await db.collection('services').add(service);
    services.push({ id: docRef.id, ...service });
  }
  console.log(`Created ${services.length} services.`);

  // Settings
  const defaultSettings = {
    settingsData: [],
    clientTypes: ['Enterprise', 'SMB', 'Startup', 'Agency'],
    projectStatuses: ['On Track', 'At Risk', 'Delayed'],
    projectPhases: ['Kickoff', 'Implementation', 'Testing', 'Go-Live'],
    serviceTypes: ['Consulting', 'Implementation', 'Training', 'Support'],
    serviceOutcomes: ['Success', 'Pending', 'Failed'],
    serviceStatuses: ['Active', 'Completed', 'Cancelled'],
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    archivedData: {}
  };
  
  await db.collection('settings').doc('global').set(defaultSettings);
  console.log('Created default settings.');

  console.log('Seed completed successfully!');
  process.exit(0);
}

seedData().catch(console.error);
