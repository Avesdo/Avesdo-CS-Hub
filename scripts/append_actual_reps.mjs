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

add("actualRepName", "Sales Person or Realtor's Name (Fallback logic)", "Jim Halpert");
add("actualBrokerage", "Sales Person or Realtor's Brokerage (Fallback logic)", "Remax");
add("actualRepSign", "Sales Person or Realtor's Signature (Fallback logic)", "Jim's Signature");


tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} fallback tags.`);
