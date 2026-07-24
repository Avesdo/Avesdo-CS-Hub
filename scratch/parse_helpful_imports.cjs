const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../reference_materials/Helpful Imports.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const json = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

fs.writeFileSync(path.join(__dirname, 'helpful_imports_parsed.json'), JSON.stringify(json, null, 2));
console.log('Parsed successfully to helpful_imports_parsed.json');
