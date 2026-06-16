import fs from 'fs';
import path from 'path';

const replacers = [
  { match: /bg-green-100 text-green-700/g, replace: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' },
  { match: /bg-red-100 text-red-700/g, replace: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' },
  { match: /bg-red-100 text-red-600/g, replace: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' },
  { match: /bg-orange-100 text-orange-700/g, replace: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20' },
  { match: /bg-orange-100 text-orange-800/g, replace: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20' },
  { match: /bg-blue-100 text-blue-700/g, replace: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' },
  { match: /bg-slate-100 text-slate-700/g, replace: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/20' },
  { match: /bg-emerald-100 text-emerald-700/g, replace: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const replacer of replacers) {
        if (replacer.match.test(content)) {
          content = content.replace(replacer.match, replacer.replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

walk('src');
console.log('Done.');
