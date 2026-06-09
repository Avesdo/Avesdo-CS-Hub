const xlsx = require('xlsx');

const workbook = xlsx.readFile('Developer & Marketing Org Projects.xlsx');
console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
    console.log(`\nSheet: ${name}`);
    const sheet = workbook.Sheets[name];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Headers:', data[0]);
    console.log('Row 1:', data[1]);
});
