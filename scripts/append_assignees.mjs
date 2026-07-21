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

const assigneeBases = [
  { label: 'Assignor 1 (Form)', value: 'FromAssignor1' },
  { label: 'Assignor 2 (Form)', value: 'FromAssignor2' },
  { label: 'Assignor 3 (Form)', value: 'FromAssignor3' },
  { label: 'Assignee 1 (Form)', value: 'FromAssignee1' },
  { label: 'Assignee 2 (Form)', value: 'FromAssignee2' },
  { label: 'Assignee 3 (Form)', value: 'FromAssignee3' },
  { label: 'Assignee 1 (Participants)', value: 'o1' },
  { label: 'Assignee 2 (Participants)', value: 'o2' },
  { label: 'Assignee 3 (Participants)', value: 'o3' },
];

const assigneeWitnessBases = [
  { label: 'Assignor Witness 1 (Form)', value: 'FromAssignor1W' },
  { label: 'Assignor Witness 2 (Form)', value: 'FromAssignor2W' },
  { label: 'Assignor Witness 3 (Form)', value: 'FromAssignor3W' },
  { label: 'Assignee Witness 1 (Form)', value: 'FromAssignee1W' },
  { label: 'Assignee Witness 2 (Form)', value: 'FromAssignee2W' },
  { label: 'Assignee Witness 3 (Form)', value: 'FromAssignee3W' },
  { label: 'Assignee Witness 1 (Participants)', value: 'v1' },
  { label: 'Assignee Witness 2 (Participants)', value: 'v2' },
  { label: 'Assignee Witness 3 (Participants)', value: 'v3' },
];

const addA = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Assignees/Assignors",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: assigneeBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addA("ContractName", "Purchaser's Full Name Or Corporation Name", "FromAssignee1ContractName", "Jim Halpert");
addA("TitleMr", "X mark", "FromAssignee1TitleMr", "X");
addA("TitleMiss", "X mark", "FromAssignee1TitleMiss", "X");
addA("TitleMs", "X mark", "FromAssignee1TitleMs", "X");
addA("TitleMrs", "X mark", "FromAssignee1TitleMrs", "X");
addA("Title", "Text form of title", "FromAssignee1Title", "Mr");
addA("FirstName", "First Name", "FromAssignee1FirstName", "Jim");
addA("MiddleName", "Middle Name", "FromAssignee1MiddleName", "Mario");
addA("LastName", "Last Name", "FromAssignee1LastName", "Halpert");
addA("s", "Signature", "FromAssignee1s", "Jim's Signature");
addA("i", "Initial", "FromAssignee1i", "Jim's Inital");
addA("UnitNumber", "Unit Number", "FromAssignee1UnitNumber", "352");
addA("Street", "Street Address", "FromAssignee1Street", "1367 West Broadway");
addA("City", "City", "FromAssignee1City", "Vancouver");
addA("Province", "Province", "FromAssignee1Province", "BC");
addA("FullProvince", "Province in Full", "FromAssignee1FullProvince", "British Columbia");
addA("Country", "Country", "FromAssignee1Country", "Canada");
addA("PostalCode", "Postal Code", "FromAssignee1PostalCode", "V8H 5J6");
addA("Address", "Full Address", "FromAssignee1Address", "35 - 1367 West Broadway, Vancouver BC, V6H B3L");
addA("AddressShort", "Basic Address", "FromAssignee1AddressShort", "35 - 1367 West Broadway");
addA("Phone", "Home Phone", "FromAssignee1Phone", "(123) 4567980");
addA("PhoneExt", "Extension", "FromAssignee1PhoneExt", "ext.123");
addA("BusinessPhone", "Company Phone Number", "FromAssignee1BusinessPhone", "(456) 7891230");
addA("BusinessPhoneExt", "Company Extension", "FromAssignee1BusinessPhoneExt", "ext.456");
addA("Email", "Email Address", "FromAssignee1Email", "jimhalpert@gmail.com");
addA("Birthday", "Date of Birth", "FromAssignee1Birthday", "Aug 20, 1993");
addA("Business", "the person's occupation", "FromAssignee1Business", "Manager");
addA("Sin", "SIN Number", "FromAssignee1Sin", "123 456 789");
addA("IsCanadian", "Checkbox mark for the person is Canadian", "FromAssignee1IsCanadian", "X");
addA("IsCanadianNot", "Checkbox mark for the person is not Canadian", "FromAssignee1IsCanadianNot", "X");
addA("Citizenship", "\"Canadian Citizen\" & \"Permanent Resident\" is  \"Canada\", Others shown the value of citizenship/residency.", "FromAssignee1Citizenship", "Canada");
addA("IdType", "First Id type", "FromAssignee1IdType", "Drivers License");
addA("IdNumber", "the First Id Number", "FromAssignee1IdNumber", "6456436");
addA("IdExpire", "First Id Expiry", "FromAssignee1IdExpire", "January 08, 2021");
addA("IdType2", "Second Id type", "FromAssignee1IdType2", "Passport");
addA("IdNumber2", "the second Id Number", "FromAssignee1IdNumber2", "564 156 7");
addA("IdExpire2", "Second Id Expiry", "FromAssignee1IdExpire2", "May 19, 2039");
addA("CorpSigner", "If it is corporation, \"Per: \" + FirstName + middleName + lastname, otherwise, it is empty.", "FromAssignee1CorpSigner", "Per: Jim Matthew Halpert");

const addAW = (tag, desc, exTag, exVal) => {
  newTags.push({
    id: generateId(),
    category: "Deal Participants - Assignee/Assignor Witnesses",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: true,
    builderData: {
      bases: assigneeWitnessBases,
      type: 'suffix',
      exampleCombo: exTag
    }
  });
}

addAW("s", "Signature", "FromAssignor1Ws", "Assignor 1's Witness' Signature");
addAW("i", "Initial", "FromAssignor1Wi", "Assignor 1's Witness' Inital");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} assignee/assignor tags.`);
