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

const purchaserBases = [
  { label: 'Purchaser 1', value: 'c1' },
  { label: 'Purchaser 2', value: 'c2' },
  { label: 'Purchaser 3', value: 'c3' },
  { label: 'Purchaser 4', value: 'c4' },
];

const addP = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Purchasers",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: purchaserBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addP("-contractsigneddate", "Date of contract signing (populates only if doc added after contract signed)", "c1-contractsigneddate", "Nov 08, 2016");
addP("-contractsigneddatetime", "Date & Time of contract signing", "c1-contractsigneddatetime", "Nov 08, 2016 02:30");

const addLogic = (tag, desc, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Logic Prefixes - Date & Time",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

addLogic("future_[signature]_", "Future Date Trigger (e.g. future_c1s_DateFull)", "future_c1s_DateFull");
addLogic("future_[signature]_[format]_", "Future Date Trigger with Format (e.g. future_c1s_fdatemonth_DateFull)", "future_c1s_fdatemonth_DateFull");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} future date tags.`);
