import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "avesdo-cs-hub",
  databaseURL: "https://avesdo-cs-hub.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const settingsRef = doc(db, 'settings', 'global_config');
  const snap = await getDoc(settingsRef);
  const settings = snap.exists() ? snap.data() : {};

  // 1. Rebuild Features & Regions
  const projectsSnap = await getDocs(collection(db, 'projects'));
  const features = new Set(settings.features || []);
  const regions = new Set(settings.regions || []);
  
  const deliverablesKeys = new Set();
  const surveyKeys = new Set();
  const qaKeys = new Set();
  const certKeys = new Set();
  
  projectsSnap.forEach(doc => {
    const p = doc.data();
    if (p.features) p.features.forEach(f => features.add(f));
    if (p.region) regions.add(p.region);
    
    if (p.deliverables) {
      Object.keys(p.deliverables).forEach(k => {
        if (k !== 'status' && k !== 'submittedAt' && k !== 'updatedAt') deliverablesKeys.add(k);
      });
    }
    if (p.onboarding && p.onboarding.survey) {
      Object.keys(p.onboarding.survey).forEach(k => {
        if (k !== 'status' && k !== 'submittedAt' && k !== 'updatedAt') surveyKeys.add(k);
      });
    }
    if (p.onboarding && p.onboarding.clientQA) {
      Object.keys(p.onboarding.clientQA).forEach(k => {
        if (k !== 'status' && k !== 'submittedAt' && k !== 'updatedAt') qaKeys.add(k);
      });
    }
    if (p.onboarding && p.onboarding.certification) {
      Object.keys(p.onboarding.certification).forEach(k => {
        if (k !== 'status' && k !== 'submittedAt' && k !== 'updatedAt') certKeys.add(k);
      });
    }
  });

  const templates = settings.templates || {};
  
  if (!templates.deliverables || !templates.deliverables.sections || templates.deliverables.sections.length === 0) {
    console.log('Rebuilding Deliverables Template from', deliverablesKeys.size, 'keys');
    templates.deliverables = {
      id: 'deliverables',
      name: 'Deliverables Checklist',
      type: 'checklist',
      fields: [],
      sections: [{
        id: 'recovered_section',
        title: 'Recovered Items',
        dependsOnFeature: null,
        items: Array.from(deliverablesKeys).map(k => ({
          id: k,
          taskName: k,
          required: false,
          dependsOnFeature: null
        }))
      }]
    };
  }

  if (templates.survey) {
    delete templates.survey;
  }

  if (!templates.onboardingSurvey || !templates.onboardingSurvey.fields || templates.onboardingSurvey.fields.length === 0) {
    console.log('Rebuilding Onboarding Survey Template from', surveyKeys.size, 'keys');
    templates.onboardingSurvey = {
      id: 'onboardingSurvey',
      name: 'Onboarding Survey',
      type: 'form',
      sections: [],
      fields: Array.from(surveyKeys).filter(k => !['answers', 'status', 'submittedAt', 'updatedAt', 'score', 'submittedBy'].includes(k)).map(k => ({
        id: k,
        label: k,
        type: 'text',
        required: false,
        dependsOnFeature: null
      }))
    };
  }

  if (!templates.clientQA || !templates.clientQA.fields || templates.clientQA.fields.length === 0) {
    templates.clientQA = {
      id: 'clientQA', name: 'Client QA', type: 'form', sections: [],
      fields: Array.from(qaKeys).map(k => ({ id: k, label: k, type: 'text' }))
    };
  }

  if (!templates.certification || !templates.certification.fields || templates.certification.fields.length === 0) {
    templates.certification = {
      id: 'certification', name: 'Project Certification', type: 'form', sections: [],
      fields: Array.from(certKeys).map(k => ({ id: k, label: k, type: 'text' }))
    };
  }

  settings.features = Array.from(features);
  settings.regions = Array.from(regions);
  settings.templates = templates;

  const servicesSnap = await getDocs(collection(db, 'services'));
  const types = new Set();
  const outcomes = new Set();
  servicesSnap.forEach(doc => {
    const s = doc.data();
    if (s.type) types.add(s.type);
    if (s.outcome) outcomes.add(s.outcome);
  });
  
  if (!settings.serviceTypes || settings.serviceTypes.length === 0) {
    settings.serviceTypes = Array.from(types).map(t => ({ name: t, color: 'blue' }));
  }
  if (!settings.settingsData || settings.settingsData.length === 0) {
    settings.settingsData = Array.from(outcomes).map(o => ({ category: 'ServiceOutcome', name: o, color: 'slate' }));
  }

  await setDoc(settingsRef, settings);
  console.log('Successfully recovered lost settings data by scraping the database!');
  process.exit(0);
}

run().catch(console.error);
