/**
 * AVESDO CS HUB - GEMINI AI DATA COMPILER & FIRESTORE MIGRATOR
 */

const PROJECT_ID = "avesdo-cs-hub"; 
const FOLDER_ID = "1b6QtozrK6pl9rjBLuMAjW_yj31E_OG1-"; 
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const MAX_EXECUTION_TIME_MS = 4.5 * 60 * 1000; 

function compileAndIngestReports() {
  if (!GEMINI_API_KEY) {
    throw new Error("Please add your 'GEMINI_API_KEY' to Script Properties.");
  }

  const startTime = Date.now();
  const props = PropertiesService.getScriptProperties();
  const resumeFileId = props.getProperty('RESUME_FILE_ID');
  let resumeRowIndex = parseInt(props.getProperty('RESUME_ROW_INDEX'), 10) || 1;

  Logger.log("Waking up. Fetching master databases from Firestore...");
  
  const masterClients = fetchCollectionFromFirestore("clients");
  const masterProjects = fetchCollectionFromFirestore("projects");
  const masterServices = fetchCollectionFromFirestore("services");
  const aliasMappings = fetchCollectionFromFirestore("aliases");
  
  const dict = { client: {}, project: {}, service: {} };
  
  aliasMappings.forEach(alias => {
    // Both 'verified' and 'pending_approval' aliases are stored in memory to prevent duplicate requests to Gemini in the same run.
    if (alias.type && alias.rawName && alias.targetId) {
      if (dict[alias.type]) {
        dict[alias.type][alias.rawName.toLowerCase()] = { id: alias.targetId, status: alias.status };
      }
    }
  });

  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  let timeLimitReached = false;

  while (files.hasNext()) {
    const file = files.next();
    
    if (resumeFileId && file.getId() !== resumeFileId) {
      continue;
    }
    
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS || file.getMimeType() === MimeType.CSV) {
      const fileName = file.getName().toLowerCase();
      Logger.log(`Processing file: ${file.getName()}`);
      
      const spreadsheet = SpreadsheetApp.open(file);
      const sheet = spreadsheet.getSheets()[0];
      const rows = sheet.getDataRange().getValues();
      
      if (rows.length <= 1) {
        archiveFile(file, folder);
        props.deleteProperty('RESUME_FILE_ID');
        props.deleteProperty('RESUME_ROW_INDEX');
        resumeRowIndex = 1;
        continue;
      }
      
      const headers = rows[0].map(h => h.toString().trim().toLowerCase());
      
      // Routing Logic Based on Filename
      let reportType = 'general';
      if (fileName.includes('activity')) reportType = 'activity';
      else if (fileName.includes('support')) reportType = 'support';
      else if (fileName.includes('financial')) reportType = 'financial';

      for (let i = resumeRowIndex; i < rows.length; i++) {
        if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) {
          Logger.log(`Approaching time limit. Saving state at row ${i} to resume later.`);
          props.setProperty('RESUME_FILE_ID', file.getId());
          props.setProperty('RESUME_ROW_INDEX', i.toString());
          ScriptApp.newTrigger("compileAndIngestReports").timeBased().after(1 * 60 * 1000).create();
          timeLimitReached = true;
          break;
        }

        const row = rows[i];
        
        // Execute specialized parsing
        if (reportType === 'activity') {
            processActivityRow(row, headers, dict, masterClients, masterProjects, masterServices);
        } else if (reportType === 'support') {
            processSupportRow(row, headers, dict, masterClients, masterProjects, masterServices);
        } else if (reportType === 'financial') {
            processFinancialRow(row, headers, dict, masterClients, masterProjects, masterServices);
        } else {
            processGeneralRow(row, headers, dict, masterClients, masterProjects, masterServices);
        }
      }
      
      if (timeLimitReached) break;
      
      archiveFile(file, folder);
      props.deleteProperty('RESUME_FILE_ID');
      props.deleteProperty('RESUME_ROW_INDEX');
      resumeRowIndex = 1;
    }
  }

  if (!timeLimitReached) {
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === "compileAndIngestReports") {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
  }
}

