/**
 * AVESDO CS HUB - GEMINI AI DATA COMPILER & FIRESTORE MIGRATOR
 * 
 * Instructions:
 * 1. Open your Google Drive and create a folder named "Avesdo Messy Reports". Note down its Folder ID.
 * 2. In your Google Apps Script Editor:
 *    - Create a new script file and paste this code.
 *    - Update the PROJECT_ID and FOLDER_ID constants below.
 *    - Get a Gemini API Key from Google AI Studio (free tier) and add it as a Script Property: 'GEMINI_API_KEY'.
 *    - Update your appsscript.json to include the Firestore OAuth Scope: "https://www.googleapis.com/auth/datastore"
 */

const PROJECT_ID = "avesdo-cs-hub"; // Your Firebase Project ID
const FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID"; // Drive Folder ID containing raw report sheets
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

/**
 * MIGRATION FUNCTION: Run this once to copy all existing Google Sheet data to Firestore!
 */
function migrateSheetsToFirestore() {
  Logger.log("Initializing data fetch from Google Sheets...");
  
  // Call the existing Apps Script function that formats the sheets into clean JSON payloads
  const state = getInitialAppState();
  
  Logger.log("Uploading user profile info...");
  const user = getUserInfo();
  writeToFirestore("settings", "user_profile", user);
  
  Logger.log("Uploading settings to Firestore...");
  writeToFirestore("settings", "global_config", state.settings);

  Logger.log(`Uploading ${state.clients.length} clients to Firestore...`);
  state.clients.forEach(c => {
    writeToFirestore("clients", c.clientId, c);
  });

  Logger.log(`Uploading ${state.projects.length} projects to Firestore...`);
  state.projects.forEach(p => {
    writeToFirestore("projects", p.id, p);
  });

  Logger.log(`Uploading ${state.services.length} services to Firestore...`);
  state.services.forEach(s => {
    writeToFirestore("services", s.id, s);
  });

  Logger.log("Uploading health history log to Firestore...");
  try {
    const historyMap = getAllHealthHistory();
    writeToFirestore("settings", "health_history", { historyMap: historyMap });
    Logger.log("Health history migrated successfully.");
  } catch (e) {
    Logger.log("Error migrating health history: " + e.toString());
  }

  Logger.log("Migration complete! All Google Sheet records are now synced to Cloud Firestore.");
}

/**
 * Main function: run this to compile messy files in Drive and upload to Firestore
 */
function compileAndIngestReports() {
  if (!GEMINI_API_KEY) {
    throw new Error("Please add your 'GEMINI_API_KEY' to Script Properties in Settings > Script Properties.");
  }

  Logger.log("Scanning Drive folder for messy reports...");
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  
  // 1. Fetch current master clients from Firestore to use for matching
  const masterClients = fetchMasterClientsFromFirestore();
  Logger.log(`Found ${masterClients.length} existing master clients in Firestore.`);

  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      Logger.log(`Processing file: ${file.getName()}`);
      processSingleReport(file, masterClients);
      
      // Move file to a "Processed" subdirectory to avoid re-running it
      archiveFile(file, folder);
    }
  }
  Logger.log("Finished compilation and ingestion run.");
}

/**
 * Processes a single sheet, alignments client names with Gemini, and saves to Firestore
 */
