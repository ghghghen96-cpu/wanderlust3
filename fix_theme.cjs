const fs = require('fs');
let c = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

const replacements = [
  ["bg-[#0f1117] border-b border-white/10 sticky top-[80px] z-40","bg-white border-b border-gray-100 shadow-sm sticky top-[80px] z-40"],
  ["bg-white/10 rounded-xl group-hover:bg-white/20 transition-all","bg-gray-50 rounded-xl group-hover:bg-amber-50 transition-all"],
  ['className="text-white"/>', 'className="text-gray-600"/>'],
  ["font-extrabold text-xl text-white","font-extrabold text-xl text-gray-900"],
  ["flex bg-white/10 p-1 rounded-xl","flex bg-gray-100 p-1 rounded-xl"],
  ["w-[35%] flex flex-col bg-[#13161f] border-r border-white/10 overflow-hidden","w-[35%] flex flex-col bg-gray-50 border-r border-gray-100 overflow-hidden"],
  ['className="px-4 py-3 border-b border-white/5">','className="px-4 py-3 border-b border-gray-100 bg-white">'],
  ['className="text-white font-black text-sm">','className="text-gray-900 font-black text-sm">'],
];

replacements.forEach(([from, to]) => {
  if (c.includes(from)) { c = c.replace(from, to); console.log('OK:', from.slice(0,40)); }
  else { console.warn('NOT FOUND:', from.slice(0,40)); }
});

fs.writeFileSync('src/pages/Itinerary.jsx', c, 'utf8');
console.log('Done');
