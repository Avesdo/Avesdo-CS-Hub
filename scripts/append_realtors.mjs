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

const realtorBases = [
  { label: 'Realtor 1', value: 'r1' },
  { label: 'Realtor 2', value: 'r2' }
];

const addR = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Realtors",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: realtorBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addR("ContractName", "Realtor's Full Name Name", "r1ContractName", "Jim Halpert");
addR("FirstName", "First Name", "r1FirstName", "Jim");
addR("MiddleName", "Middle Name", "r1MiddleName", "Mario");
addR("LastName", "Last Name", "r1LastName", "Halpert");
addR("s", "Signature", "r1s", "Jim's Signature");
addR("i", "Initial", "r1i", "Jim's Inital");
addR("UnitNumber", "Unit Number", "r1UnitNumber", "352");
addR("Street", "Street Address", "r1Street", "1367 West Broadway");
addR("City", "City", "r1City", "Vancouver");
addR("Province", "Province", "r1Province", "BC");
addR("FullProvince", "Province in Full", "r1FullProvince", "British Columbia");
addR("Country", "Country", "r1Country", "Canada");
addR("PostalCode", "Postal Code", "r1PostalCode", "V8H 5J6");
addR("Address", "Full Address", "r1Address", "35 - 1367 West Broadway, Vancouver BC, V6H B3L");
addR("AddressShort", "Basic Address", "r1AddressShort", "35 - 1367 West Broadway");
addR("Phone", "Home Phone", "r1Phone", "(123) 4567980");
addR("PhoneExt", "Extension", "r1PhoneExt", "ext.123");
addR("BusinessPhone", "Brokerage Phone Number", "r1BusinessPhone", "(456) 7891230");
addR("BusinessPhoneExt", "Brokerage Extension", "r1BusinessPhoneExt", "ext.456");
addR("Email", "Email Address", "r1Email", "jimhalpert@gmail.com");
addR("Brokerage", "Realtor's Brokerage", "r1Brokerage", "Remax");
addR("GSTNumber", "Realtor's Brokerage GST Number (BC Sites)", "r1GSTNumber", "132 456");
addR("HSTNumber", "Realtor's Brokerage HST Number (ON Sites)", "r1HSTNumber", "132 456");
addR("TaxNumber", "Realtor's Brokerage Tax Number (US Sites)", "r1TaxNumber", "132 456");
addR("AgentLicenseNumber", "License information associated with the Realtor", "r1AgentLicenseNumber", "DRE1111111");
addR("BrokerageLicenseNumber", "License information associated with the Brokerages", "r1BrokerageLicenseNumber", "DRE2222222");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} realtor tags.`);
