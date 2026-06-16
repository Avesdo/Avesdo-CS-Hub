import * as fs from "fs";
import * as path from "path";

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const result = [];
  const headers = splitRow(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = splitRow(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    result.push(row);
  }
  return result;
}

function splitRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function processData() {
  const sessionsRaw = fs.readFileSync("Userpilot_Sessions Started.csv", "utf8");
  const viewsRaw = fs.readFileSync("Userpilot_Page Views.csv", "utf8");

  const sessionsData = parseCSV(sessionsRaw);
  const viewsData = parseCSV(viewsRaw);

  if (sessionsData.length === 0) return console.log("No session data.");

  const headerKeys = Object.keys(sessionsData[0]);
  const dateColumns = headerKeys.filter(k => {
    const d = new Date(k);
    return !isNaN(d.getTime());
  });

  dateColumns.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const trailingMonths = dateColumns.slice(-3);
  console.log("Using columns for 3-month trailing average:", trailingMonths);

  const projects = {};

  const projUsers = {}; 
  sessionsData.forEach(row => {
    const rawId = row["ID"];
    if (!rawId || rawId === "null_prod") return;
    const devId = rawId.replace("_prod", "");

    if (!projUsers[devId]) projUsers[devId] = {};
    
    let userTotalSessions = 0;
    trailingMonths.forEach(m => {
      userTotalSessions += parseInt(row[m] || "0", 10);
    });

    if (userTotalSessions > 0) {
      projUsers[devId][row["Email"]] = userTotalSessions;
    }
  });

  for (const [devId, users] of Object.entries(projUsers)) {
    const emails = Object.keys(users);
    const numUsers = emails.length;
    let totalSessions = 0;
    emails.forEach(email => totalSessions += users[email]);

    const avgSessionsPerUserPerMonth = numUsers > 0 ? (totalSessions / numUsers / 3) : 0;

    let userVolScore = 0;
    if (numUsers >= 5) userVolScore += 50;
    else if (numUsers >= 3) userVolScore += 35;
    else if (numUsers >= 1) userVolScore += 15;

    let loginFreqScore = 0;
    if (avgSessionsPerUserPerMonth >= 10) loginFreqScore += 50;
    else if (avgSessionsPerUserPerMonth >= 4) loginFreqScore += 35;
    else if (avgSessionsPerUserPerMonth >= 1) loginFreqScore += 15;

    projects[devId] = {
      userVol: userVolScore + loginFreqScore,
      userStats: { activeUsers: numUsers, avgFreq: avgSessionsPerUserPerMonth.toFixed(1) }
    };
  }

  const projViews = {};
  viewsData.forEach(row => {
    const rawId = row["ID"];
    if (!rawId || rawId === "null_prod") return;
    const devId = rawId.replace("_prod", "");
    const feature = row["Tagged Page"];

    if (!feature || feature === "Untagged Pages") return;

    if (!projViews[devId]) projViews[devId] = {};
    
    let featureTotalViews = 0;
    trailingMonths.forEach(m => {
      featureTotalViews += parseInt(row[m] || "0", 10);
    });

    if (featureTotalViews > 0) {
      projViews[devId][feature] = (projViews[devId][feature] || 0) + featureTotalViews;
    }
  });

  for (const [devId, features] of Object.entries(projViews)) {
    const featureNames = Object.keys(features);
    const numFeatures = featureNames.length;
    let totalViews = 0;
    featureNames.forEach(f => totalViews += features[f]);

    const avgViewsPerMonth = totalViews / 3;

    let breadthScore = 0;
    if (numFeatures >= 4) breadthScore += 50;
    else if (numFeatures >= 2) breadthScore += 35;
    else if (numFeatures >= 1) breadthScore += 15;

    let volScore = 0;
    if (avgViewsPerMonth >= 500) volScore += 50;
    else if (avgViewsPerMonth >= 150) volScore += 35;
    else if (avgViewsPerMonth >= 1) volScore += 15;

    if (!projects[devId]) projects[devId] = {};
    projects[devId].opActivity = breadthScore + volScore;
    projects[devId].viewStats = { features: numFeatures, avgViews: Math.round(avgViewsPerMonth) };
  }

  console.log("=== PREVIEW ===");
  const sampleKeys = Object.keys(projects).slice(0, 15);
  for (const devId of sampleKeys) {
    const p = projects[devId];
    console.log(`DevID: ${devId}`);
    console.log(`  Active Users (userVol): ${p.userVol || 0} / 100 [Users: ${p.userStats?.activeUsers || 0}, Avg Freq: ${p.userStats?.avgFreq || 0}/mo]`);
    console.log(`  Engagement (opActivity): ${p.opActivity || 0} / 100 [Features: ${p.viewStats?.features || 0}, Avg Views: ${p.viewStats?.avgViews || 0}/mo]`);
  }
}

processData();
