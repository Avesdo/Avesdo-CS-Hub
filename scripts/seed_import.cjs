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
  
  const mktMap = {};
  mktData.forEach(row => {
    mktMap[row.BuildingId] = row['Marketing Organization'];
  });
  
  const rows = [];
  
  for (const row of devData) {
    const marketingOrg = mktMap[row.Id] || null;
    
    rows.push({
      projectId: String(row.Id),
      projectName: row.BuildingName || '',
      developerId: String(row.DeveloperId),
      developerName: row.AccountName || '',
      marketingOrgName: marketingOrg || '',
      status: 'pending', // pending, approved, ignored
    });
  }
  
  const outPath = path.join(__dirname, '../src/data/initial_imports.json');
  if (!fs.existsSync(path.dirname(outPath))) {
    fs.mkdirSync(path.dirname(outPath));
  }
  
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`Successfully wrote ${rows.length} rows to src/data/initial_imports.json`);
}

parseExcel();
