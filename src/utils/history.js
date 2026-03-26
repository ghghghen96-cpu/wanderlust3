/**
 * 검색 이력을 localStorage에 관리하는 유틸리티
 */
const HISTORY_KEY = 'wl_search_history';

export const saveSearchHistory = (surveyData) => {
    if (!surveyData || !surveyData.destination) return;
    try {
        const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        const entry = {
            id: Date.now(),
            destination: surveyData.destination,
            startDate: surveyData.startDate,
            endDate: surveyData.endDate,
            focus: surveyData.focus || [],
            pace: surveyData.pace || '',
            vibe: surveyData.vibe || '',
            dining: surveyData.dining || '',
            savedAt: new Date().toISOString(),
        };
        // 동일 목적지 중복 제거
        const filtered = prev.filter(h => h.destination !== entry.destination);
        // 최신 10개만 유지
        const next = [entry, ...filtered].slice(0, 10);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
        console.error("Failed to save history:", e);
    }
};

export const getSearchHistory = () => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const deleteHistoryEntry = (id) => {
    try {
        const prev = getSearchHistory();
        const next = prev.filter(h => h.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
    } catch {
        return [];
    }
};

export const clearSearchHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
