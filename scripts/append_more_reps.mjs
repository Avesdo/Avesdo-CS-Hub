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
    category: "Deal Participants - Realtors / Sales Reps",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

add("noRealtorNa", "No realtor Not Available populate 'N.A'", "N.A");
add("thereIsNoRealtor", "No Realtor populate 'X'", "X");
add("thereIsRealtor", "There is a Realtor populate 'X'", "X");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} fallback realtor tags.`);