function processActivityRow(row, headers, dict, masterClients, masterProjects, masterServices) {
    const clientIdx = headers.findIndex(h => h.includes("client") || h.includes("company"));
    const projectIdx = headers.findIndex(h => h.includes("project"));
    
    // Placeholder index mapping for raw math fields.
    const rawActivityAIdx = headers.findIndex(h => h.includes("login count") || h.includes("logins"));
    const rawActivityBIdx = headers.findIndex(h => h.includes("actions taken") || h.includes("actions"));
    const rawUserVolIdx = headers.findIndex(h => h.includes("active users") || h.includes("seats"));
    
    if (clientIdx === -1 || projectIdx === -1) return;

    const rawClient = row[clientIdx].toString().trim();
    const rawProject = row[projectIdx].toString().trim();
    
    if (!rawClient || !rawProject) return;

    const alignment = getOrCreateAlignment(rawClient, rawProject, "", dict, masterClients, masterProjects, masterServices);
    
    // Mathematical formula placeholder:
    let opScore = 0;
    if (rawActivityAIdx !== -1 && rawActivityBIdx !== -1) {
        opScore = Math.min(((Number(row[rawActivityAIdx]) || 0) + (Number(row[rawActivityBIdx]) || 0)) / 2, 100);
    }
    
    let userScore = 0;
    if (rawUserVolIdx !== -1) {
        userScore = Math.min((Number(row[rawUserVolIdx]) || 0) * 10, 100); 
    }

    if (alignment.isPending) {
        stageData("activity", alignment, row, headers, { opScore, userScore });
        return;
    }

    if (alignment.projectId) {
        writeToFirestore("projects", alignment.projectId, { score_op: opScore, score_usr: userScore });
        Logger.log(`Updated Activity for Project ${alignment.projectId} - Op: ${opScore}, Usr: ${userScore}`);
    }
}

function processSupportRow(row, headers, dict, masterClients, masterProjects, masterServices) {
    const companyIdx = headers.findIndex(h => h.includes("company") || h.includes("client"));
    const emailIdx = headers.findIndex(h => h.includes("email"));
    const csatIdx = headers.findIndex(h => h.includes("csat") || h.includes("satisfaction"));

    let rawClient = "";
    if (companyIdx !== -1) rawClient = row[companyIdx].toString().trim();
    else if (emailIdx !== -1) {
        const email = row[emailIdx].toString().trim();
        rawClient = email.split('@')[1] || ""; // Fallback to domain mapping
    }

    if (!rawClient || csatIdx === -1) return;

    const alignment = getOrCreateAlignment(rawClient, "", "", dict, masterClients, masterProjects, masterServices);
    const csatVal = row[csatIdx].toString().trim();

    if (alignment.isPending) {
        stageData("support", alignment, row, headers, { csatVal });
        return;
    }

    if (alignment.clientId) {
        // We write the raw response. `Backend_Scoring.js` and React will average it later.
        const client = masterClients.find(c => c.clientId === alignment.clientId);
        if (client) {
            const currentResponses = client.csatResponses || [];
            currentResponses.push({ date: new Date().getTime(), response: csatVal });
            writeToFirestore("clients", alignment.clientId, { csatResponses: currentResponses });
            Logger.log(`Added Support CSAT to Client ${alignment.clientId}: ${csatVal}`);
        }
    }
}

function processFinancialRow(row, headers, dict, masterClients, masterProjects, masterServices) {
    const clientIdx = headers.findIndex(h => h.includes("client") || h.includes("company"));
    const statusIdx = headers.findIndex(h => h.includes("status") || h.includes("invoice"));

    if (clientIdx === -1 || statusIdx === -1) return;

    const rawClient = row[clientIdx].toString().trim();
    if (!rawClient) return;
    
    const statusVal = row[statusIdx].toString().trim();

    const alignment = getOrCreateAlignment(rawClient, "", "", dict, masterClients, masterProjects, masterServices);
    
    if (alignment.isPending) {
        stageData("financial", alignment, row, headers, { invoiceStatus: statusVal });
        return;
    }

    if (alignment.clientId) {
        writeToFirestore("clients", alignment.clientId, { invoiceStatus: statusVal });
        Logger.log(`Updated Financial Status for Client ${alignment.clientId}: ${statusVal}`);
    }
}

