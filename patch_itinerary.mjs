import { readFileSync, writeFileSync } from 'fs';

const filePath = './src/pages/Itinerary.jsx';
let content = readFileSync(filePath, 'utf-8');

// ────────────────────────────────────────────────────────────
// 1. displayDestination useEffect 앞에 effectiveData 계산 삽입
// ────────────────────────────────────────────────────────────
const DISPLAY_OLD = `    // Pre-calculate display destination
    useEffect(() => {
        const raw = data.destination || '';
        const id = data.destinationId || '';`;

const DISPLAY_NEW = `    // sessionData(공유 접속 복원)와 로컬 data를 병합
    const effectiveData = sessionData ? { ...data, ...sessionData } : data;

    // Pre-calculate display destination
    useEffect(() => {
        const raw = effectiveData.destination || '';
        const id = effectiveData.destinationId || '';`;

if (!content.includes(DISPLAY_OLD)) {
    console.error('❌ DISPLAY_OLD 블록을 찾지 못했습니다.');
    process.exit(1);
}
content = content.replace(DISPLAY_OLD, DISPLAY_NEW);

// ────────────────────────────────────────────────────────────
// 2. displayDestination dependency array 교체
//    [data.destination, data.destinationId, ...] → effectiveData 기반
// ────────────────────────────────────────────────────────────
const DEP_OLD = `    }, [data.destination, data.destinationId, i18n.language, t]);`;
const DEP_NEW = `    }, [effectiveData.destination, effectiveData.destinationId, i18n.language, t, sessionData]);`;

if (!content.includes(DEP_OLD)) {
    console.error('❌ DEP_OLD 블록을 찾지 못했습니다.');
    process.exit(1);
}
content = content.replace(DEP_OLD, DEP_NEW);

// ────────────────────────────────────────────────────────────
// 3. generate() 함수 안의 data.destination → effectiveData.destination 치환
//    (세션 접속 시에도 DESTINATION_DATA 매칭이 작동하도록)
// ────────────────────────────────────────────────────────────
const GEN_OLD = `            if (sessionId) return; // Skip generation if we are loading a shared session
            if (!data.destination) return;
            try {
                const raw = (data.destination || '').toLowerCase().trim();
                const idMatch = (data.destinationId || '').toLowerCase().trim();`;

const GEN_NEW = `            if (sessionId) return; // Skip generation if we are loading a shared session
            if (!effectiveData.destination) return;
            try {
                const raw = (effectiveData.destination || '').toLowerCase().trim();
                const idMatch = (effectiveData.destinationId || '').toLowerCase().trim();`;

if (content.includes(GEN_OLD)) {
    content = content.replace(GEN_OLD, GEN_NEW);
    console.log('✅ generate() 내부 data → effectiveData 교체 완료');
} else {
    console.warn('⚠️  GEN_OLD 블록을 찾지 못했습니다 (이미 적용됐을 수 있음)');
}

// ────────────────────────────────────────────────────────────
// 4. storageKey 계산도 effectiveData 기반으로 교체
// ────────────────────────────────────────────────────────────
const KEY_OLD = `    const storageKey = \`itinerary_v4_\${data.destination}_\${data.startDate}_\${data.endDate}_\${data.vibe}_\${data.pace}\`;`;
const KEY_NEW = `    const storageKey = \`itinerary_v4_\${effectiveData.destination}_\${effectiveData.startDate}_\${effectiveData.endDate}_\${effectiveData.vibe}_\${effectiveData.pace}\`;`;

if (content.includes(KEY_OLD)) {
    content = content.replace(KEY_OLD, KEY_NEW);
    console.log('✅ storageKey effectiveData 교체 완료');
} else {
    console.warn('⚠️  KEY_OLD 블록을 찾지 못했습니다');
}

// ────────────────────────────────────────────────────────────
// 5. 로딩 화면 조건 수정: sessionLoading 상태도 처리
// ────────────────────────────────────────────────────────────
const LOAD_OLD = `    if (!destData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-6">
            <Navbar />
            <div className="text-2xl font-black text-secondary animate-pulse mt-20">{t('curating')}</div>
            <AdPlaceholder className="w-full max-w-2xl h-[250px] shadow-sm" />
        </div>
    );`;

const LOAD_NEW = `    if (sessionLoading) return (
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
    );`;

if (content.includes(LOAD_OLD)) {
    content = content.replace(LOAD_OLD, LOAD_NEW);
    console.log('✅ 로딩 화면 조건 수정 완료');
} else {
    console.warn('⚠️  LOAD_OLD 블록을 찾지 못했습니다');
}

// ────────────────────────────────────────────────────────────
// 6. displayDestination 사용처도 effectiveData 기반으로 교체
//    (destination 표시 변수들)
// ────────────────────────────────────────────────────────────

// 일정 생성 함수 내부의 data.destination 참조들 (식당 추천 등)
// 여기선 generate() 안에 있는 data.destination들만 교체 (storage key 제외)
// 이미 effectiveData로 변경된 generate() 내부는 패스

writeFileSync(filePath, content, 'utf-8');
console.log('✅ 패치 완료: src/pages/Itinerary.jsx');
