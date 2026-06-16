const fs = require("fs");
const file = fs.readFileSync("c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/Userpilot_Sessions Started.csv", "utf-8");
const lines = file.split("\n");
const validLines = lines.filter(l => !l.includes("null_prod") && !l.startsWith("Event Title"));
console.log("Sessions Started valid lines sample:");
validLines.slice(0, 5).forEach((l, i) => console.log(`Row ${i}:`, l.substring(0, 200)));

const file2 = fs.readFileSync("c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/Userpilot_Page Views.csv", "utf-8");
const lines2 = file2.split("\n");
const validLines2 = lines2.filter(l => !l.includes("null_prod") && !l.startsWith("Event Title"));
console.log("\nPage Views valid lines sample:");
validLines2.slice(0, 5).forEach((l, i) => console.log(`Row ${i}:`, l.substring(0, 200)));
