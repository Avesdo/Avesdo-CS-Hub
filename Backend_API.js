// ==========================================
// UNIVERSAL API & DATABASE ENGINE
// ==========================================

function saveSettings(setObj, clientTs) {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(10000)) return { success: false, error: "System busy" };
 
  try {
    const currentTs = checkGlobalTimestamp();
    if (clientTs && currentTs !== "0" && clientTs !== currentTs) {
        throw new Error("SYNC_CONFLICT");
    }

    const sht = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    let lr = sht.getLastRow();
    if (lr > 1) sht.getRange(2, 1, lr - 1, 4).clearContent();
   
    let rw = [];
    if (setObj.managers) setObj.managers.forEach(m => rw.push(["Manager", m.name, m.color || "slate", m.icon || "user"]));
    if (setObj.clientTypes) setObj.clientTypes.forEach(c => rw.push(["ClientType", c.name, c.color || "slate", c.icon || "circle-dashed"]));
    if (setObj.serviceTypes) setObj.serviceTypes.forEach(c => rw.push(["ServiceType", c.name, c.color || "slate", c.icon || "circle-dashed"]));
    if (setObj.features) setObj.features.forEach(f => rw.push(["Feature", f, "", ""]));
    if (setObj.services) setObj.services.forEach(s => rw.push(["Service", s.name, s.price, ""]));
    if (setObj.statuses) setObj.statuses.forEach(s => rw.push(["Status", s.name, s.color, s.icon || "circle-dashed"]));
    if (setObj.timelines) setObj.timelines.forEach(s => rw.push(["Timeline", s.name, s.color, s.icon || "circle-dashed"]));
    if (setObj.phases) setObj.phases.forEach(s => rw.push(["Phase", s.name, s.color, s.icon || "circle-dashed"]));
    if (setObj.settingsData) setObj.settingsData.forEach(s => rw.push([s.category, s.name, s.color || s.attribute || "", s.icon || "circle-dashed"]));
   
    if (setObj.scoring && setObj.scoring.weights) for (let k in setObj.scoring.weights) rw.push(["ScoreWeight", k, setObj.scoring.weights[k], ""]);
    if (setObj.scoring && setObj.scoring.clientWeights) for (let k in setObj.scoring.clientWeights) rw.push(["ClientWeight", k, setObj.scoring.clientWeights[k], ""]);
    if (setObj.scoring && setObj.scoring.thresholds) for (let k in setObj.scoring.thresholds) rw.push(["Threshold", k, setObj.scoring.thresholds[k], ""]);
    if (rw.length > 0) sht.getRange(2, 1, rw.length, 4).setValues(rw);
   
    const cache = CacheService.getScriptCache();
    cache.put("avesdo_settings_cache", JSON.stringify(setObj), 21600);
   
    updateGlobalTimestamp();
    return { success: true };
  } finally {
    lk.releaseLock();
  }
}

function universalUpdateRecord(sheetName, idColName, idValue, updateMapperFunc, clientTs) {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(10000)) throw new Error("System busy, please try saving again.");
  try {
    const currentTs = checkGlobalTimestamp();
    if (clientTs && currentTs !== "0" && clientTs !== currentTs) throw new Error("SYNC_CONFLICT");

    const wb = SpreadsheetApp.getActiveSpreadsheet();
    const sht = wb.getSheetByName(sheetName);
    const data = sht.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    const idIdx = headers.indexOf(idColName);
    let r = -1;
    for (let i = 1; i < data.length; i++) {
        if (data[i][idIdx] === idValue) { r = i + 1; break; }
    }
    let isNew = false;
    if (r === -1) { r = sht.getLastRow() + 1; isNew = true; }

    let updates = [];
    headers.forEach((h, i) => {
        updates[i] = updateMapperFunc(h, isNew ? "" : data[r-1][i]);
    });
    sht.getRange(r, 1, 1, headers.length).setValues([updates]);
    return wb;
  } finally {
    lk.releaseLock();
  }
}

function processMemoryUpdate(ss, sheetName, idColName, ids, updates, mapping) {
    if (!ids || ids.length === 0) return false;
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    const idIdx = headers.indexOf(idColName);
    let hasChanges = false;
   
    for (let i = 1; i < data.length; i++) {
        if (ids.includes(data[i][idIdx])) {
            for (let headerName in mapping) {
                let payloadKey = mapping[headerName];
                let hIdx = headers.indexOf(headerName);
                if (updates[payloadKey] !== undefined && hIdx > -1) {
                    if (data[i][hIdx] !== updates[payloadKey]) {
                        data[i][hIdx] = updates[payloadKey];
                        hasChanges = true;
                    }
                }
            }
        }
    }
    
    // ⚡ PERFORMANCE OPTIMIZATION: Write all updated rows back to the sheet in a single batch operation!
    if (hasChanges) {
        sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    }
    
    return hasChanges;
}

