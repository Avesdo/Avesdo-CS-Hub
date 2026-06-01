// ==========================================
// DATA MAPPING & SCORE CALCULATIONS
// ==========================================

function buildNotesMap(notesData, tzStr) {
  let mapOfNotes = {};
  if (notesData.length > 1) {
    notesData.slice(1).forEach(row => {
      let rId = row[1] ? row[1].toString().trim() : "";
      if (!rId) return;
      let dString = formatDateSafe(row[2], tzStr);
      if (!mapOfNotes[rId]) mapOfNotes[rId] = [];
      mapOfNotes[rId].push({ id: row[0], date: dString, user: row[3], text: row[4] });
    });
  }
  for(let k in mapOfNotes) { mapOfNotes[k].sort((a,b) => new Date(b.date) - new Date(a.date)); }
  return mapOfNotes;
}

function buildHealthMap(healthData) {
  let mapOfHealth = {};
  let clientSupportLookup = {};
  if (healthData.length > 1) {
    let hh = healthData[0].map(h => h.toString().trim());
    let idx = { pId: hh.indexOf("Project ID"), csat: hh.indexOf("CSAT Rating"), bill: hh.indexOf("Billing Status"), op: hh.indexOf("Operational Activity"), user: hh.indexOf("Active User Volume"), supCsat: hh.indexOf("Support CSAT"), cId: hh.indexOf("Client ID") };
    healthData.slice(1).forEach(row => {
      let pId = idx.pId > -1 && row[idx.pId] ? row[idx.pId].toString().trim() : "";
      if (pId) {
        mapOfHealth[pId] = {
          csat: idx.csat > -1 && row[idx.csat] ? row[idx.csat].toString().trim() : "",
          billing: idx.bill > -1 && row[idx.bill] ? row[idx.bill].toString().trim() : "Current",
          opActivity: idx.op > -1 ? Number(row[idx.op]) || 0 : 0,
          userVol: idx.user > -1 ? Number(row[idx.user]) || 0 : 0
        };
      }
      let cId = idx.cId > -1 && row[idx.cId] ? row[idx.cId].toString().trim() : null;
      let supCsat = idx.supCsat > -1 && row[idx.supCsat] !== "" ? row[idx.supCsat] : "";
      if (cId && supCsat !== "") clientSupportLookup[cId] = parseInt(supCsat) || "N/A";
    });
  }
  return { mapOfHealth, clientSupportLookup };
}

function buildClientsPayload(clientData, mapOfNotes, clientSupportLookup) {
  let mapOfClients = {}; let mapOfNamesToIds = {}; let payload = [];
  if (clientData.length > 1) {
    let ch = clientData[0].map(h => h.toString().trim());
    let idx = { id: ch.indexOf("Client ID"), name: ch.indexOf("Company Name"), type: ch.indexOf("Client Type"), mgr: ch.indexOf("Manager") };
    clientData.slice(1).forEach(row => {
      let cId = idx.id > -1 && row[idx.id] ? row[idx.id].toString().trim() : "";
      if (!cId) return;
      let cName = idx.name > -1 && row[idx.name] ? row[idx.name].toString().trim() : "Unknown";
      mapOfClients[cId] = cName; mapOfNamesToIds[cName] = cId;
      payload.push({
        clientId: cId, companyName: cName, clientType: idx.type > -1 && row[idx.type] ? row[idx.type].toString().trim() : "Not Set",
        accountManager: idx.mgr > -1 && row[idx.mgr] ? row[idx.mgr].toString().trim() : "Not Set",
        healthScore: "N/A", activeProjectCount: 0, onboardingProjectCount: 0, closedProjectCount: 0,
        metrics: { billing:100, billingStatus: 'Current', projAct:0, userAct:0, feat:0, csat:"N/A", onbCsat:"N/A", supportCsat:"N/A" },
        notes: mapOfNotes[cId] || [], projectList: [], supportCsat: clientSupportLookup[cId] !== undefined ? clientSupportLookup[cId] : "N/A"
      });
    });
  }
  return { payload, mapOfClients, mapOfNamesToIds };
}

