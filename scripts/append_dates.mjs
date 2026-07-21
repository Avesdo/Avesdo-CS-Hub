import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tagsPath = path.resolve(__dirname, '../src/data/localTags.json');
let tags = [];
if (fs.existsSync(tagsPath)) {
  tags = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const newTags = [];

const add = (tag, desc, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Dates",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

// Today's date
add("DateTimeFull", "Full Time", "10:20 AM");
add("DateTimeBasic", "Basic time", "10:20");
add("TimeFormat", "Time Format", "AM");
add("TimeShortFormat", "Time Short Format", "A");
add("TimeLowerFormat", "Time Lowercase Format", "am");
add("TimeLowerShortFormat", "Time Lowercase Short Format", "a");
add("DateFull", "Basic Date", "Nov 08, 2016");
add("DateFullLong", "Full Date", "November 08, 2016");
add("DateDay", "Day", "08");
add("DateMonthLong", "Month", "November");
add("DateMonth", "Month Abbreviated", "Nov");
add("DateMonthNumber", "Month Number", "11");
add("DateYear", "Year 4 Digits", "2016");
add("DateYear2", "Year Last 2 Digits", "16");
add("DateYear1", "Year Last Digit", "6");

// Contract Date
add("CreatedFull", "Basic Date (Contract)", "Nov 08, 2016");
add("CreatedFullLong", "Full Date (Contract)", "November 08, 2016");
add("CreatedDay", "Day (Contract)", "08");
add("CreatedMonthLong", "Month (Contract)", "November");
add("CreatedMonth", "Month Abbreviated (Contract)", "Nov");
add("CreatedMonthNumber", "Month Number (Contract)", "11");
add("CreatedYear", "Year 4 Digits (Contract)", "2016");
add("CreatedYear2", "Year Last 2 Digits (Contract)", "16");
add("CreatedYear1", "Year Last Digit (Contract)", "6");

// Deposit Due Dates
add("DepositDate1", "First Deposit Date", "Nov 08, 2016");
add("DepositDate2", "Second Deposit Date", "Nov 08, 2016");
add("DepositDate3", "Third Deposit Date", "Nov 08, 2016");
add("DepositDate4", "Fourth Deposit Date", "Nov 08, 2016");
add("DepositDate5", "Fifth Deposit Date", "Nov 08, 2016");
add("DepositDateOccupancy", "Occupancy Deposit Date", "Nov 08, 2016");

// Some Deal Info Dates
add("AcceptedDate", "Accepted Date", "Nov 08, 2016");
add("AcceptedDateTime", "Accepted Date & Time", "Nov 08, 2016 02:30");
add("RescissionExpireDate", "Rescission Expire Date", "Nov 08, 2016");
add("RescissionExpireDateTime", "Rescission Expire Date & Time", "Nov 08, 2016 02:30");
add("CompletionDate", "Completion Date", "Nov 08, 2016");
add("PossessionDate", "Possession Date", "Nov 08, 2016");
add("AdjustmentDate", "Adjustment Date", "Nov 08, 2016");
add("OfferOpenDateFull", "OfferOpenDate full expression", "Nov 08, 2016");
add("OfferOpenDateDay", "OfferOpenDate day expression", "08");
add("OfferOpenDateMonth", "OfferOpenDate month abbreviation expression", "Nov");
add("OfferOpenDateMonthLong", "OfferOpenDate full month expression", "November");
add("OfferOpenDateYear", "OfferOpenDate full year expression", "2016");
add("OfferOpenTimeFull", "OfferOpenDate Time expression", "05:30 PM");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} date tags.`);
