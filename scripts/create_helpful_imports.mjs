import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importsPath = path.resolve(__dirname, '../src/data/localHelpfulImports.json');
const generateId = () => Math.random().toString(36).substring(2, 9);

const rawData = `All Mandatory Forms - Floral Green - 
Calculation of Realtor Commission for Ontario sites -  - https://app.asana.com/0/search/1201730596446527/1201397764171872
Confirmation of Prescribed Information for Assignment Reporting - Nuvo. - 
CSAIR Assignor and Assignee - Orchard Park - Upload the document twice, naming one Assignor and one Assignee
Tagswapping so that Colour Scheme selection populates initials. - Highpoint, The Holland - Colour Scheme addendum + Parking/Storage section
Corp & Non Corp Amendment Receipt - Format - Third Amendment
Purchaser Residency question for Contract BC - Valeo - in the contract AND under New Deal Set up - Manage APS
FINTRAC Politically Exposed Person - Assignees - Soleil
Non-Canadian Addendum - Townhomes at HighStreet Village - Form questions & Manage APS
TagSwap for Assignne/Assignor - The Loop - Schedule A - Assignee & Assignor
FINTRAC Receipt of Funds - Form Questions - Smith & Farrow
Fintrac Individaul - Form Questions - Floral Green
Table on Amendment Email - Soto on West 28th - Third Amendment
Disclosure of Interest in Trade - Form Questions - BridgeCity
TagSwap for Purchaser info - Soenhaus - Change of Contact Addendum
Net of HST calclulations for Ontario + Alberta - Floral Green - Net of HST calculator: https://connectassetmanagement.com/purchase-price-calculator/
Assignment Agreement with Schedule - Eclipse, Pacific House - If assignor / assignee is corporation, system should pull up the information from the back end directly
Assignment Form 1 - Individual - Amson Bloc - TagSwap through Add Signer`;

const imports = rawData.split('\n').map(line => {
  const parts = line.split(' - ');
  return {
    id: generateId(),
    action: parts[0] ? parts[0].trim() : '',
    project: parts[1] ? parts[1].trim() : '',
    solution: parts[2] ? parts[2].trim() : ''
  };
});

fs.writeFileSync(importsPath, JSON.stringify(imports, null, 2));

console.log(`Created helpful imports JSON with ${imports.length} records.`);
