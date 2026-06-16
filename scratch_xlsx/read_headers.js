const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '..', 'Project Certification (Responses).xlsx'));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:");
console.log(data[0]);
console.log("\nFirst Row:");
console.log(data[1]);