function processSingleReport(file, masterClients) {
  const spreadsheet = SpreadsheetApp.open(file);
  const sheet = spreadsheet.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) return; // Empty sheet
  
  // Assume Row 0 is headers: Client Name, Project Name, Status, Units, etc.
  const headers = rows[0].map(h => h.toString().trim());
  const clientNameIdx = headers.findIndex(h => h.toLowerCase().includes("client") || h.toLowerCase().includes("company"));
  const projectNameIdx = headers.findIndex(h => h.toLowerCase().includes("project"));
  
  if (clientNameIdx === -1) {
    Logger.log(`Skipping sheet ${file.getName()} - No client name column found.`);
    return;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawClientName = row[clientNameIdx];
    const rawProjectName = projectNameIdx !== -1 ? row[projectNameIdx] : "";
    if (!rawClientName) continue;

    Logger.log(`Aligning client name: "${rawClientName}"`);
    
    // 2. Ask Gemini to match raw name to our master list or recommend a new client ID
    const matchResult = alignClientNameWithGemini(rawClientName, masterClients);
    
    let clientId = "";
    if (matchResult.matchFound && matchResult.matchedClientId) {
      clientId = matchResult.matchedClientId;
      Logger.log(`Gemini matched "${rawClientName}" to master ID: ${clientId} (${matchResult.matchedClientName})`);
    } else {
      // Create new client in master list and Firestore
      clientId = "C-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      const newClient = {
        clientId: clientId,
        companyName: matchResult.suggestedCleanName || rawClientName,
        clientType: "Developer",
        accountManager: "Unassigned",
        healthScore: "N/A",
        activeProjectCount: 0,
        notes: []
      };
      
      Logger.log(`Gemini suggests new Client Profile: "${newClient.companyName}" (ID: ${clientId})`);
      writeToFirestore("clients", clientId, newClient);
      
      // Update our local master copy list for subsequent rows in this loop
      masterClients.push({ clientId: clientId, companyName: newClient.companyName });
    }

    // 3. Write project details if present
    if (rawProjectName) {
      const projectId = "P-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      const newProject = {
        id: projectId,
        name: rawProjectName,
        clientIds: [clientId],
        clients: [matchResult.matchedClientName || matchResult.suggestedCleanName || rawClientName],
        assignee: "Unassigned",
        projectStatus: "Onboarding",
        timelineStatus: "Not Started",
        onboardingPhase: "Not Started",
        releaseDate: "",
        units: 0,
        score: "N/A",
        notes: []
      };
      writeToFirestore("projects", projectId, newProject);
    }
  }
}

/**
 * Calls the Gemini API to align messy names using AI classification
 */
function alignClientNameWithGemini(rawName, masterList) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = {
    contents: [{
      parts: [{
        text: `Analyze this raw client/organization name: "${rawName}"
        
        Compare it against this list of verified master clients (format: ID - Name):
        ${JSON.stringify(masterList)}
        
        Determine if this raw name refers to one of our existing master clients (even with typos, abbreviations, suffixes like Inc, Corp, Co, or alternative spellings).
        
        Return a JSON response object with exactly this schema:
        {
          "matchFound": true/false,
          "matchedClientId": "ID of match or empty string",
          "matchedClientName": "Name of match or empty string",
          "suggestedCleanName": "A clean standardized company name to create if no match found (remove junk, standardize casing)"
        }
        
        Respond only in raw JSON. No markdown formatting, no backticks.`
      }]
    }]
  };

  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(prompt),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const resultText = response.getContentText();
  
  try {
    const json = JSON.parse(resultText);
    const textOutput = json.candidates[0].content.parts[0].text.trim();
    return JSON.parse(textOutput);
  } catch (e) {
    Logger.log("Failed parsing Gemini response: " + resultText);
    return { matchFound: false, matchedClientId: "", matchedClientName: "", suggestedCleanName: rawName };
  }
}

/**
 * Firestore Helper: Fetches master clients list from Firestore REST API
 */
function fetchMasterClientsFromFirestore() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/clients`;
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
    Logger.log("Firestore client collection is empty or uninitialized.");
    return [];
  }
  
  const data = JSON.parse(response.getContentText());
  if (!data.documents) return [];
  
  return data.documents.map(doc => {
    // Map Firestore document format back to simple key-value for Gemini
    const fields = doc.fields;
    return {
      clientId: fields.clientId ? fields.clientId.stringValue : "",
      companyName: fields.companyName ? fields.companyName.stringValue : ""
    };
  });
}

/**
 * Firestore Helper: Writes documents to Firestore using the REST API
 */
/**
 * Recursive helper to serialize any JavaScript type to the expected Firestore REST value structure
 */
function toFirestoreValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (let k in val) {
      if (val[k] !== undefined && val[k] !== null) {
        fields[k] = toFirestoreValue(val[k]);
      }
    }
    return { mapValue: { fields: fields } };
  }
  if (typeof val === 'number') {
    return { doubleValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  return { stringValue: String(val) };
}

/**
 * Firestore Helper: Writes documents to Firestore using the REST API
 */
function writeToFirestore(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  
  const fields = {};
  for (let key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      fields[key] = toFirestoreValue(data[key]);
    }
  }

  const payload = { fields: fields };
  const options = {
    method: "PATCH",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log(`Failed writing to Firestore: ${response.getContentText()}`);
  }
}

/**
 * File Helper: Archives processed reports to prevent duplicate runs
 */
function archiveFile(file, sourceFolder) {
  let archiveFolder;
  try {
    archiveFolder = sourceFolder.getFoldersByName("Processed").next();
  } catch (e) {
    archiveFolder = sourceFolder.createFolder("Processed");
  }
  file.moveTo(archiveFolder);
}