function universalBulkUpdate(sheetName, idColName, ids, updates, mapping, clientTs) {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(15000)) throw new Error("System busy, please try saving again.");
  try {
    const currentTs = checkGlobalTimestamp();
    if (clientTs && currentTs !== "0" && clientTs !== currentTs) throw new Error("SYNC_CONFLICT");
   
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let changed = processMemoryUpdate(ss, sheetName, idColName, ids, updates, mapping);
   
    if (changed) {
        surgicalCacheMigration((projects, clients, services) => {
            let targetArray = sheetName === "Projects" ? projects : (sheetName === "Clients" ? clients : services);
            let idProp = sheetName === "Projects" ? "id" : (sheetName === "Clients" ? "clientId" : "id");

            ids.forEach(idVal => {
                 let idx = targetArray.findIndex(x => x[idProp] === idVal);
                 if (idx > -1) {
                     for (let headerName in mapping) {
                         let payloadKey = mapping[headerName];
                         if (updates[payloadKey] !== undefined) {
                             targetArray[idx][payloadKey] = updates[payloadKey];
                         }
                     }
                 }
            });
        });
    }
    return { success: true };
  } finally {
    lk.releaseLock();
  }
}

function universalDeleteRecord(sheetName, idColName, idValue, clientTs) {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(10000)) throw new Error("System busy, please try saving again.");
  try {
    const currentTs = checkGlobalTimestamp();
    if (clientTs && currentTs !== "0" && clientTs !== currentTs) throw new Error("SYNC_CONFLICT");

    const wb = SpreadsheetApp.getActiveSpreadsheet();
    const sht = wb.getSheetByName(sheetName);
    const data = sht.getDataRange().getValues();
    const idIdx = data[0].map(h => h.toString().trim()).indexOf(idColName);
    for (let i = 1; i < data.length; i++) {
        if (data[i][idIdx] === idValue) {
            sht.deleteRow(i + 1);
           
            surgicalCacheMigration((projects, clients, services) => {
                if (sheetName === "Projects") {
                    let idx = projects.findIndex(x => x.id === idValue);
                    if(idx > -1) projects.splice(idx, 1);
                } else if (sheetName === "Clients") {
                    let idx = clients.findIndex(x => x.clientId === idValue);
                    if(idx > -1) clients.splice(idx, 1);
                } else if (sheetName === "Services_Log") {
                    let idx = services.findIndex(x => x.id === idValue);
                    if(idx > -1) services.splice(idx, 1);
                }
            });

            return { success: true };
        }
    }
    return { success: false, error: "Record not found" };
  } finally {
    lk.releaseLock();
  }
}

