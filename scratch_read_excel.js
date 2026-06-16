const xlsx = require("xlsx");
const fs = require("fs");
const files = fs.readdirSync("c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub");
const target = files.find(f => f.includes("Userpilot_Sessions") && f.endsWith(".xlsx"));
if (!target) {
  console.log("File not found");
  process.exit(1);
}
console.log("Reading " + target);
const workbook = xlsx.readFile("c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/" + target);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
console.log("Headers:");
console.log(data[0]);
console.log("First row:");
console.log(data[1]);
