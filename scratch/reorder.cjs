const fs = require('fs');

const localTagsPath = 'src/data/localTags.json';
const tags = JSON.parse(fs.readFileSync(localTagsPath, 'utf-8'));

const listingTags = [];
const dealInfoTags = [];
const dealPartTags = [];
const datesTags = [];
const specialTags = [];
const formatingTags = [];
const otherTags = [];

for (const t of tags) {
  const p = t.category.split(' - ')[0];
  if (p === 'Listing Information') listingTags.push(t);
  else if (p === 'Deal Information') dealInfoTags.push(t);
  else if (p === 'Deal Participants') dealPartTags.push(t);
  else if (p === 'Dates') datesTags.push(t);
  else if (p === 'Special') specialTags.push(t);
  else if (p === 'Formating Tags') formatingTags.push(t);
  else otherTags.push(t);
}

const finalTags = [
  ...listingTags,
  ...dealInfoTags,
  ...dealPartTags,
  ...datesTags,
  ...specialTags,
  ...formatingTags,
  ...otherTags
];

fs.writeFileSync(localTagsPath, JSON.stringify(finalTags, null, 2));
console.log('Reordered successfully!');
