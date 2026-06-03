'use strict';
const fs = require('fs');

const filePath = './src/pages/Itinerary.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Windows CRLF 정규화 (검색 편의)
const hasCRLF = content.includes('\r\n');

function patch(label, oldStr, newStr) {
    if (content.includes(oldStr)) {
        content = content.replace(oldStr, newStr);
        console.log('OK:', label);
        return true;
    }
    // CRLF 버전으로도 시도
    const oldCRLF = oldStr.replace(/\n/g, '\r\n');
    if (content.includes(oldCRLF)) {
        content = content.replace(oldCRLF, newStr.replace(/\n/g, '\r\n'));
        console.log('OK (CRLF):', label);
        return true;
    }
    console.error('MISS:', label);
    return false;
}

// 1. effectiveData 계산 + displayDestination 수정
patch(
    'effectiveData 추가 + displayDestination 수정',
    `    // Pre-calculate display destination
    useEffect(() => {
        const raw = data.destination || '';
        const id = data.destinationId || '';`,
    `    // sessionData(공유 접속 복원)와 로컬 data를 병합
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const effectiveData = sessionData ? { ...data, ...sessionData } : data;

    // Pre-calculate display destination
    useEffect(() => {
        const raw = effectiveData.destination || '';
        const id = effectiveData.destinationId || '';`
);

// 2. 의존성 배열 교체
patch(
    'displayDestination dependency array',
    `    }, [data.destination, data.destinationId, i18n.language, t]);`,
    `    }, [effectiveData.destination, effectiveData.destinationId, i18n.language, t, sessionData]);`
);

// 3. generate() 내부 data → effectiveData
patch(
    'generate() destination 참조',
    `            if (sessionId) return; // Skip generation if we are loading a shared session
            if (!data.destination) return;
            try {
                const raw = (data.destination || '').toLowerCase().trim();
                const idMatch = (data.destinationId || '').toLowerCase().trim();`,
    `            if (sessionId) return; // Skip generation if we are loading a shared session
            if (!effectiveData.destination) return;
            try {
                const raw = (effectiveData.destination || '').toLowerCase().trim();
                const idMatch = (effectiveData.destinationId || '').toLowerCase().trim();`
);

// 4. storageKey effectiveData 기반으로 교체
patch(
    'storageKey effectiveData',
    'const storageKey = `itinerary_v4_${data.destination}_${data.startDate}_${data.endDate}_${data.vibe}_${data.pace}`;',
    'const storageKey = `itinerary_v4_${effectiveData.destination}_${effectiveData.startDate}_${effectiveData.endDate}_${effectiveData.vibe}_${effectiveData.pace}`;'
);

// 5. 로딩 화면 조건: sessionLoading 추가
patch(
    '로딩 화면 sessionLoading 추가',
    `    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );`,
    `    if (sessionLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">
                🔗 공유 일정을 불러오는 중...
            </div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );

    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );`
);

// 6. displayDestination 렌더 부분에서 data.destination → displayDestination 이미 사용하므로 스킵

fs.writeFileSync(filePath, content, 'utf-8');
console.log('DONE: patch_itinerary.cjs 완료');
