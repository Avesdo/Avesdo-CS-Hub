const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\roell\\Downloads\\CS_Hub\\Avesdo_CS_Hub\\src\\pages';
const files = ['Dashboard.tsx', 'ClientHealth.tsx', 'ServiceHub.tsx', 'ProjectTracker.tsx', 'SupportDashboard.tsx'];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  console.log(`\n\n--- ${file} ---`);
  
  // Find lines with useMemo
  const useMemoLines = content.split('\n').filter(line => line.includes('useMemo'));
  console.log('useMemo usages:', useMemoLines.length);
  
  // Try to find large blocks of useMemo
  const matches = content.match(/useMemo\(\(\) => \{[\s\S]*?\}, \[.*?\]\)/g);
  if (matches) {
    matches.forEach((m, i) => {
      // Just print first 5 lines of each useMemo
      const lines = m.split('\n');
      console.log(`\nMatch ${i+1}:`);
      console.log(lines.slice(0, 5).join('\n'));
      console.log('...');
    });
  } else {
    // try to find const variables with filter/reduce
    const arrMethods = content.match(/const \w+ = .*?\.(filter|reduce|map)\(/g);
    if (arrMethods) {
      console.log('Array methods:');
      console.log(arrMethods.join('\n'));
    }
  }
});
