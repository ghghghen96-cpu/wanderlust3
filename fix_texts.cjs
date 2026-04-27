const fs = require('fs');
let c = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

c = c.replace(/name: t\(`itinerary\.meal\$\{mealType\}`\) \|\| `\$\{mealType\} Recommendation`,/, "name: t(`meal${mealType}`, { defaultValue: `${mealType} Recommendation` }),");
c = c.replace(/desc: `\?뜶 \$\{t\('itinerary\.mealOptionTitle'\)\}:\\n1\. \$\{picks\[0\]\.name\} \(\$\{picks\[0\]\.rating\}\?\?\\n2\. \$\{picks\[1\]\.name\} \(\$\{picks\[1\]\.rating\}\?\?\\n\\n\?뱧 \$\{t\('itinerary\.mealSource'\)\}`,/, "desc: `- ${t('mealOptionTitle') || 'Meal Options'}:\\n1. ${picks[0].name} (${picks[0].rating} / 5.0)\\n2. ${picks[1].name} (${picks[1].rating} / 5.0)\\n\\n* ${t('mealSource') || 'Data from Google Places'}`,");
c = c.replace(/desc_ko: `\?뜶 \$\{t\('itinerary\.mealOptionTitle'\)\}:\\n1\. \$\{picks\[0\]\.name_ko \|\| picks\[0\]\.name\} \(\$\{picks\[0\]\.rating\}\?\?\\n2\. \$\{picks\[1\]\.name_ko \|\| picks\[1\]\.name\} \(\$\{picks\[1\]\.rating\}\?\?\\n\\n\?뱧 \$\{t\('itinerary\.mealSource'\)\}`,/, "desc_ko: `- ${t('mealOptionTitle') || '식사 옵션'}:\\n1. ${picks[0].name_ko || picks[0].name} (${picks[0].rating} / 5.0)\\n2. ${picks[1].name_ko || picks[1].name} (${picks[1].rating} / 5.0)\\n\\n* ${t('mealSource') || 'Google Maps 기반 추천'}`,");

c = c.replace(/\{safeFormat\(data\.startDate,'MMM dd',i18n\.language==='ko'\?ko:enUS\)\} \?\?\{safeFormat\(data\.endDate,'MMM dd',i18n\.language==='ko'\?ko:enUS\)\} 쨌 \{t\('days',\{count:itinerary\.length\}\)\}/, "{safeFormat(data.startDate,'MMM dd',i18n.language==='ko'?ko:enUS)} - {safeFormat(data.endDate,'MMM dd',i18n.language==='ko'?ko:enUS)} | {t('days',{count:itinerary.length, defaultValue: itinerary.length + ' days'})}");

c = c.replace(/<p className="text-gray-500 text-xs">\{\(activeDay\.items\|\|\[\]\)\.length\}媛\?\?μ냼<\/p>/, '<p className="text-gray-500 text-xs">{(activeDay.items||[]).length} places</p>');

fs.writeFileSync('src/pages/Itinerary.jsx', c, 'utf8');
console.log('Fixed remaining text issues');
