const fs = require('fs');

const file = 'c:\\Users\\ghghg\\Desktop\\ai-travel-planner\\src\\pages\\Itinerary.jsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/data\.destinationId/g, 'effectiveData.destinationId');

content = content.replace(/getImg\(best\.name, 'Food', data\.destination/g, "getImg(best.name, 'Food', effectiveData.destination");
content = content.replace(/picks\[0\]\.name \+ ' ' \+ data\.destination/g, "picks[0].name + ' ' + effectiveData.destination");

content = content.replace(/flights_v2_\$\{data\.destination\}/g, "flights_v2_${effectiveData.destination}");
content = content.replace(/hotels_v2_\$\{data\.destination\}/g, "hotels_v2_${effectiveData.destination}");
content = content.replace(/\[flights, data\.destination, sessionId\]/g, "[flights, effectiveData.destination, sessionId]");
content = content.replace(/\[hotels, data\.destination, sessionId\]/g, "[hotels, effectiveData.destination, sessionId]");

fs.writeFileSync(file, content, 'utf-8');
console.log('patched');
