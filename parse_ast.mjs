import * as parser from '@babel/parser';
import fs from 'fs';

const code = fs.readFileSync('c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src/pages/SupportDashboard.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  console.log('Successfully parsed!');
} catch (e) {
  console.log('Parse error:', e.message);
  console.log('Location:', e.loc);
}