function syncRelatedNotes(wb, sheetName, targetId, type, logsArr) {
  const sheet = wb.getSheetByName(sheetName);
  if (!sheet || !logsArr || logsArr.length === 0) return;

  let newNotes = logsArr.filter(log => !log.id);
  if (newNotes.length === 0) return;

  let newRows = [];
  let timestamp = new Date().getTime();
  newNotes.forEach((log, index) => {
      let newId = "L-" + timestamp + "-" + Math.floor(Math.random() * 10000) + index;
      newRows.push([newId, targetId, log.date, log.user, log.text]);
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 5).setValues(newRows);
}

// ==========================================
// ENTITY SPECIFIC WRAPPERS
// ==========================================

function updateProject(p, clientTs) {
    let wb = universalUpdateRecord("Projects", "Project ID", p.id, (h, oldVal) => {
        if (h === "Project ID") return p.id;
        if (h === "Project Name") return p.name;
        if (h === "Attached Client IDs") return (p.clientIds && p.clientIds.length > 0) ? p.clientIds.join(', ') : "";
        if (h === "Manager") return p.assignee;
        if (h === "Project Status") return p.projectStatus;
        if (h === "Timeline Status") return p.timelineStatus;
        if (h === "Onboarding Phase") return p.onboardingPhase;
        if (h === "Release Date") return p.releaseDate;
        if (h === "Units") return p.units;
        if (h === "Active Features") return (p.features || []).join(', ');
        if (h === "Checklist URL") return p.checklistUrl;
        if (h === "KYC Details") return p.kyc;
        return oldVal;
    }, clientTs);
   
    syncRelatedNotes(wb, "Notes_Log", p.id, "Project", p.notes);
   
    surgicalCacheMigration((projects, clients, services) => {
        let idx = projects.findIndex(x => x.id === p.id);
        if (idx > -1) projects[idx] = p; else projects.push(p);
    });

    return { success: true };
}

function updateClient(c, clientTs) {
    let wb = universalUpdateRecord("Clients", "Client ID", c.clientId, (h, oldVal) => {
        if (h === "Client ID") return c.clientId;
        if (h === "Company Name") return c.companyName;
        if (h === "Client Type") return c.clientType;
        if (h === "Manager") return c.accountManager;
        return oldVal;
    }, clientTs);

    syncRelatedNotes(wb, "Notes_Log", c.clientId, "Client", c.notes);
   
    surgicalCacheMigration((projects, clients, services) => {
        let idx = clients.findIndex(x => x.clientId === c.clientId);
        if (idx > -1) clients[idx] = c; else clients.push(c);
    });

    return { success: true };
}

function updateService(s, clientTs) {
    universalUpdateRecord("Services_Log", "Service ID", s.id, (h, oldVal) => {
        if (h === "Service ID") return s.id;
        if (h === "Service Name") return s.name;
        if (h === "Service Type (Included/Additional)" || h === "Service Type") return s.type;
        if (h === "Price") return s.price;
        if (h === "Project ID") return s.projectId;
        if (h === "Client ID") return s.clientId;
        if (h === "Manager") return s.manager;
        if (h === "Client Contact Name") return s.contactName;
        if (h === "Service Outcome") return s.outcome;
        if (h === "Service Status") return s.status;
        if (h === "Service Date") return s.dateInput || s.dateStr;
        if (h === "Invoice Number") return s.invoiceNum;
        if (h === "Invoice Sent (yes/no)") return s.invoiceSent;
        if (h === "Invoice Paid (yes/no)") return s.invoicePaid;
        if (h === "Commission") return s.commission;
        if (h === "Commission Paid (yes/no)") return s.commissionPaid;
        if (h === "Date Paid") return s.datePaidInput || s.datePaidStr;
        return oldVal;
    }, clientTs);
   
    surgicalCacheMigration((projects, clients, services) => {
        let idx = services.findIndex(x => x.id === s.id);
        if (idx > -1) services[idx] = s; else services.push(s);
    });

    return { success: true, service: s };
}

function deleteServiceRecord(sId, clientTs) {
    return universalDeleteRecord("Services_Log", "Service ID", sId, clientTs);
}

function deleteClientRecord(cId, clientTs) {
    return universalDeleteRecord("Clients", "Client ID", cId, clientTs);
}

function deleteProjectRecord(pId, clientTs) {
    return universalDeleteRecord("Projects", "Project ID", pId, clientTs);
}

function bulkUpdateProjects(ids, updates, clientTs) {
    return universalBulkUpdate("Projects", "Project ID", ids, updates, {
        "Project Status": "projectStatus",
        "Manager": "assignee",
        "Timeline Status": "timelineStatus",
        "Onboarding Phase": "onboardingPhase",
        "Release Date": "releaseDate" 
    }, clientTs);
}

function bulkUpdateClients(ids, updates, clientTs) {
    return universalBulkUpdate("Clients", "Client ID", ids, updates, {
        "Client Type": "clientType",
        "Manager": "accountManager"
    }, clientTs);
}

function bulkUpdateServices(ids, updates, clientTs) {
    return universalBulkUpdate("Services_Log", "Service ID", ids, updates, {
        "Service Name": "name",
        "Manager": "manager",
        "Service Outcome": "outcome",
        "Service Status": "status"
    }, clientTs);
}

function cascadeSettingsUpdate(payload, clientTs) {
  const lk = LockService.getScriptLock();
  if (!lk.tryLock(20000)) throw new Error("System busy, please try saving again.");
  try {
    const currentTs = checkGlobalTimestamp();
    if (clientTs && currentTs !== "0" && clientTs !== currentTs) throw new Error("SYNC_CONFLICT");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
   
    let c1 = processMemoryUpdate(ss, "Projects", "Project ID", payload.projIds || [], payload.projUpdates || {}, {
        "Project Status": "projectStatus", "Manager": "assignee", "Timeline Status": "timelineStatus", "Onboarding Phase": "onboardingPhase"
    });
    let c2 = processMemoryUpdate(ss, "Clients", "Client ID", payload.clientIds || [], payload.clientUpdates || {}, {
       "Client Type": "clientType", "Manager": "accountManager"
    });
    let c3 = processMemoryUpdate(ss, "Services_Log", "Service ID", payload.svcIds || [], payload.svcUpdates || {}, {
        "Service Name": "name", "Manager": "manager", "Service Outcome": "outcome", "Service Status": "status"
    });

    if (c1 || c2 || c3) {
        surgicalCacheMigration((projects, clients, services) => {
            if (c1 && payload.projIds) {
                payload.projIds.forEach(idVal => {
                     let idx = projects.findIndex(x => x.id === idVal);
                     if (idx > -1) Object.assign(projects[idx], payload.projUpdates);
                });
            }
            if (c2 && payload.clientIds) {
                payload.clientIds.forEach(idVal => {
                     let idx = clients.findIndex(x => x.clientId === idVal);
                     if (idx > -1) Object.assign(clients[idx], payload.clientUpdates);
                });
            }
            if (c3 && payload.svcIds) {
                payload.svcIds.forEach(idVal => {
                     let idx = services.findIndex(x => x.id === idVal);
                     if (idx > -1) Object.assign(services[idx], payload.svcUpdates);
                 });
            }
        });
    }
    return { success: true };
  } finally {
    lk.releaseLock();
  }
}