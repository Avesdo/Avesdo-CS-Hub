import * as xlsxImport from "xlsx";
import * as fs from "fs";

const xlsx = xlsxImport.default ? xlsxImport.default : xlsxImport;

const sessionsPath = "c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/Userpilot_Sessions Started.xlsx";
const viewsPath = "c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/Userpilot_Page Views.xlsx";

try {
    const sWorkbook = xlsx.readFile(sessionsPath);
    const sData = xlsx.utils.sheet_to_json(sWorkbook.Sheets[sWorkbook.SheetNames[0]]);
    console.log("=== Sessions ===");
    console.log("Total Rows:", sData.length);
    if(sData.length > 0) console.log("Sample:", sData[0]);

    const vWorkbook = xlsx.readFile(viewsPath);
    const vData = xlsx.utils.sheet_to_json(vWorkbook.Sheets[vWorkbook.SheetNames[0]]);
    console.log("=== Page Views ===");
    console.log("Total Rows:", vData.length);
    if(vData.length > 0) console.log("Sample:", vData[0]);
} catch (e) {
    console.error(e.message);
}
