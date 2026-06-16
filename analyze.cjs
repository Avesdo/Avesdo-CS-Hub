const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.replace(/["\r]/g, ''));
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.replace(/["\r]/g, ''));
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx];
    });
    data.push(obj);
  }
  return data;
}

const dir = "c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub";
const sessionsData = parseCSV(fs.readFileSync(path.join(dir, 'Userpilot_Sessions Started.csv'), 'utf8'));
const pageViewsData = parseCSV(fs.readFileSync(path.join(dir, 'Userpilot_Page Views.csv'), 'utf8'));

// Analyze Sessions Started
// Group by ID
const sessionStats = {};
for (const row of sessionsData) {
  if (row.ID === 'null_prod' || !row.ID) continue;
  const id = row.ID;
  if (!sessionStats[id]) sessionStats[id] = { users: 0, totalAverage: 0 };
  sessionStats[id].users += 1;
  sessionStats[id].totalAverage += parseFloat(row.Average) || 0;
}

let maxUsers = 0, totalUsersAll = 0, numProjectsSess = 0;
let maxSessionsPerUser = 0;
for (const id in sessionStats) {
  const s = sessionStats[id];
  numProjectsSess++;
  totalUsersAll += s.users;
  if (s.users > maxUsers) maxUsers = s.users;
  const avgSessPerUser = s.totalAverage / s.users;
  if (avgSessPerUser > maxSessionsPerUser) maxSessionsPerUser = avgSessPerUser;
}

console.log("=== SESSIONS STATS ===");
console.log(`Projects found: ${numProjectsSess}`);
console.log(`Avg Users per Project: ${(totalUsersAll / numProjectsSess).toFixed(2)}`);
console.log(`Max Users in a Project: ${maxUsers}`);
console.log(`Max Avg Sessions/User: ${maxSessionsPerUser.toFixed(2)}`);

// Analyze Page Views
// Group by ID
const pageStats = {};
for (const row of pageViewsData) {
  if (!row.ID) continue;
  const id = row.ID;
  if (!pageStats[id]) pageStats[id] = { totalAverageViews: 0, uniquePages: new Set() };
  pageStats[id].totalAverageViews += parseFloat(row.Average) || 0;
  if (row['Tagged Page']) pageStats[id].uniquePages.add(row['Tagged Page']);
}

let maxViews = 0, totalViewsAll = 0, numProjectsPage = 0;
let maxUniquePages = 0;
let pagesArr = [];
for (const id in pageStats) {
  const p = pageStats[id];
  numProjectsPage++;
  totalViewsAll += p.totalAverageViews;
  pagesArr.push(p.uniquePages.size);
  if (p.totalAverageViews > maxViews) maxViews = p.totalAverageViews;
  if (p.uniquePages.size > maxUniquePages) maxUniquePages = p.uniquePages.size;
}

pagesArr.sort((a,b)=>a-b);
console.log("\n=== PAGE VIEWS STATS ===");
console.log(`Projects found: ${numProjectsPage}`);
console.log(`Avg Views per Project: ${(totalViewsAll / numProjectsPage).toFixed(2)}`);
console.log(`Max Avg Views in a Project: ${maxViews.toFixed(2)}`);
console.log(`Max Unique Pages used: ${maxUniquePages}`);
console.log(`Median Unique Pages used: ${pagesArr[Math.floor(pagesArr.length/2)]}`);
