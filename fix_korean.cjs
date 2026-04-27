const fs = require('fs');
let c = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

c = c.replace(/desc_ko: "援ш.*?留쏆쭛.*?"/, 'desc_ko: "Google Maps 추천 인기 맛집입니다."');
c = c.replace(/desc_ko: "遺꾩쐞.*?異붿쿇.*?"/, 'desc_ko: "분위기와 맛을 모두 갖춘 현지 추천 장소입니다."');

fs.writeFileSync('src/pages/Itinerary.jsx', c, 'utf8');
console.log('Fixed Korean encoding.');
