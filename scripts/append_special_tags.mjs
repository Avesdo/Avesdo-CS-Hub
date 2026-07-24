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

const add = (category, tag, desc, exVal) => {
  newTags.push({
    id: generateId(),
    category: category,
    description: desc,
    tag: tag,
    example: exVal,
    isBuilder: false
  });
}

// Special Tags
add("Special Tags", "CXContractName", "Name of All Purchasers, Separated With 'and'", "Bob Dylan and John Louis and Jane Arthur");
add("Special Tags", "_", "Space (e.g. C1ContractName_C1Address)", "John Smith 1367 Broadway");
add("Special Tags", ",", "Slash (e.g. C1ContractName,C2ContractName)", "John Smith/Jane Doe");
add("Special Tags", "Addendum", "Blank Addendum (data the client fill out while using form)", "");
add("Special Tags", "CountPurchaser", "Number of Purchasers", "2");
add("Special Tags", "CountRealtor", "Number of Realtors", "1");
add("Special Tags", "CountAssignee", "Number of Assignees", "1");

// Prefixes
add("Logic Prefixes - Spacing & Text", "B[1-9]_", "Blank Spaces (e.g. c1Unit_B3_c1Street)", "32     Main Street");
add("Logic Prefixes - Spacing & Text", "text_", "Hard Coding Text (e.g. text_Test)", "Test");

add("Logic Prefixes - Numbers & Currency", "fn0_", "Whole Number", "1,000,000");
add("Logic Prefixes - Numbers & Currency", "fn2_", "2 Decimal Places", "1,000,000.35");
add("Logic Prefixes - Numbers & Currency", "fnr_", "Round up", "1,23,456");
add("Logic Prefixes - Numbers & Currency", "fnr2_", "Round up and add 2 Decimal Places", "1,23,456.00");
add("Logic Prefixes - Numbers & Currency", "fc0_", "Whole Number with $", "$1,000,000");
add("Logic Prefixes - Numbers & Currency", "fc2_", "2 Decimal Places with $", "$1,000,000.35");
add("Logic Prefixes - Numbers & Currency", "fcr_", "Round up while also adding $", "$12,346");
add("Logic Prefixes - Numbers & Currency", "fcr2_", "Round up to add 2 Decimal Places and $", "$12,346.00");
add("Logic Prefixes - Numbers & Currency", "fupper_", "Spell a Number in Upper Case", "ONE MILLION");
add("Logic Prefixes - Numbers & Currency", "fspell_", "Spell a Number in Lower Case", "one million");
add("Logic Prefixes - Numbers & Currency", "fspellnumber_", "Number in Text with Numeric Beside", "TWO (2)");
add("Logic Prefixes - Numbers & Currency", "fnumberspell_", "Numeric with Number in Text Beside", "2 (TWO)");
add("Logic Prefixes - Numbers & Currency", "fnr2upper_", "Round up and Spell in Upper case", "ONE MILLION");

add("Logic Prefixes - Advanced", "math_", "Math Function (must have space between all tags)", "math_( ParkingExtraPrice + SoldPrice ) - Credit");
add("Logic Prefixes - Advanced", "logic_", "Conditional Logic (e.g. logic_BikeExtra > 0 ? text_X : B1)", "X");

tags = tags.concat(newTags);
fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));

console.log(`Appended ${newTags.length} special tags.`);
