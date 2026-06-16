const fs = require('fs');

function peek(file, rows) {
    const data = fs.readFileSync(file, 'utf8');
    const lines = data.split('\n');
    console.log(`=== ${file} ===`);
    for(let i = 0; i < Math.min(rows, lines.length); i++) {
        console.log(lines[i]);
    }
}

peek("Userpilot_Sessions Started.csv", 3);
peek("Userpilot_Page Views.csv", 3);
