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
    console.error('MISS:', label, '| 첫줄:', oldStr.split('\n')[0].substring(0, 70));
    return false;
}

// 1. import에 prefetchActivityImages 추가
patch(
    'import prefetchActivityImages',
    `import { fetchPlaceImage } from '../utils/imageApi';`,
    `import { fetchPlaceImage, prefetchActivityImages } from '../utils/imageApi';`
);

// 2. 일정 새로 생성 후 프리페치 호출
patch(
    'setItinerary 후 프리페치 호출',
    `                // ?€?€ Text First! Render the itinerary immediately ?€?€
                setItinerary(days);
                saveSearchHistory(data);`,
    `                // 일정 렌더 즉시 (이미지는 백그라운드에서 캐싱)
                setItinerary(days);
                saveSearchHistory(data);
                // 백그라운드에서 모든 활동 이미지를 미리 캐싱 (다음 방문부터 즉시 표시)
                prefetchActivityImages(days, effectiveData.destination).catch(() => {});`
);

// 3. localStorage에서 일정 로드 후에도 프리페치
patch(
    'localStorage 로드 후 프리페치',
    `                    if (parsed && parsed.length > 0) {
                            setItinerary(parsed);
                            return;
                        }`,
    `                    if (parsed && parsed.length > 0) {
                            setItinerary(parsed);
                            // 캐시된 일정도 이미지 프리페치 (아직 캐싱 안 된 항목)
                            prefetchActivityImages(parsed, effectiveData.destination).catch(() => {});
                            return;
                        }`
);

// 4. data.pace → effectiveData.pace (generate() 안에 남아있는 경우)
if (content.includes("data.pace === 'Packed'")) {
    content = content.split("data.pace === 'Packed'").join("effectiveData.pace === 'Packed'");
    console.log('OK: data.pace 교체');
}

// 5. data.destination / data.destinationId 잔여 참조 교체 (img: getImg 등)
const remainingPatterns = [
    ["img: getImg(picks[0].name, 'Food', data.destination, data.destinationId)", 
     "img: getImg(picks[0].name, 'Food', effectiveData.destination, effectiveData.destinationId)"],
    ["img: getImg(next.name, next.type, data.destination, data.destinationId)",
     "img: getImg(next.name, next.type, effectiveData.destination, effectiveData.destinationId)"],
    ["saveSearchHistory(data)",
     "saveSearchHistory(effectiveData)"],
];

for (const [from, to] of remainingPatterns) {
    if (content.includes(from)) {
        content = content.split(from).join(to);
        console.log('OK: 교체 -', from.substring(0, 50));
    } else {
        console.warn('SKIP (없음):', from.substring(0, 50));
    }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\n✅ patch3 완료');
