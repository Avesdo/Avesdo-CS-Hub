const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseExcel() {
  console.log('Loading Excel file...');
  const workbook = xlsx.readFile('Developer & Marketing Org Projects.xlsx');
  
  const devSheet = workbook.Sheets['Developer Orgs & Projects'];
  const mktSheet = workbook.Sheets['Marketing Orgs & Projects'];
  
  const devData = xlsx.utils.sheet_to_json(devSheet);
  const mktData = xlsx.utils.sheet_to_json(mktSheet);
  
  console.log(`Found ${devData.length} projects in developer sheet.`);
  console.log(`Found ${mktData.length} entries in marketing sheet.`);
  
  const projectMap = {};

  for (const row of devData) {
    const pId = String(row.Id);
    if (!projectMap[pId]) {
      projectMap[pId] = {
        projectId: pId,
        projectName: row.BuildingName || '',
        developers: [],
        marketingOrgs: [],
        status: 'pending',
      };
    }
    const devName = row.AccountName || '';
    if (devName && !projectMap[pId].developers.includes(devName)) {
      projectMap[pId].developers.push(devName);
    }
  }

  for (const row of mktData) {
    const pId = String(row.BuildingId);
    // Note: The marketing sheet might not have BuildingName if it's missing from devData, 
    // but we can try to use it if available.
    if (!projectMap[pId]) {
      projectMap[pId] = {
        projectId: pId,
        projectName: row.BuildingName || '',
        developers: [],
        marketingOrgs: [],
        status: 'pending',
      };
    }
    const mktName = row['Marketing Organization'] || '';
    if (mktName && !projectMap[pId].marketingOrgs.includes(mktName)) {
      projectMap[pId].marketingOrgs.push(mktName);
    }
  }

  const rows = Object.values(projectMap);
  
  const outPath = path.join(__dirname, '../src/data/initial_imports.json');
  if (!fs.existsSync(path.dirname(outPath))) {
    fs.mkdirSync(path.dirname(outPath));
  }
  
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`Successfully wrote ${rows.length} rows to src/data/initial_imports.json`);
}

parseExcel();
