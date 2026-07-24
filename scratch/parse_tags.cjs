const fs = require('fs');

const html = fs.readFileSync('scratch/deal_tags.html', 'utf-8');

// Regex to find sections and their tables
const sectionsRegex = /<p><strong>(\d+(?:\.\d+)?)\.\s+([^<]+)<\/strong><\/p>(.*?(?=(?:<p><strong>\d+(?:\.\d+)?\.\s+[^<]+<\/strong><\/p>)|$))/g;

let match;
let newTags = [];
let idCounter = 1785000000000;
const prefixes = {};

const categoryMapping = {
  '1. Purchasers': 'Deal Participants - Purchasers',
  '1.1. Purchaser\'s Witnesses': 'Deal Participants - Purchasers - Witnesses',
  '2. Realtors': 'Deal Participants - Realtors',
  '3. Sales Rep': 'Deal Participants - Sales Rep',
  '4. Realtor or Sales Rep': 'Deal Participants - Realtor or Sales Rep',
  '5. Developers': 'Deal Participants - Developers',
  '6. Assignors': 'Deal Participants - Assignors',
  '6.1. Assignor Witnesses': 'Deal Participants - Assignors - Witnesses',
  '7. Assignees': 'Deal Participants - Assignees',
  '7.1. Assignee Witnesses': 'Deal Participants - Assignees - Witnesses',
  '8. Managing Broker': 'Deal Participants - Managing Broker',
  '9. Guarantors': 'Deal Participants - Guarantors',
  '10. Transferor': 'Deal Participants - Transferor'
};

function parseTableRows(tableHtml) {
  const rows = [];
  const tbodyMatch = tableHtml.match(/<tbody>(.*?)<\/tbody>/);
  if (!tbodyMatch) return rows;
  const trs = tbodyMatch[1].match(/<tr>(.*?)<\/tr>/g) || [];
  for (let tr of trs) {
    const tds = [...tr.matchAll(/<td>(.*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (tds.length > 0) rows.push(tds);
  }
  return rows;
}

while ((match = sectionsRegex.exec(html)) !== null) {
  const sectionNum = match[1];
  let sectionTitle = match[2].trim();
  const content = match[3];

  if (sectionNum === '1.1' && sectionTitle.includes('Witnesses')) {
    sectionTitle = "Purchaser's Witnesses";
  }

  const sectionKey = `${sectionNum}. ${sectionTitle}`;
  const category = categoryMapping[sectionKey];
  if (!category) {
    console.log("No category mapping found for: " + sectionKey);
    continue;
  }

  const tables = [...content.matchAll(/<table>(.*?)<\/table>/g)].map(m => m[1]);
  let mergeFieldsTable = null;
  let prefixesTable = null;

  if (tables.length === 2) {
    prefixesTable = tables[0];
    mergeFieldsTable = tables[1];
  } else if (tables.length === 1) {
    mergeFieldsTable = tables[0];
  }

  if (prefixesTable) {
    const pRows = parseTableRows(prefixesTable);
    prefixes[sectionTitle] = pRows.map(row => ({ label: row[0], value: row[1] }));
  }

  if (mergeFieldsTable) {
    const tRows = parseTableRows(mergeFieldsTable);
    for (let row of tRows) {
      if (row.length >= 3) { // Base Tag, Description, Example Tag, Example Value
        const baseTag = row[0];
        const description = row[1];
        const example = row.length >= 4 ? row[3] : row[2];
        newTags.push({
          id: `tag-${idCounter++}`,
          tag: baseTag,
          description: description,
          example: example,
          category: category
        });
      }
    }
  }
}

// Write the updated prefixes out so we can inspect
fs.writeFileSync('scratch/new_prefixes.json', JSON.stringify(prefixes, null, 2));

// Read localTags.json, replace all Deal Participant tags
const localTagsPath = 'src/data/localTags.json';
let localTags = JSON.parse(fs.readFileSync(localTagsPath, 'utf-8'));

const filteredTags = localTags.filter(t => !t.category.startsWith('Deal Participants - '));
const finalTags = [...filteredTags, ...newTags];

fs.writeFileSync('scratch/updated_tags.json', JSON.stringify(finalTags, null, 2));
console.log('Successfully generated tags!');
console.log('Total old tags:', localTags.length);
console.log('Total new Deal Participant tags:', newTags.length);
console.log('Total tags after merge:', finalTags.length);

