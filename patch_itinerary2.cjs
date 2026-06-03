'use strict';
const fs = require('fs');

const filePath = './src/pages/Itinerary.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

function patch(label, oldStr, newStr) {
    if (content.includes(oldStr)) {
        content = content.replace(oldStr, newStr);
        console.log('OK:', label);
        return true;
    }
    const oldCRLF = oldStr.replace(/\n/g, '\r\n');
    if (content.includes(oldCRLF)) {
        content = content.replace(oldCRLF, newStr.replace(/\n/g, '\r\n'));
        console.log('OK (CRLF):', label);
        return true;
    }
    // 일부만 매칭 시도 (첫 줄 포함 여부 확인)
    const firstLine = oldStr.split('\n')[0];
    console.error('MISS:', label, '| 첫줄:', firstLine.substring(0, 80));
    return false;
}

// 1. CollaborationPanel에 activeUsers prop 전달
patch(
    'CollaborationPanel activeUsers prop',
    `<CollaborationPanel isOpen={collabOpen} onClose={() => setCollabOpen(false)} sessionId={sessionId} user={currentUser} />`,
    `<CollaborationPanel isOpen={collabOpen} onClose={() => setCollabOpen(false)} sessionId={sessionId} user={currentUser} activeUsers={activeUsers} />`
);

// 2. generate() 함수 내 data.destination → effectiveData.destination 추가 패치
// (식당 추천, storage 등에서 data.destination이 남아있는 경우)
// getMealRecommendation 내부 data.destination 참조 교체
const meal1 = "                            const descMain = `🏆 추천: ${best.name}${ratingStars ? ' ' + ratingStars : ''}${reviewText ? ' ' + reviewText : ''}`;";
const meal2 = "                                { name: `${data.destination} Popular ${mealType}`, type: 'Food', rating: 4.8 },";
const meal3 = "                                { name: `${data.destination} Local Favorite`, type: 'Food', rating: 4.7 },";

if (content.includes(meal2)) {
    content = content
        .replace(meal2, `                                { name: \`\${effectiveData.destination} Popular \${mealType}\`, type: 'Food', rating: 4.8 },`)
        .replace(meal3, `                                { name: \`\${effectiveData.destination} Local Favorite\`, type: 'Food', rating: 4.7 },`);
    console.log('OK: getMealRecommendation destination 교체');
} else {
    console.warn('SKIP: getMealRecommendation (이미 교체됐거나 없음)');
}

// 3. generate() 내 data.destination / data.dining / data.pace / data.vibe 참조 교체
// (일정 생성 함수 전체 안에서 data. 참조 → effectiveData.)
// 안전하게 특정 패턴만 교체
const genPatterns = [
    ['`${data.destination} Popular', '`${effectiveData.destination} Popular'],
    ['`${data.destination} Local', '`${effectiveData.destination} Local'],
    ["data.dining || 'Casual'", "effectiveData.dining || 'Casual'"],
    ['BASE_PER_DAY[data.pace]', 'BASE_PER_DAY[effectiveData.pace]'],
    ["['Chill', 'Chill Wanderer'].includes(data.vibe)", "['Chill', 'Chill Wanderer'].includes(effectiveData.vibe)"],
    ["['Active', 'Active Explorer'].includes(data.vibe)", "['Active', 'Active Explorer'].includes(effectiveData.vibe)"],
    ['VIBE_PREFS[data.vibe]', 'VIBE_PREFS[effectiveData.vibe]'],
    ['Array.isArray(data.focus) ? data.focus : []', 'Array.isArray(effectiveData.focus) ? effectiveData.focus : []'],
    ['Array.isArray(data.dining) ? data.dining : [data.dining', 'Array.isArray(effectiveData.dining) ? effectiveData.dining : [effectiveData.dining'],
    ["data.dining || 'preferred'", "effectiveData.dining || 'preferred'"],
    ['data.dining', 'effectiveData.dining'],
];

for (const [from, to] of genPatterns) {
    if (content.includes(from)) {
        content = content.split(from).join(to);
        console.log('OK: 교체 -', from.substring(0, 40));
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\nDONE: patch2 완료');
