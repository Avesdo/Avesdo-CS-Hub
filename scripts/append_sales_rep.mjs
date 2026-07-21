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

const salesRepBases = [
  { label: 'Sales Rep', value: 's1' }
];

const addSR = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Sales Rep",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: salesRepBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addSR("ContractName", "Sales Rep's Full Name", "s1ContractName", "Jim Halpert");
addSR("FirstName", "First Name", "s1FirstName", "Jim");
addSR("MiddleName", "Middle Name", "s1MiddleName", "Mario");
addSR("LastName", "Last Name", "s1LastName", "Halpert");
addSR("s", "Signature", "s1s", "Jim's Signature");
addSR("i", "Initial", "s1i", "Jim's Inital");
addSR("Phone", "Home Phone", "s1Phone", "(123) 4567980");
addSR("Email", "Email Address", "s1Email", "jimhalpert@gmail.com");
addSR("Brokerage", "Sales Person's Brokerage", "s1Brokerage", "Remax");
addSR("AgentLicenseNumber", "License information associated with the Sales Rep", "s1AgentLicenseNumber", "DRE1111111");
addSR("BrokerageLicenseNumber", "License information associated with the Brokerages for Sales Rep", "s1BrokerageLicenseNumber", "DRE2222222");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} Sales Rep tags.`);
