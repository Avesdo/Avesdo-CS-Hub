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

const developerBases = [
  { label: 'Developer 1', value: 'd1' },
  { label: 'Developer 2', value: 'd2' },
  { label: 'Developer 3', value: 'd3' },
  { label: 'Developer 4', value: 'd4' },
];

const addD = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Developers",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: developerBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addD("s", "Signature", "d1s", "Developer 1's Signature");
addD("i", "Initial", "d1i", "Developer 1's Inital");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} developer tags.`);