function processGeneralRow(row, headers, dict, masterClients, masterProjects, masterServices) {
    const clientIdx = headers.findIndex(h => h.includes("client") || h.includes("company"));
    const projectIdx = headers.findIndex(h => h.includes("project"));
    const serviceIdx = headers.findIndex(h => h.includes("service"));

    if (clientIdx === -1) return;

    const rawClient = row[clientIdx] ? row[clientIdx].toString().trim() : "";
    const rawProject = projectIdx !== -1 && row[projectIdx] ? row[projectIdx].toString().trim() : "";
    const rawService = serviceIdx !== -1 && row[serviceIdx] ? row[serviceIdx].toString().trim() : "";

    if (!rawClient) return;

    const alignment = getOrCreateAlignment(rawClient, rawProject, rawService, dict, masterClients, masterProjects, masterServices);
    
    if (alignment.isPending) {
        stageData("general", alignment, row, headers, {});
    }
}

function getOrCreateAlignment(rawClient, rawProject, rawService, dict, masterClients, masterProjects, masterServices) {
  let clientNode = dict.client[rawClient.toLowerCase()];
  let projectNode = rawProject ? dict.project[rawProject.toLowerCase()] : null;
  let serviceNode = rawService ? dict.service[rawService.toLowerCase()] : null;

  let clientId = clientNode ? clientNode.id : null;
  let projectId = projectNode ? projectNode.id : null;
  let serviceId = serviceNode ? serviceNode.id : null;

  const isPending = (clientNode && clientNode.status === 'pending_approval') || 
                    (projectNode && projectNode.status === 'pending_approval') || 
                    (serviceNode && serviceNode.status === 'pending_approval');

  const needsAlignment = [];
  if (!clientNode && rawClient) needsAlignment.push({ type: "client", rawName: rawClient });
  if (rawProject && !projectNode) needsAlignment.push({ type: "project", rawName: rawProject });
  if (rawService && !serviceNode) needsAlignment.push({ type: "service", rawName: rawService });

  if (needsAlignment.length > 0) {
    Logger.log(`Asking Gemini to align: ${needsAlignment.map(n => n.rawName).join(", ")}`);
    const alignmentResult = alignEntitiesWithGemini(needsAlignment, masterClients, masterProjects, masterServices);
    
    if (!clientNode && alignmentResult.client) {
      clientId = alignmentResult.client.id || "C-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      saveAlias("client", rawClient, clientId, dict, true); // Save as pending
    }
    
    if (rawProject && !projectNode && alignmentResult.project) {
      projectId = alignmentResult.project.id || "P-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      saveAlias("project", rawProject, projectId, dict, true);
    }
    
    if (rawService && !serviceNode && alignmentResult.service) {
      serviceId = alignmentResult.service.id || "S-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
      saveAlias("service", rawService, serviceId, dict, true);
    }
    
    return { clientId, projectId, serviceId, isPending: true };
  }

  return { clientId, projectId, serviceId, isPending };
}

function stageData(type, alignment, row, headers, calculatedData) {
    const stageId = "STG-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
    const payload = {
        id: stageId,
        type: type,
        alignment: alignment,
        calculatedData: calculatedData,
        timestamp: new Date().getTime(),
        rowData: headers.reduce((acc, h, i) => { acc[h] = row[i]; return acc; }, {})
    };
    writeToFirestore("staged_imports", stageId, payload);
    Logger.log(`Staged data row pending alias approval (Stage ID: ${stageId})`);
}

