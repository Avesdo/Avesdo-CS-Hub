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

const newTags = [
  { "id": "deal_1", "category": "Deal Information - Parking", "description": "Parking Included", "tag": "ParkingIncluded", "example": "2" },
  { "id": "deal_2", "category": "Deal Information - Parking", "description": "No. of Additional Parking", "tag": "ParkingExtra", "example": "1" },
  { "id": "deal_3", "category": "Deal Information - Parking", "description": "Price of the Additional Parking", "tag": "ParkingExtraPrice", "example": "20000.00" },
  { "id": "deal_4", "category": "Deal Information - Parking", "description": "X for type of Parking", "tag": "ParkingType[Name]", "example": "ParkingTypeSmall", "isBuilder": true, "builderData": { "type": "suffix" } },

  { "id": "deal_5", "category": "Deal Information - Bike Locker", "description": "Bike Included", "tag": "BikeIncluded", "example": "2" },
  { "id": "deal_6", "category": "Deal Information - Bike Locker", "description": "No. of Additional Bike Locker", "tag": "BikeExtra", "example": "1" },
  { "id": "deal_7", "category": "Deal Information - Bike Locker", "description": "Price of Additional Bike Locker", "tag": "BikeExtraPrice", "example": "3000.00" },
  { "id": "deal_8", "category": "Deal Information - Bike Locker", "description": "X for type of Bike Locker", "tag": "BikeType[Name]", "example": "BikeTypeMedium", "isBuilder": true, "builderData": { "type": "suffix" } },

  { "id": "deal_9", "category": "Deal Information - Storage", "description": "Storage Included", "tag": "StorageIncluded", "example": "2" },
  { "id": "deal_10", "category": "Deal Information - Storage", "description": "No. of Additional Storage Locker", "tag": "StorageExtra", "example": "1" },
  { "id": "deal_11", "category": "Deal Information - Storage", "description": "Price of Additional Storage Locker", "tag": "StorageExtraPrice", "example": "3000.00" },
  { "id": "deal_12", "category": "Deal Information - Storage", "description": "X for type of Storage Locker", "tag": "StorageType[Name]", "example": "StorageTypeSmall", "isBuilder": true, "builderData": { "type": "suffix" } },

  { "id": "deal_13", "category": "Deal Information - Colour Scheme", "description": "Name of Colour Scheme", "tag": "ColourScheme", "example": "Dark" },
  { "id": "deal_14", "category": "Deal Information - Colour Scheme", "description": "X to Select Colour Scheme", "tag": "ColourScheme[Label]", "example": "ColourSchemeDark", "isBuilder": true, "builderData": { "type": "suffix" } },

  { "id": "deal_15", "category": "Deal Information - Options", "description": "Option", "tag": "FormOption[Example]", "example": "FormOptionExample", "isBuilder": true, "builderData": { "type": "suffix" } },
  { "id": "deal_16", "category": "Deal Information - Options", "description": "Price of Option", "tag": "formOption[Example]Price", "example": "formOptionExamplePrice", "isBuilder": true, "builderData": { "type": "suffix-infix" } },

  { "id": "deal_17", "category": "Deal Information - Pricing", "description": "Purchase Price in text form", "tag": "SoldPriceText", "example": "sixty thousand" },
  { "id": "deal_18", "category": "Deal Information - Pricing", "description": "Purchase Price in numbers (listed price)", "tag": "SoldPrice", "example": "60000.00" },
  { "id": "deal_19", "category": "Deal Information - Pricing", "description": "Purchase Price Plus any Upgrades - Credit", "tag": "TotalSoldPrice", "example": "600000.00" },
  { "id": "deal_20", "category": "Deal Information - Pricing", "description": "SoldPrice + ParkingExtraPrice + StorageExtraPrice + BikeExtraPrice - Credit", "tag": "NetOfHst", "example": "5000.00" },
  { "id": "deal_21", "category": "Deal Information - Pricing", "description": "SoldPrice - Credit", "tag": "NetOfHstBase", "example": "5000.00" },

  { "id": "deal_22", "category": "Deal Information - Amounts", "description": "Credit or Decorating Allowance", "tag": "Credit", "example": "5000.00" },
  { "id": "deal_23", "category": "Deal Information - Amounts", "description": "Total Price of all Options", "tag": "UpgradeCost", "example": "5000.00" },
  { "id": "deal_24", "category": "Deal Information - Amounts", "description": "Additional Cost", "tag": "AdditionalCost", "example": "2000.00" },
  { "id": "deal_25", "category": "Deal Information - Amounts", "description": "Assignment Fee", "tag": "AssignmentFee", "example": "7000.00" },

  { "id": "deal_26", "category": "Deal Information - Deposits", "description": "Deposit 1 Amount", "tag": "Deposit1", "example": "10000.00" },
  { "id": "deal_27", "category": "Deal Information - Deposits", "description": "Deposit 2 Amount", "tag": "Deposit2", "example": "20000.00" },
  { "id": "deal_28", "category": "Deal Information - Deposits", "description": "Deposit 3 Amount", "tag": "Deposit3", "example": "3000.00" },
  { "id": "deal_29", "category": "Deal Information - Deposits", "description": "Deposit 4 Amount", "tag": "Deposit4", "example": "4000.00" },
  { "id": "deal_30", "category": "Deal Information - Deposits", "description": "Deposit 5 Amount", "tag": "Deposit5", "example": "5000.00" },
  { "id": "deal_31", "category": "Deal Information - Deposits", "description": "Deposit due on Occupancy Amount", "tag": "DepositOccupancy", "example": "6000.00" },

  { "id": "deal_32", "category": "Deal Information - Commissions", "description": "Realtor Commission First 100k percentage", "tag": "RealtorCom1", "example": "3.00000" },
  { "id": "deal_33", "category": "Deal Information - Commissions", "description": "Realtor Commission Balance percentage", "tag": "RealtorCom2", "example": "2.00000" },
  { "id": "deal_34", "category": "Deal Information - Commissions", "description": "Realtor Commission First 100k Amount", "tag": "RealtorCom1Amount", "example": "3,000.00" },
  { "id": "deal_35", "category": "Deal Information - Commissions", "description": "Realtor Commission Balance Amount", "tag": "RealtorCom2Amount", "example": "8,900.00" },
  { "id": "deal_36", "category": "Deal Information - Commissions", "description": "Realtor Bonus", "tag": "RealtorComLump", "example": "1,000.00" },
  { "id": "deal_37", "category": "Deal Information - Commissions", "description": "Total Realtor Commission including bonus", "tag": "TotalBuyerCom", "example": "12,900.00" },
  { "id": "deal_38", "category": "Deal Information - Commissions", "description": "Realtor is giving some commission to purchaser as credit", "tag": "CreditFromRealtor", "example": "5,000.00" }
];

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log('Appended deal tags.');
