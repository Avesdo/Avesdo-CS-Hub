import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../reference_materials/Tag Database 2023.xlsx');
const workbook = xlsx.readFile(filePath);

const allTags = [];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  if (json.length < 2) continue;

  // Most standard sheets have this layout:
  // Row 1: [ 'Description', 'Tag', 'Example' ]
  
  if (['DealListing Details', 'Dates', 'EFT Tags'].includes(sheetName)) {
    // Skip the first row if it's just a category title, and the second row if it's the header.
    // Let's just find the row that has 'Description', 'Tag'
    let startIndex = 1;
    for (let i = 0; i < Math.min(10, json.length); i++) {
      if (json[i][0] === 'Description' && json[i][1] === 'Tag') {
        startIndex = i + 1;
        break;
      }
    }

    for (let i = startIndex; i < json.length; i++) {
      const row = json[i];
      if (!row || !row[0] || !row[1]) continue; // Skip empty rows
      
      allTags.push({
        id: generateId(),
        category: sheetName,
        description: String(row[0]).trim(),
        tag: String(row[1]).trim(),
        example: row[2] ? String(row[2]).trim() : '',
        isBuilder: false
      });
    }
  } 
  else if (sheetName === 'Special Tags') {
    // Special Tags has multiple columns
    // [ 'Description', 'Tag', 'Example', null, 'Realtor Commissions math' (Desc), 'math_...' (Tag) ]
    let startIndex = 1;
    for (let i = 0; i < Math.min(10, json.length); i++) {
      if (json[i][0] === 'Description' && json[i][1] === 'Tag') {
        startIndex = i + 1;
        break;
      }
    }

    for (let i = startIndex; i < json.length; i++) {
      const row = json[i];
      if (!row) continue;
      
      // Standard tags in first 3 columns
      if (row[0] && row[1]) {
        allTags.push({
          id: generateId(),
          category: 'Special Tags',
          description: String(row[0]).trim(),
          tag: String(row[1]).trim(),
          example: row[2] ? String(row[2]).trim() : '',
          isBuilder: false
        });
      }

      // Math/Other tags in columns 4, 5
      if (row[4] && row[5]) {
        allTags.push({
          id: generateId(),
          category: 'Special Tags (Math)',
          description: String(row[4]).trim(),
          tag: String(row[5]).trim(),
          example: '',
          isBuilder: false
        });
      }
    }
  }
}

// Deal Participants - We'll manually structure this later since it's highly irregular.
// We'll leave Deal Participants out of the automated parse for a moment, or just pull the raw text to analyze.

const outPath = path.resolve(__dirname, '../src/data/tags.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(allTags, null, 2));

console.log(`Successfully extracted ${allTags.length} tags to src/data/tags.json`);
