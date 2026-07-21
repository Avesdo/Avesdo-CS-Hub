import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../reference_materials/Tag Database 2023.xlsx');
const workbook = xlsx.readFile(filePath);

const result = {};

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  if (json.length > 1) {
    result[sheetName] = json.slice(0, 5); // get first 5 rows
  }
}

console.log(JSON.stringify(result, null, 2));
