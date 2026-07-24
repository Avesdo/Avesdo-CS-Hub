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
    category: "EFT Receipts",
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

add("EftPaymentDepositIssuedDate", "Eft Payment Deposit Issued Date", "45453");
add("EftPaymentDepositAmount", "Eft Payment Deposit Amount", "19245");
add("EftPaymentDepositDueDate", "Eft Payment Deposit Due Date", "45443");
add("EftPaymentDepositNumber", "Eft Payment Deposit Number", "2");
add("EftPaymentStatementDescription", "Eft Payment Statement Description", "AzureGSL3D2");
add("EftPaymentDepositAccountHolderName", "Eft Payment Deposit Account Holder Name", "Jane Doe");
add("EftPaymentDepositBuildingName", "Eft Payment Deposit Building Name", "Azure Grove");
add("EftPaymentDepositDeveloperName", "Eft Payment Deposit Developer Name", "ML Emporio Properties");
add("EftPaymentDepositPurchaserName", "Eft Payment Deposit Purchaser Name", "Jane Doe");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} EFT tags.`);
