const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'pages', 'SupportDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the indices of each block
const frictionStart = content.indexOf('{/* High-Friction Sources (Horizontal Stacked Bar) */}');
const workloadStart = content.indexOf('{/* 3. Dynamic Workload Matrix (Scatter Plot) */}');
const quadrantStart = content.indexOf('{/* Time & Effort Quadrant */}');

// The end of quadrant is basically where the main div closes. 
// It's followed by </div> </div> </main> </div> </div>
const quadrantEnd = content.indexOf('</div>\r\n          </div>\r\n        </main>');
if (quadrantEnd === -1) {
    console.error('Could not find end of quadrant block');
    process.exit(1);
}

const frictionBlock = content.substring(frictionStart, workloadStart);
const workloadBlock = content.substring(workloadStart, quadrantStart);
const quadrantBlock = content.substring(quadrantStart, quadrantEnd);

// Rearrange
const newContent = content.substring(0, frictionStart) + 
                   quadrantBlock + 
                   frictionBlock + 
                   workloadBlock + 
                   content.substring(quadrantEnd);

fs.writeFileSync(filePath, newContent);
console.log('Successfully reordered charts!');
