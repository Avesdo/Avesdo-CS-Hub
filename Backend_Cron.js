/**
 * BACKGROUND CRON ENGINE
 * Connects directly to Firestore to run the nightly health history snapshots.
 * No dependencies on Google Sheets.
 */

// Uses PROJECT_ID and toFirestoreValue / writeToFirestore from AppsScriptCompiler.js

/**
 * Setup the trigger to run daily at 11:00 PM
 */
function setupDailySnapshotTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'runDailyHealthSnapshot' || triggers[i].getHandlerFunction() === 'recordHealthSnapshot') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Set to run every day at 23:00 (11:00 PM)
  ScriptApp.newTrigger('runDailyHealthSnapshot')
    .timeBased()
    .atHour(23)
    .everyDays(1)
    .create();
    
  Logger.log("Daily snapshot trigger configured for 11:00 PM.");
}

/**
 * Recursive parser to convert Firestore REST API response fields into standard JS objects.
 */
function parseFirestoreValue(val) {
  if (!val) return null;
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return parseInt(val.integerValue, 10);
  if (val.doubleValue !== undefined) return parseFloat(val.doubleValue);
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.arrayValue !== undefined) {
    if (!val.arrayValue.values) return [];
    return val.arrayValue.values.map(parseFirestoreValue);
  }
  if (val.mapValue !== undefined) {
    if (!val.mapValue.fields) return {};
    const obj = {};
    for (let k in val.mapValue.fields) {
      obj[k] = parseFirestoreValue(val.mapValue.fields[k]);
    }
    return obj;
  }
  // Fallback for timestampValue, referenceValue, etc. if needed later
  return val;
}

function fetchCollectionFromFirestore(collectionId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionId}?pageSize=1000`;
  const options = {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
      "Accept": "application/json"
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log(`Failed fetching ${collectionId}: ${response.getContentText()}`);
    return [];
  }
  
  const data = JSON.parse(response.getContentText());
  if (!data.documents) return [];
  
  return data.documents.map(doc => {
    const obj = {};
    if (doc.fields) {
      for (let key in doc.fields) {
        obj[key] = parseFirestoreValue(doc.fields[key]);
      }
    }
    // Also attach docId for convenience
    const parts = doc.name.split('/');
    obj._docId = parts[parts.length - 1];
    return obj;
  });
}

function fetchDocumentFromFirestore(collectionId, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionId}/${docId}`;
  const options = {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
      "Accept": "application/json"
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log(`Failed fetching ${collectionId}/${docId}: ${response.getContentText()}`);
    return null;
  }
  
  const doc = JSON.parse(response.getContentText());
  if (!doc.fields) return {};
  
  const obj = {};
  for (let key in doc.fields) {
    obj[key] = parseFirestoreValue(doc.fields[key]);
  }
  return obj;
}

/**
 * Main cron function. Runs daily.
 */
function runDailyHealthSnapshot() {
  Logger.log("Starting daily health snapshot...");
  
  // 1. Fetch current live data from Firestore
  const clients = fetchCollectionFromFirestore("clients");
  const projects = fetchCollectionFromFirestore("projects");
  const globalConfig = fetchDocumentFromFirestore("settings", "global_config");
  let healthHistoryDoc = fetchDocumentFromFirestore("settings", "health_history");
  
  if (!globalConfig) {
    Logger.log("Critical Error: Could not fetch settings/global_config. Aborting.");
    return;
  }
  
  let historyMap = {};
  if (healthHistoryDoc && healthHistoryDoc.historyMap) {
    historyMap = healthHistoryDoc.historyMap;
  }
  
  const today = new Date();
  const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone() || "America/New_York", "yyyy-MM-dd");
  const timeVal = today.getTime();
  
  let updatesCount = 0;

  // 2. Score Clients
  clients.forEach(c => {
    const healthResult = calculateClientHealth(c, projects, globalConfig);
    if (healthResult.totalScore !== "N/A") {
      const entityId = c.clientId || c.id;
      if (!historyMap[entityId]) historyMap[entityId] = [];
      historyMap[entityId].push({
        date: dateStr,
        timeVal: timeVal,
        score: healthResult.totalScore
      });
      updatesCount++;
    }
  });

  // 3. Score Projects
  projects.forEach(p => {
    if (p.projectStatus === 'Onboarding' || p.projectStatus === 'Closed') return;
    
    const healthResult = calculateProjectHealth(p, globalConfig);
    if (healthResult.totalScore !== "N/A") {
      const entityId = p.id;
      if (!historyMap[entityId]) historyMap[entityId] = [];
      historyMap[entityId].push({
        date: dateStr,
        timeVal: timeVal,
        score: healthResult.totalScore
      });
      updatesCount++;
    }
  });
  
  // 4. Sort arrays just in case, though they are naturally appended in time order
  for (let key in historyMap) {
    historyMap[key].sort((a, b) => a.timeVal - b.timeVal);
  }

  // 5. Save back to Firestore
  if (updatesCount > 0) {
    Logger.log(`Calculated ${updatesCount} scores. Saving to Firestore...`);
    writeToFirestore("settings", "health_history", { historyMap: historyMap });
    Logger.log("Snapshot successfully saved to settings/health_history.");
  } else {
    Logger.log("No active clients/projects scored. Nothing to save.");
  }
}
