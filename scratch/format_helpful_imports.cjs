const fs = require('fs');
const path = require('path');

const parsedPath = path.join(__dirname, 'helpful_imports_parsed.json');
const outPath = path.join(__dirname, '../src/data/localHelpfulImports.json');

const data = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));

// Generate a random ID like the ones existing
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Skip header row
const rows = data.slice(1);

const formatted = rows.map(row => {
  return {
    id: generateId(),
    action: row[0] || "",
    project: row[1] || "",
    solution: row[2] || ""
  };
});

fs.writeFileSync(outPath, JSON.stringify(formatted, null, 2));
console.log('Formatted and saved to src/data/localHelpfulImports.json');