function saveAlias(type, rawName, targetId, dict, isPending) {
  const status = isPending ? "pending_approval" : "verified";
  dict[type][rawName.toLowerCase()] = { id: targetId, status: status };
  
  const aliasId = "A-" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000);
  writeToFirestore("aliases", aliasId, {
    type: type,
    rawName: rawName,
    targetId: targetId,
    status: status
  });
  Logger.log(`Saved Alias: [${type}] "${rawName}" -> ${targetId} (${status})`);
}

function alignEntitiesWithGemini(needsAlignment, masterClients, masterProjects, masterServices) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const clientList = masterClients.map(c => `${c.clientId} - ${c.companyName}`).join("\n");
  const projectList = masterProjects.map(p => `${p.id} - ${p.name}`).join("\n");
  const serviceList = masterServices.map(s => `${s.id} - ${s.name}`).join("\n");

  const entitiesStr = JSON.stringify(needsAlignment);

  const prompt = {
    contents: [{
      parts: [{
        text: `You are an AI data aligner. Your job is to take raw, messy strings and map them to standard IDs.
        
Here are the entities we need to align:
${entitiesStr}

Here is the master list of Clients:
${clientList}

Here is the master list of Projects:
${projectList}

Here is the master list of Services:
${serviceList}

Analyze the raw names. Determine if they refer to an existing master record.
If a match exists, provide its ID. If it does not exist, provide an empty string for the ID.

Return ONLY a JSON response object with exactly this schema:
{
  "client": { "id": "matched ID or empty string" },
  "project": { "id": "matched ID or empty string" },
  "service": { "id": "matched ID or empty string" }
}
Do not return any markdown tags or backticks, just raw JSON.`
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
    let textOutput = json.candidates[0].content.parts[0].text.trim();
    textOutput = textOutput.replace(/^```json/g, "").replace(/```$/g, "").trim();
    return JSON.parse(textOutput);
  } catch (e) {
    Logger.log("Failed parsing Gemini response: " + resultText);
    return {};
  }
}

/**
 * Firestore Helpers
 */
function fetchCollectionFromFirestore(collection) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=1000`;
  const options = { method: "GET", headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken(), "Accept": "application/json" }, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) return [];
  const data = JSON.parse(response.getContentText());
  if (!data.documents) return [];
  return data.documents.map(doc => parseFirestoreDoc(doc.fields));
}

function parseFirestoreDoc(fields) {
  const result = {};
  for (let k in fields) {
    const valObj = fields[k];
    if (valObj.stringValue !== undefined) result[k] = valObj.stringValue;
    else if (valObj.integerValue !== undefined) result[k] = parseInt(valObj.integerValue, 10);
    else if (valObj.doubleValue !== undefined) result[k] = parseFloat(valObj.doubleValue);
    else if (valObj.booleanValue !== undefined) result[k] = valObj.booleanValue;
    else if (valObj.arrayValue !== undefined) result[k] = valObj.arrayValue.values ? valObj.arrayValue.values.map(v => v.stringValue || v.integerValue) : [];
    else result[k] = null;
  }
  return result;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (let k in val) if (val[k] !== undefined && val[k] !== null) fields[k] = toFirestoreValue(val[k]);
    return { mapValue: { fields: fields } };
  }
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  return { stringValue: String(val) };
}

function writeToFirestore(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}`;
  const fields = {};
  for (let key in data) if (data[key] !== undefined && data[key] !== null) fields[key] = toFirestoreValue(data[key]);
  const payload = { fields: fields };
  const options = { method: "PATCH", contentType: "application/json", headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() }, payload: JSON.stringify(payload), muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) Logger.log(`Failed writing to Firestore: ${response.getContentText()}`);
}

function archiveFile(file, sourceFolder) {
  let archiveFolder;
  const folders = sourceFolder.getFoldersByName("Processed");
  if (folders.hasNext()) archiveFolder = folders.next();
  else archiveFolder = sourceFolder.createFolder("Processed");
  file.moveTo(archiveFolder);
}
