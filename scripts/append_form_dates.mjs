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

const add = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Form Dates",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      type: 'infix',
      exampleCombo: exTag
    }
  });
}

add("form[Example]Full", "Basic Date", "formExampleFull", "Nov 08, 2016");
add("form[Example]FullLong", "Full Date", "formExampleFullLong", "November 08, 2016");
add("form[Example]Day", "Day", "formExampleDay", "08");
add("form[Example]MonthLong", "Month", "formExampleMonthLong", "November");
add("form[Example]MonthShort", "Month Abbreviated", "formExampleMonthShort", "Nov");
add("form[Example]MonthNumber", "Month Number", "formExampleMonthNumber", "11");
add("form[Example]Year", "Year 4 Digits", "formExampleYear", "2016");
add("form[Example]Year2", "Year Last 2 Digits", "formExampleYear2", "16");
add("form[Example]Year1", "Year Last Digit", "formExampleYear1", "6");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} form date tags.`);
