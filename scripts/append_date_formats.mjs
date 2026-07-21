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
    category: "Logic Prefixes - Date & Time",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

// Dates
add("fdateshort_", "Basic Date", "Nov 08, 2016");
add("fdatefull_", "Full Date", "November 08, 2016");
add("fdateday_", "Day", "08");
add("fdatemonth_", "Month", "November");
add("fdatemonthshort_", "Month Abbreviated", "Nov");
add("fdateyear_", "Year 4 Digits", "2016");
add("fdateyear2_", "Year Last 2 Digits", "16");
add("fdateyear1_", "Year Last Digit", "6");
add("fdatemonthday_", "Month and Day", "September 28");
add("fdatemonthdayshort_", "Month and Day Abbreviated", "Sep 28");

// Times
add("fdatetime_", "Time with Format (12-hour format)", "11:30 AM");
add("ftime_", "Only Time (without format)", "11:30");
add("ftimeformat_", "Only AM/PM (without time) - Uppercase", "AM");
add("ftimeshortformat_", "Only AM/PM (short without time) - Uppercase", "A");
add("ftimelowerformat_", "Only AM/PM (without time) - Lowercase", "am");
add("ftimelowershortformat_", "Only AM/PM (short without time) - Lowercase", "a");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} date/time logic prefixes.`);
