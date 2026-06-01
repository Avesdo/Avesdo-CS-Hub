// ==========================================
// 1. ROUTING & SETUP (UPDATED SYNC)
// ==========================================
function doGet(e) {
  let ui = HtmlService.createTemplateFromFile('Index').evaluate();
  ui.setTitle('Avesdo CS Hub');
  ui.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  ui.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return ui;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// 2. HELPER UTILITIES & GLOBAL TIMESTAMP
// ==========================================
function updateGlobalTimestamp() {
  PropertiesService.getScriptProperties().setProperty('GLOBAL_LAST_UPDATE', new Date().getTime().toString());
}

function checkGlobalTimestamp() {
  return PropertiesService.getScriptProperties().getProperty('GLOBAL_LAST_UPDATE') || "0";
}

function formatDateSafe(dateObj, tzStr) {
  if (!dateObj) return "";
  if (dateObj instanceof Date) {
    if(!isNaN(dateObj.getTime())) {
       return Utilities.formatDate(dateObj, tzStr, "MMM d, yyyy");
    }
  }
  return dateObj.toString();
}

function formatDateForInput(dateObj, tzStr) {
  if (!dateObj) return "";
  if (dateObj instanceof Date) {
    if(!isNaN(dateObj.getTime())) {
       return Utilities.formatDate(dateObj, tzStr, "yyyy-MM-dd");
    }
  }
  return dateObj.toString();
}

function getCleanData(wb, sheetName) {
  const sheet = wb.getSheetByName(sheetName);
  if (!sheet) return [];
  const rawData = sheet.getDataRange().getValues();
  if (rawData.length <= 1) return rawData;
 
  const headers = rawData[0];
  const rows = rawData.slice(1).filter(row => row[0] !== "" && row[0] !== null);
  return [headers, ...rows];
}

function getUserInfo() {
  const uEmail = Session.getActiveUser().getEmail() || "demo@avesdo.com";
  let pts = uEmail.split('@')[0].split(/[.\-_]/);
  let n = pts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  let ini = pts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
  return { name: n, email: uEmail, initials: ini };
}

// ==========================================
// 3. MASTER INITIALIZATION & SETTINGS
// ==========================================
function getInitialAppState() {
  const globalTs = checkGlobalTimestamp();
  const cache = CacheService.getScriptCache();
  const c_clients = getCachedChunked(cache, "CLI_" + globalTs);
  const c_projects = getCachedChunked(cache, "PROJ_" + globalTs);
  const c_services = getCachedChunked(cache, "SERV_" + globalTs);
  const wb = SpreadsheetApp.getActiveSpreadsheet();
 
  let settingsObj = getSettings(wb);

  if (c_clients && c_projects && c_services) {
    try {
      let pClients = JSON.parse(c_clients);
      let pProjects = JSON.parse(c_projects);
     
      // Ensure cached data is scored natively
      calculateBackendScores(pProjects, pClients, settingsObj);
     
      return {
        user: getUserInfo(),
        settings: settingsObj,
        clients: pClients,
        projects: pProjects,
        services: JSON.parse(c_services),
        timestamp: globalTs
      };
    } catch(e) { console.error("Cache parsing error", e); }
  }

  const tzStr = wb.getSpreadsheetTimeZone();
  const mapOfNotes = buildNotesMap(getCleanData(wb, "Notes_Log"), tzStr);
  const healthMaps = buildHealthMap(getCleanData(wb, "Health_Data"));
  const clientsData = buildClientsPayload(getCleanData(wb, "Clients"), mapOfNotes, healthMaps.clientSupportLookup);
  const projectsData = buildProjectsPayload(getCleanData(wb, "Projects"), clientsData.mapOfClients, clientsData.mapOfNamesToIds, healthMaps.mapOfHealth, mapOfNotes, tzStr);
  const servicesPayload = buildServicesPayload(getCleanData(wb, "Services_Log"), clientsData.mapOfClients, projectsData.mapOfProjectIdsToNames, tzStr);
 
  // Score fresh data before caching
  calculateBackendScores(projectsData.payload, clientsData.payload, settingsObj);

  try {
    putCachedChunked(cache, "CLI_" + globalTs, JSON.stringify(clientsData.payload), 21600);
    putCachedChunked(cache, "PROJ_" + globalTs, JSON.stringify(projectsData.payload), 21600);
    putCachedChunked(cache, "SERV_" + globalTs, JSON.stringify(servicesPayload), 21600);
  } catch(e) { console.error("Critical Cache Failure: ", e); }

  return {
      user: getUserInfo(),
      settings: settingsObj,
      clients: clientsData.payload,
      projects: projectsData.payload,
      services: servicesPayload,
      timestamp: globalTs
  };
}

function getSettings(wb) {
  const cache = CacheService.getScriptCache();
  const cachedSettings = cache.get("avesdo_settings_cache");
 
  if (cachedSettings) {
    try {
      return JSON.parse(cachedSettings);
    } catch(e) {}
  }

  const sht = wb.getSheetByName("Settings");
  if (!sht) return getFallbackSettings();
 
  const dArr = sht.getDataRange().getValues();
  let setObj = {
    managers: [], clientTypes: [], serviceTypes: [], features: [], services: [], statuses: [], timelines: [], phases: [],
    settingsData: [], scoring: { weights: {}, clientWeights: {}, thresholds: {} }
  };
 
  for (let r = 1; r < dArr.length; r++) {
    let cat = dArr[r][0] ? dArr[r][0].toString().trim() : "";
    let k = dArr[r][1] ? dArr[r][1].toString().trim() : "";
    let v = dArr[r][2];
    let icon = dArr[r][3];
    if (!cat || !k) continue;
   
    if (cat === 'Manager') setObj.managers.push({name: k, color: v || 'slate', icon: icon || 'user'});
    else if (cat === 'ClientType' || cat === 'Client Type') setObj.clientTypes.push({name: k, color: v || 'slate', icon: icon || 'circle-dashed'});
    else if (cat === 'ServiceType' || cat === 'Service Type') setObj.serviceTypes.push({name: k, color: v || 'slate', icon: icon || 'circle-dashed'});
    else if (cat === 'Feature') setObj.features.push(k);
    else if (cat === 'Service' || cat === 'Services') setObj.services.push({ name: k, price: v });
    else if (cat === 'Status') setObj.statuses.push({ name: k, color: v, icon: icon || 'circle-dashed' });
    else if (cat === 'Timeline') setObj.timelines.push({ name: k, color: v, icon: icon || 'circle-dashed' });
    else if (cat === 'Phase') setObj.phases.push({ name: k, color: v, icon: icon || 'circle-dashed' });
    else if (cat === 'ServiceOutcome' || cat === 'Service Outcome' || cat === 'ServiceStatus' || cat === 'Service Status') setObj.settingsData.push({ category: (cat.replace(' ', '')), name: k, attribute: v, color: v, icon: icon || 'circle-dashed' });
    else if (cat === 'ScoreWeight') setObj.scoring.weights[k] = Number(v);
    else if (cat === 'ClientWeight') setObj.scoring.clientWeights[k] = Number(v);
    else if (cat === 'Threshold') setObj.scoring.thresholds[k] = Number(v);
  }
 
  if (setObj.managers.length === 0) return getFallbackSettings();
  cache.put("avesdo_settings_cache", JSON.stringify(setObj), 21600);
  return setObj;
}

function getFallbackSettings() {
  return {
    managers: [{name: "Roell P", color: "indigo"}, {name: "Jason H", color: "indigo"}, {name: "Rashi G", color: "indigo"}, {name: "Elton P", color: "indigo"}],
    clientTypes: [{name: "Developer", color: "blue"}, {name: "Sales & Marketing", color: "blue"}],
    features: ["API Integrations", "Worksheets", "Realtor Portal", "Credit Card", "Deposit Reminders", "Closing"],
    services: [
      {name: "Sales Training", price: 750}, {name: "Admin Training", price: 1000}, {name: "Developer Training", price: 500},
      {name: "Dedicated Launch Support", price: 1500}, {name: "Project Realignment", price: 0}, {name: "Contract Downloading", price: 0},
      {name: "Assignee ADS", price: 800}
    ],
    statuses: [{ name: "Onboarding", color: "blue" }, { name: "Active", color: "green" }, { name: "Suspended", color: "red" }, { name: "Closed", color: "slate" }],
    timelines: [{ name: "Not Started", color: "slate" }, { name: "Indefinitely Delayed", color: "fuchsia" }, { name: "On Schedule", color: "green" }, { name: "Possible Launch Delay", color: "orange" }, { name: "Delayed", color: "red" }, { name: "Released", color: "blue" }],
    phases: [{ name: "Not Started", color: "slate" }, { name: "Onboarding Email Sent", color: "sky" }, { name: "Onboarding Survey Received", color: "sky" }, { name: "Awaiting Inputs", color: "purple" }, { name: "Setup In Progress", color: "purple" }, { name: "Primary QA", color: "fuchsia" }, { name: "Client QA", color: "fuchsia" }, { name: "Secondary QA", color: "fuchsia" }, { name: "Project Certification", color: "indigo" }, { name: "Released", color: "indigo" }],
    scoring: { weights: { opActivity: 40, featAdoption: 30, userVol: 20, csat: 10 }, clientWeights: { billing: 15, engagement: 50, utilization: 25, experience: 10 }, thresholds: { healthy: 80, warning: 50 } }
  };
}

// ==========================================
// 4. CACHE PRE-WARMER (PHASE 3)
// ==========================================
function backgroundCacheWarmer() {
  const lk = LockService.getScriptLock();
  // If a user is actively saving or pushing data, skip this background run to avoid locking conflicts
  if (!lk.tryLock(10000)) return; 

  try {
    const globalTs = checkGlobalTimestamp();
    // If the system is totally uninitialized, let a user hit it first to establish the baseline TS
    if (globalTs === "0") return; 

    const cache = CacheService.getScriptCache();
    const wb = SpreadsheetApp.getActiveSpreadsheet();
    const tzStr = wb.getSpreadsheetTimeZone();
    let settingsObj = getSettings(wb);

    const mapOfNotes = buildNotesMap(getCleanData(wb, "Notes_Log"), tzStr);
    const healthMaps = buildHealthMap(getCleanData(wb, "Health_Data"));
    const clientsData = buildClientsPayload(getCleanData(wb, "Clients"), mapOfNotes, healthMaps.clientSupportLookup);
    const projectsData = buildProjectsPayload(getCleanData(wb, "Projects"), clientsData.mapOfClients, clientsData.mapOfNamesToIds, healthMaps.mapOfHealth, mapOfNotes, tzStr);
    const servicesPayload = buildServicesPayload(getCleanData(wb, "Services_Log"), clientsData.mapOfClients, projectsData.mapOfProjectIdsToNames, tzStr);

    calculateBackendScores(projectsData.payload, clientsData.payload, settingsObj);

    // Secretly overwrite the existing memory lock with fresh data, resetting the 6-hour expiration timer
    putCachedChunked(cache, "CLI_" + globalTs, JSON.stringify(clientsData.payload), 21600);
    putCachedChunked(cache, "PROJ_" + globalTs, JSON.stringify(projectsData.payload), 21600);
    putCachedChunked(cache, "SERV_" + globalTs, JSON.stringify(servicesPayload), 21600);
  } catch (e) {
    console.error("Cache Warmer Error:", e);
  } finally {
    lk.releaseLock();
  }
}

function setupCachePreWarmerTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'backgroundCacheWarmer') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Schedule the warmer to run every 30 minutes to keep the cache permanently fresh
  ScriptApp.newTrigger('backgroundCacheWarmer')
    .timeBased()
    .everyMinutes(30)
    .create();
}// trigger push

// force sync

// force push

// force push 2

// force push to remove fix_toasts

// force push

// force push

// force push
