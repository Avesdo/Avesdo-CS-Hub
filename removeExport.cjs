const fs = require('fs');
let code = fs.readFileSync('src/utils/exportUtils.ts', 'utf8');

const targetIndex = code.indexOf('export const exportFullDatabaseToJSON = async () => {');
if (targetIndex !== -1) {
  code = code.substring(0, targetIndex);
  fs.writeFileSync('src/utils/exportUtils.ts', code);
}
