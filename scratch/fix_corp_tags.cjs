const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/data/localTags.json');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\[identifier\]/g, '[prefix]');

fs.writeFileSync(file, content);
console.log('Fixed Corp tags in localTags.json');
