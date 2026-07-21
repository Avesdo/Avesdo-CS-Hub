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

// Base Definitions
const purchaserBases = [
  { label: 'Purchaser 1', value: 'c1' },
  { label: 'Purchaser 2', value: 'c2' },
  { label: 'Purchaser 3', value: 'c3' },
  { label: 'Purchaser 4', value: 'c4' },
];

const witnessBases = [
  { label: 'Witness 1', value: 'w1' },
  { label: 'Witness 2', value: 'w2' },
];

const addP = (tag, desc, exTag, exVal) => {
  let type = 'suffix'; 
  let prefix = '';
  let suffix = '';
  
  if (exTag === 'NonCorpc1s') {
    type = 'wrap';
    prefix = 'NonCorp';
    suffix = 's';
  } else if (exTag === 'Corpc1s') {
    type = 'wrap';
    prefix = 'Corp';
    suffix = 's';
  }

  newTags.push({
    id: generateId(),
    category: "Deal Participants - Purchasers",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: purchaserBases,
      type: type,
      prefix,
      suffix,
      exampleCombo: exTag
    }
  });
}

addP("ContractName", "Purchaser's Full Name Or Corporation Name", "c1ContractName", "Jim Halpert");
addP("TitleMr", "X mark", "c1TitleMr", "X");
addP("TitleMiss", "X mark", "c1TitleMiss", "X");
addP("TitleMs", "X mark", "c1TitleMs", "X");
addP("TitleMrs", "X mark", "c1TitleMrs", "X");
addP("Title", "Text form of title", "c1Title", "Mr");
addP("FirstName", "First Name", "c1FirstName", "Jim");
addP("MiddleName", "Middle Name", "c1MiddleName", "Mario");
addP("LastName", "Last Name", "c1LastName", "Halpert");
addP("s", "Signature", "c1s", "Jim's Signature");
addP("i", "Initial", "c1i", "Jim's Inital");
addP("UnitNumber", "Unit Number", "c1UnitNumber", "352");
addP("Street", "Street Address", "c1Street", "1367 West Broadway");
addP("City", "City", "c1City", "Vancouver");
addP("Province", "Province", "c1Province", "BC");
addP("FullProvince", "Province in Full", "c1FullProvince", "British Columbia");
addP("Country", "Country", "c1Country", "Canada");
addP("PostalCode", "Postal Code", "c1PostalCode", "V8H 5J6");
addP("Address", "Full Address", "c1Address", "35 - 1367 West Broadway, Vancouver BC, V6H B3L");
addP("AddressShort", "Basic Address", "c1AddressShort", "35 - 1367 West Broadway");
addP("Phone", "Home Phone", "c1Phone", "(123) 4567980");
addP("PhoneExt", "Extension", "c1PhoneExt", "ext.123");
addP("BusinessPhone", "Company Phone Number", "c1BusinessPhone", "(456) 7891230");
addP("BusinessPhoneExt", "Company Extension", "c1BusinessPhoneExt", "ext.456");
addP("Email", "Email Address", "c1Email", "jimhalpert@gmail.com");
addP("Birthday", "Date of Birth", "c1Birthday", "Aug 20, 1993");
addP("Business", "the person's occupation", "c1Business", "Manager");
addP("Sin", "SIN Number", "c1Sin", "123 456 789");
addP("IsCanadian", "Checkbox mark for the person is Canadian", "c1IsCanadian", "X");
addP("IsCanadianNot", "Checkbox mark for the person is not Canadian", "c1IsCanadianNot", "X");
addP("Citizenship", "\"Canadian Citizen\" & \"Permanent Resident\" is  \"Canada\", Others shown the value of citizenship/residency.", "c1Citizenship", "Canada");
addP("IdType", "First Id type", "c1IdType", "Drivers License");
addP("IdNumber", "the First Id Number", "c1IdNumber", "6456436");
addP("IdExpire", "First Id Expiry", "c1IdExpire", "January 08, 2021");
addP("IdType2", "Second Id type", "c1IdType2", "Passport");
addP("IdNumber2", "the second Id Number", "c1IdNumber2", "564 156 7");
addP("IdExpire2", "Second Id Expiry", "c1IdExpire2", "May 19, 2039");
addP("NonCorpName", "If it is a corporation, it is empty otherwise, FirstName + MiddleName + LastName", "c1NonCorpName", "Jim Matthew Halpert");
addP("NonCorps", "If it is a corporation, it is empty otherwise signature", "NonCorpc1s", "Jim's Signature");
addP("CorpName", "If it is corporation, the name of corporation, otherwise, it is empty.", "c1CorpName", "Sold By Services Ltd.");
addP("Corps", "If it is a corporation, signature otherwise it is empty", "Corpc1s", "Jim's Signature");
addP("CorpSigner", "If it is corporation, \"Per: \" + FirstName + middleName + lastname, otherwise, it is empty.", "c1CorpSigner", "Per: Jim Matthew Halpert");


const addW = (tag, desc, exTag, exVal) => {
  let type = 'suffix';
  let prefix = '';
  let suffix = '';

  if (exTag === 'Noncorpw1s') {
    type = 'wrap';
    prefix = 'Noncorp';
    suffix = 's';
  } else if (exTag === 'Corpw1s') {
    type = 'wrap';
    prefix = 'Corp';
    suffix = 's';
  }

  newTags.push({
    id: generateId(),
    category: "Deal Participants - Witnesses",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: witnessBases,
      type: type,
      prefix,
      suffix,
      exampleCombo: exTag
    }
  });
}

addW("s", "Signature", "w1s", "Purchaser 1's Witness' Signature");
addW("i", "Initial", "w1i", "Purchaser 1's Witness' Inital");
addW("Noncorps", "If it is a corporation, it is empty otherwise witness signature", "Noncorpw1s", "Purchaser 1's Witness' Signature");
addW("Corps", "If it is a corporation, witness signature otherwise it is empty", "Corpw1s", "Purchaser 1's Witness' Signature");


tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} deal participant tags.`);