function buildProjectsPayload(projectData, mapOfClients, mapOfNamesToIds, mapOfHealth, mapOfNotes, tzStr) {
  let payload = []; let mapOfProjectIdsToNames = {};
  if (projectData.length > 1) {
    let ph = projectData[0].map(h => h.toString().trim());
    let idx = { id: ph.indexOf("Project ID"), name: ph.indexOf("Project Name"), assoc: ph.indexOf("Attached Client IDs"), mgr: ph.indexOf("Manager"), status: ph.indexOf("Project Status"), tl: ph.indexOf("Timeline Status"), phase: ph.indexOf("Onboarding Phase"), date: ph.indexOf("Release Date"), units: ph.indexOf("Units"), feats: ph.indexOf("Active Features"), chk: ph.indexOf("Checklist URL"), kyc: ph.indexOf("KYC Details") };
    projectData.slice(1).forEach(row => {
      let pId = idx.id > -1 && row[idx.id] ? row[idx.id].toString().trim() : "";
      if (!pId) return;
      let pName = idx.name > -1 && row[idx.name] ? row[idx.name].toString().trim() : "Unnamed Project";
      mapOfProjectIdsToNames[pId] = pName;
      let rawL = idx.date > -1 ? row[idx.date] : "";
      let lStr = "No Date", lVal = 0, rDateInput = "";
      if (rawL instanceof Date && !isNaN(rawL.getTime())) { lStr = formatDateSafe(rawL, tzStr); lVal = rawL.getTime(); rDateInput = formatDateForInput(rawL, tzStr); }
      else if (rawL) { let d = new Date(rawL); if(!isNaN(d.getTime())) { lStr = formatDateSafe(d, tzStr); lVal = d.getTime(); rDateInput = formatDateForInput(d, tzStr); } }

      let rawAssoc = idx.assoc > -1 && row[idx.assoc] ? row[idx.assoc].toString().split(',').map(s => s.trim()) : [];
      let cleanIds = []; let mappedNames = [];
      rawAssoc.forEach(v => {
          if (mapOfClients[v]) { cleanIds.push(v); mappedNames.push(mapOfClients[v]); }
          else if (mapOfNamesToIds[v]) { cleanIds.push(mapOfNamesToIds[v]); mappedNames.push(v); }
          else { cleanIds.push(v); mappedNames.push(v); }
      });
      let hD = mapOfHealth[pId] || { csat: "", billing: "Current", opActivity: 0, userVol: 0 };
     
      payload.push({
        id: pId, name: pName, clientIds: cleanIds, clients: mappedNames, assignee: idx.mgr > -1 && row[idx.mgr] ? row[idx.mgr].toString().trim() : "Not Set",
        projectStatus: idx.status > -1 && row[idx.status] ? row[idx.status].toString().trim() : "Onboarding", timelineStatus: idx.tl > -1 && row[idx.tl] ? row[idx.tl].toString().trim() : "Not Started",
        onboardingPhase: idx.phase > -1 && row[idx.phase] ? row[idx.phase].toString().trim() : "Not Started", releaseDateStr: lStr, releaseDateVal: lVal, releaseDate: rDateInput,
        units: idx.units > -1 && row[idx.units] ? row[idx.units] : 0, features: idx.feats > -1 && row[idx.feats] ? row[idx.feats].toString().split(',').map(s => s.trim()) : [],
        checklistUrl: idx.chk > -1 && row[idx.chk] ? row[idx.chk].toString().trim() : "", kyc: idx.kyc > -1 && row[idx.kyc] ? row[idx.kyc].toString().trim() : "",
        csat: hD.csat, billing: hD.billing, opActivity: hD.opActivity, userVol: hD.userVol, notes: mapOfNotes[pId] || [], score: "N/A"
      });
    });
  }
  return { payload, mapOfProjectIdsToNames };
}

