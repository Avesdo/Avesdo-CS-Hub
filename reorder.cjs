const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'SupportDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const frictionStart = content.indexOf('{/* High-Friction Sources');
const workloadStart = content.indexOf('{/* 3. Dynamic Workload');
const quadrantStart = content.indexOf('{/* Time & Effort Quadrant */}');
const endPos = content.lastIndexOf('        </div>', content.lastIndexOf('  );\n}'));

if (frictionStart === -1 || workloadStart === -1 || quadrantStart === -1 || endPos === -1) {
    console.error('Could not find all blocks');
    process.exit(1);
}

const frictionBlock = content.substring(frictionStart, workloadStart);
const workloadBlock = content.substring(workloadStart, quadrantStart);
const quadrantBlock = content.substring(quadrantStart, endPos);

const newContent = content.substring(0, frictionStart) + 
                   quadrantBlock + 
                   frictionBlock + 
                   workloadBlock + 
                   content.substring(endPos);

fs.writeFileSync(filePath, newContent);
console.log('Successfully reordered charts!');
