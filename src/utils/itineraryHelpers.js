import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

// 카테고리별 기본 이미지 라이브러리
export const IMAGE_LIBRARY = {
    food: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800", "https://images.unsplash.com/photo-1626804475297-411db142642a?q=80&w=800"],
    nature: ["https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800", "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800"],
    city: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800"],
    culture: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800", "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800", "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800"],
    relax: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"],
    market: ["https://images.unsplash.com/photo-1533920143825-963ad2b4122d?q=80&w=800"],
    tower: ["https://images.unsplash.com/photo-1572589028889-d584346e339b?q=80&w=800"],
    park: ["https://images.unsplash.com/photo-1513889961551-628c115e2eb3?q=80&w=800"],
    default: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
};

export const DEST_IMAGES = {
    seoul: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800",
    tokyo: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800",
    osaka: "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=800",
    bangkok: "https://images.unsplash.com/photo-1504214208698-ea1919a23562?q=80&w=800",
    bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    singapore: "https://images.unsplash.com/photo-1525625232747-076121f17671?q=80&w=800",
    paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
    london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800",
    rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800",
    barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800",
    newyork: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800",
    sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
    taipei: "https://images.unsplash.com/photo-1552233319-39956247343e?q=80&w=800",
    danang: "https://images.unsplash.com/photo-1559592442-7e182c9403db?q=80&w=800",
    beijing: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800",
    hongkong: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=800",
    jeju: "https://images.unsplash.com/photo-1544483389-947833f2cfdf?q=80&w=800"
};

export const getImg = (name = '', type = '', dest = '', destId = '') => {
    const n = name.toLowerCase();
    let destKey = destId ? destId.toLowerCase().trim() : null;
    
    if (!destKey || !DEST_IMAGES[destKey]) {
        const lowerDest = dest.toLowerCase();
        destKey = Object.keys(DEST_IMAGES).find(k => lowerDest.includes(k));
    }
    
    if (destKey && DEST_IMAGES[destKey] && (n.includes('landmark') || Math.random() > 0.1)) {
        return DEST_IMAGES[destKey];
    }

    if (n.includes('market')) return IMAGE_LIBRARY.market[0];
    if (n.includes('tower') || n.includes('tree') || n.includes('skytree')) return IMAGE_LIBRARY.tower[0];
    if (n.includes('park') || n.includes('garden')) return IMAGE_LIBRARY.park[0];
    
    const arr = IMAGE_LIBRARY[type.toLowerCase()];
    if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
    
    return IMAGE_LIBRARY.default;
};

export const safeFormat = (date, fmt, locale) => {
    if (!date) return '';
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return format(d, fmt, { locale });
    } catch (e) {
        console.error("Format error:", e);
        return '';
    }
};

export const calcDist = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const fmtTime = (t) => t || '09:00';

export const getDayMapUrl = (items, destination) => {
    if (!items || items.length === 0) return '';
    const base = 'https://www.google.com/maps/dir/?api=1';
    const origin = encodeURIComponent(items[0].name + ' ' + (destination || ''));
    const dest = encodeURIComponent(items[items.length - 1].name + ' ' + (destination || ''));
    const waypoints = items.slice(1, -1).map(i => encodeURIComponent(i.name + ' ' + (destination || ''))).join('|');
    return `${base}&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
};