function buildServicesPayload(servicesData, mapOfClients, mapOfProjectIdsToNames, tzStr) {
  let payload = [];
  if (servicesData.length > 1) {
    let sh = servicesData[0].map(h => h.toString().trim());
    let idx = { sId: sh.indexOf("Service ID"), sName: sh.indexOf("Service Name"), sType: sh.indexOf("Service Type"), price: sh.indexOf("Price"), pId: sh.indexOf("Project ID"), cId: sh.indexOf("Client ID"), mgr: sh.indexOf("Manager"), contact: sh.indexOf("Client Contact Name"), out: sh.indexOf("Service Outcome"), stat: sh.indexOf("Service Status"), date: sh.indexOf("Service Date"), invNum: sh.indexOf("Invoice Number"), invSent: sh.indexOf("Invoice Sent"), invPaid: sh.indexOf("Invoice Paid"), comm: sh.indexOf("Commission"), commPaid: sh.indexOf("Commission Paid"), datePaid: sh.indexOf("Date Paid") };
    servicesData.slice(1).forEach(row => {
      let sId = idx.sId > -1 && row[idx.sId] ? row[idx.sId].toString().trim() : "";
      if (!sId) return;
      let pId = idx.pId > -1 && row[idx.pId] ? row[idx.pId].toString().trim() : "";
      let cId = idx.cId > -1 && row[idx.cId] ? row[idx.cId].toString().trim() : "";
      let cName = mapOfClients[cId] || "Unknown Client"; let pName = (pId && pId !== "None" && pId !== "No Project" && pId !== "null" && pId !== "undefined") ? (mapOfProjectIdsToNames[pId] || "Client Level") : "Client Level";
      let rawD = idx.date > -1 ? row[idx.date] : ""; let dStr = "No Date", dVal = 0, rDateInput = "";
      if (rawD instanceof Date && !isNaN(rawD.getTime())) { dStr = formatDateSafe(rawD, tzStr); dVal = rawD.getTime(); rDateInput = formatDateForInput(rawD, tzStr); }
      let rawDatePaid = idx.datePaid > -1 ? row[idx.datePaid] : ""; let dpStr = "", dpVal = 0, dpDateInput = "";
      if (rawDatePaid instanceof Date && !isNaN(rawDatePaid.getTime())) { dpStr = formatDateSafe(rawDatePaid, tzStr); dpVal = rawDatePaid.getTime(); dpDateInput = formatDateForInput(rawDatePaid, tzStr); }

      payload.push({
        id: sId, name: idx.sName > -1 && row[idx.sName] ? row[idx.sName].toString().trim() : "Unnamed Service", type: idx.sType > -1 && row[idx.sType] ? row[idx.sType].toString().trim() : "Additional",
        price: idx.price > -1 && row[idx.price] ? row[idx.price].toString().trim() : "$0.00", projectId: pId, projectName: pName, clientId: cId, clientName: cName, manager: idx.mgr > -1 && row[idx.mgr] ? row[idx.mgr].toString().trim() : "Not Set", contactName: idx.contact > -1 && row[idx.contact] ? row[idx.contact].toString().trim() : "", outcome: idx.out > -1 && row[idx.out] ? row[idx.out].toString().trim() : "Pending", status: idx.stat > -1 && row[idx.stat] ? row[idx.stat].toString().trim() : "Quote Sent", dateStr: dStr, dateVal: dVal, dateInput: rDateInput, invoiceNum: idx.invNum > -1 && row[idx.invNum] ? row[idx.invNum].toString().trim() : "", invoiceSent: idx.invSent > -1 && row[idx.invSent] ? row[idx.invSent].toString().trim() : "No", invoicePaid: idx.invPaid > -1 && row[idx.invPaid] ? row[idx.invPaid].toString().trim() : "No", commission: idx.comm > -1 && row[idx.comm] ? row[idx.comm].toString().trim() : "$0.00", commissionPaid: idx.commPaid > -1 && row[idx.commPaid] ? row[idx.commPaid].toString().trim() : "No", datePaidStr: dpStr, datePaidVal: dpVal, datePaidInput: dpDateInput
      });
    });
  }
  return payload;
}

// ==========================================
// BACKEND MATH ENGINE
// ==========================================

function getSharedMath() {
  const cache = CacheService.getScriptCache();
  let mathCode = cache.get("SHARED_MATH_CODE");
  if (!mathCode) {
    try {
      mathCode = HtmlService.createHtmlOutputFromFile('Shared_Math').getContent();
      mathCode = mathCode.replace(/<script>/gi, '').replace(/<\/script>/gi, '');
      cache.put("SHARED_MATH_CODE", mathCode, 21600);
    } catch(e) {
      console.error("Could not load Shared_Math", e);
      return "";
    }
  }
  return mathCode;
}

