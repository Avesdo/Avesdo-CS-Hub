import * as glob from 'glob';
import fs from 'fs';

const files = glob.globSync('src/**/*.{tsx,ts}', { absolute: true });

let totalMatches = 0;
const elementTypes = new Map();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Match elements with className containing "truncate"
  const regex = /<([a-zA-Z0-9]+)[^>]*className=(?:"[^"]*\btruncate\b[^"]*"|'[^']*\btruncate\b[^']*'|{[^}]*\btruncate\b[^}]*})[^>]*>/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    totalMatches++;
    const el = match[1];
    elementTypes.set(el, (elementTypes.get(el) || 0) + 1);
  }
}

console.log(`Total truncate matches: ${totalMatches}`);
console.log('Element types:');
for (const [el, count] of elementTypes.entries()) {
  console.log(`- ${el}: ${count}`);
}
