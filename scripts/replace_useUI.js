const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walkDir('c:/Users/roell/Downloads/CS_Hub/Avesdo_CS_Hub/src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        if (filePath.includes('UIContext.tsx') || filePath.includes('useUIStore.ts')) {
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace import
        const importRegex = /import\s+\{\s*useUI\s*\}\s+from\s+['"](.*)context\/UIContext['"];/g;
        if (importRegex.test(content)) {
            content = content.replace(importRegex, 'import { useUIStore } from \'$1store/useUIStore\';');
            modified = true;
        }

        // Replace hook call
        const callRegex = /useUI\(\)/g;
        if (callRegex.test(content)) {
            content = content.replace(callRegex, 'useUIStore()');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated', filePath);
            count++;
        }
    }
});

console.log('Total files updated:', count);