function calculateBackendScores(projects, clients, settings) {
    let mathCode = getSharedMath();
    if (mathCode) eval(mathCode); // Exposes calculateProjectScoreLogic and calculateClientScoreLogic to global scope
    
    let w = settings.scoring.weights;
    let cw = settings.scoring.clientWeights;
    let featLen = settings.features.length > 0 ? settings.features.length : 1;

    // Score all Projects
    projects.forEach(p => {
        if (typeof calculateProjectScoreLogic === 'function') {
            p.score = calculateProjectScoreLogic(p, w, featLen);
        } else {
            p.score = "N/A";
        }
    });

    // Score all Clients
    clients.forEach(c => {
        let clientProjs = projects.filter(p => (p.clientIds || []).includes(c.clientId));
        let activeProjs = clientProjs.filter(p => p.projectStatus !== 'Onboarding' && p.projectStatus !== 'Closed');
        c.activeProjectCount = activeProjs.length;

        if (typeof calculateClientScoreLogic === 'function') {
            let result = calculateClientScoreLogic(c, activeProjs, cw, featLen);
            c.healthScore = result.healthScore;
            c.metrics = result.metrics;
        } else {
            c.healthScore = "N/A";
        }
    });
}

// --- HEALTH HISTORY & TREND LOGIC --- //

function getAllHealthHistory() {
  const cache = CacheService.getScriptCache();
  const cachedHistory = getCachedChunked(cache, "HEALTH_HISTORY_FULL");

  if (cachedHistory) {
    try {
      return JSON.parse(cachedHistory);
    } catch(e) { console.error("History cache parse failed", e); }
  }

  const wb = SpreadsheetApp.getActiveSpreadsheet();
  const tzStr = wb.getSpreadsheetTimeZone();
  const historyData = getCleanData(wb, "Health_History_Log");
  let healthHistoryMap = {};

  if (historyData.length > 1) {
    historyData.slice(1).forEach(row => {
      let entityId = row[3] ? row[3].toString().trim() : "";
      if (!entityId) return;
     
      let dObj = row[0];
      let cleanDate = formatDateSafe(dObj, tzStr);
      if (!cleanDate) cleanDate = String(dObj);
     
      let tVal = row[1];
      let score = row[5];
     
      if (!healthHistoryMap[entityId]) healthHistoryMap[entityId] = [];
      healthHistoryMap[entityId].push({ date: cleanDate, timeVal: tVal, score: score });
    });
    for (let key in healthHistoryMap) {
      healthHistoryMap[key].sort((a, b) => a.timeVal - b.timeVal);
    }
  }

  try {
    putCachedChunked(cache, "HEALTH_HISTORY_FULL", JSON.stringify(healthHistoryMap), 21600); // 6 hours
  } catch(e) { console.error("Failed to cache history", e); }

  return healthHistoryMap;
}

function setupTrendTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'recordHealthSnapshot') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('recordHealthSnapshot')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(23)
    .create();
}

function recordHealthSnapshot() {
  const wb = SpreadsheetApp.getActiveSpreadsheet();
  let historySheet = wb.getSheetByName("Health_History_Log");
  if (!historySheet) {
    historySheet = wb.insertSheet("Health_History_Log");
    historySheet.appendRow(["Snapshot Date", "Timestamp Val", "Entity Type", "Entity ID", "Entity Name", "Health Score"]);
    historySheet.hideSheet();
  }
 
  const appState = getInitialAppState();
  const clients = appState.clients;
  const projects = appState.projects;
  const settings = appState.settings;
 
  calculateBackendScores(projects, clients, settings);
 
  const today = new Date();
  const dateStr = Utilities.formatDate(today, wb.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  const timeVal = today.getTime();
  let rowsToAppend = [];
 
  clients.forEach(c => {
      if (c.healthScore !== "N/A") {
          rowsToAppend.push([dateStr, timeVal, "Client", c.clientId, c.companyName, c.healthScore]);
      }
  });

  projects.forEach(p => {
      if (p.projectStatus === 'Onboarding' || p.projectStatus === 'Closed') return;
      if (p.score !== "N/A") {
          rowsToAppend.push([dateStr, timeVal, "Project", p.id, p.name, p.score]);
      }
  });
 
  if (rowsToAppend.length > 0) {
      historySheet.getRange(historySheet.getLastRow() + 1, 1, rowsToAppend.length, 6).setValues(rowsToAppend);
  }

  CacheService.getScriptCache().remove("HEALTH_HISTORY_FULL");

  // Sync the updated history map (including the new snapshot) to Firestore
  try {
    const updatedHistoryMap = getAllHealthHistory();
    writeToFirestore("settings", "health_history", { historyMap: updatedHistoryMap });
  } catch (e) {
    console.error("Failed to sync new health snapshot to Firestore:", e);
  }
}

function getHealthHistory(entityId) {
  try {

    const allHistory = getAllHealthHistory() || {};
    return allHistory[entityId] || [];
  } catch(e) {
    console.error("History fallback fetch failed", e);
    return [];
  }
}