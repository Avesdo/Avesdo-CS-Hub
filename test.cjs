const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'SupportDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log("High-Friction: ", content.indexOf('{/* High-Friction Sources'));
console.log("Dynamic Workload: ", content.indexOf('{/* 3. Dynamic Workload'));
console.log("Time & Effort: ", content.indexOf('{/* Time & Effort Quadrant */'));
console.log("Dashboard End: ", content.indexOf('</main>'));

