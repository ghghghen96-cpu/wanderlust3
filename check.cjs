const fs = require('fs');
let c = fs.readFileSync('./src/pages/Itinerary.jsx', 'utf-8');
const a = c.includes('Array.isArray(effectiveData.dining)');
const b = c.includes('Array.isArray(data.dining)');
fs.writeFileSync('./patch_check.txt', 'effectiveData patched: ' + a + '\noriginal data.dining: ' + b, 'utf-8');
