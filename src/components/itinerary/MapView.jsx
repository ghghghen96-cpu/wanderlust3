import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Search, X, Star, Coffee, Utensils, Navigation, Loader } from 'lucide-react';

// Google Maps Silver 커스텀 스타일 (밝고 세련된 느낌)
const MAP_STYLE_SILVER = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d5e8d4' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4a7c59' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a90b8' }] },
];

const MARKER_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) { resolve(window.google.maps); return; }
        if (document.getElementById('google-maps-script')) {
            const check = setInterval(() => {
                if (window.google && window.google.maps) { clearInterval(check); resolve(window.google.maps); }
            }, 100);
            return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error('Google Maps 로드 실패'));
        document.head.appendChild(script);
    });
};

const MapView = ({ dayItems = [], activeDayIndex = 0, destination = '', onAddPlace }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);
    const searchServiceRef = useRef(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showNearby, setShowNearby] = useState(false);
    const [searchType, setSearchType] = useState('restaurant');

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
    const validItems = dayItems.filter(it => it.latitude && it.longitude);

    // ── 지도 초기화 ──
    useEffect(() => {
        let cancelled = false;

        if (!GOOGLE_API_KEY) {
            setMapError("구글 지도 API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
            return;
        }

        loadGoogleMapsScript(GOOGLE_API_KEY)
            .then((maps) => {
                if (cancelled || !mapRef.current) return;
                const center = validItems.length > 0
                    ? { lat: validItems[0].latitude, lng: validItems[0].longitude }
                    : { lat: 33.4996, lng: 126.5312 }; // 제주 기본값

                const map = new maps.Map(mapRef.current, {
                    center,
                    zoom: 13,
                    styles: MAP_STYLE_SILVER,
                    disableDefaultUI: true,
                    zoomControl: true,
                    zoomControlOptions: { position: maps.ControlPosition.RIGHT_CENTER },
                    gestureHandling: 'greedy',
                });
                mapInstanceRef.current = map;
                searchServiceRef.current = new maps.places.PlacesService(map);
                setMapLoaded(true);
            })
            .catch((err) => { if (!cancelled) setMapError(err.message); });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── 마커 + Polyline ──
    useEffect(() => {
        if (!mapLoaded || !mapInstanceRef.current || !window.google) return;
        const maps = window.google.maps;
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        if (polylineRef.current) { polylineRef.current.setMap(null); polylineRef.current = null; }
        if (validItems.length === 0) return;

        const coords = [];
        validItems.forEach((item, idx) => {
            const pos = { lat: item.latitude, lng: item.longitude };
            coords.push(pos);
            const color = MARKER_COLORS[idx % MARKER_COLORS.length];
            const svgMarker = {
                url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='44'><circle cx='18' cy='18' r='16' fill='${encodeURIComponent(color)}' stroke='white' stroke-width='3'/><text x='18' y='23' text-anchor='middle' fill='white' font-size='13' font-weight='bold' font-family='Arial'>${idx + 1}</text><polygon points='18,42 11,30 25,30' fill='${encodeURIComponent(color)}'/></svg>`,
                scaledSize: new maps.Size(36, 44),
                anchor: new maps.Point(18, 44),
            };
            const marker = new maps.Marker({ position: pos, map: mapInstanceRef.current, icon: svgMarker, title: item.name, zIndex: idx + 1 });
            const infoWindow = new maps.InfoWindow({
                content: `<div style="padding:10px 14px;border-radius:10px;min-width:160px;font-family:sans-serif;"><div style="font-weight:900;font-size:14px;margin-bottom:4px;color:#1e293b;">${item.name}</div><div style="font-size:11px;color:#64748b;">${item.time || ''} · ${item.type || ''}</div></div>`,
            });
            marker.addListener('click', () => infoWindow.open(mapInstanceRef.current, marker));
            markersRef.current.push(marker);
        });

        if (coords.length > 1) {
            const lineSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 };
            polylineRef.current = new maps.Polyline({
                path: coords, geodesic: true, strokeOpacity: 0,
                icons: [{ icon: lineSymbol, offset: '0', repeat: '16px' }],
                strokeColor: '#f59e0b', map: mapInstanceRef.current,
            });
        }

        if (coords.length > 1) {
            const bounds = new maps.LatLngBounds();
            coords.forEach(c => bounds.extend(c));
            mapInstanceRef.current.fitBounds(bounds, { top: 60, right: 40, bottom: 80, left: 40 });
        } else if (coords.length === 1) {
            mapInstanceRef.current.panTo(coords[0]);
            mapInstanceRef.current.setZoom(15);
        }
    }, [mapLoaded, JSON.stringify(validItems.map(i => `${i.latitude},${i.longitude}`))]);

    // ── 근처 장소 검색 ──
    const searchNearby = useCallback(() => {
        if (!mapInstanceRef.current || !searchServiceRef.current) return;
        setSearchLoading(true);
        setShowNearby(true);
        setNearbyPlaces([]);
        const center = mapInstanceRef.current.getCenter();
        searchServiceRef.current.nearbySearch(
            { location: center, radius: 800, type: searchType },
            (results, status) => {
                setSearchLoading(false);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    setNearbyPlaces(results.slice(0, 6));
                }
            }
        );
    }, [searchType]);

    const handleAddNearby = useCallback((place) => {
        if (!onAddPlace) return;
        onAddPlace(activeDayIndex, {
            id: `nearby-${Date.now()}-${Math.random()}`,
            name: place.name,
            type: searchType === 'restaurant' ? 'Food' : 'Cafe',
            time: '12:00',
            desc: place.vicinity || '',
            latitude: place.geometry?.location?.lat(),
            longitude: place.geometry?.location?.lng(),
            rating: place.rating,
            img: null,
            isNew: true,
        });
    }, [onAddPlace, activeDayIndex, searchType]);

    return (
        // 핵심: 부모가 flex이므로 h-full + w-full 명시
        <div className="relative w-full h-full" style={{ minHeight: 0 }}>
            {/* 지도 DOM - 반드시 position absolute + inset-0 으로 부모를 꽉 채움 */}
            <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

            {/* 로딩 오버레이 */}
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm font-semibold">지도 불러오는 중...</p>
                    </div>
                </div>
            )}

            {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="text-center p-6">
                        <MapPin className="text-amber-400 mx-auto mb-3" size={32} />
                        <p className="text-gray-600 font-bold text-sm">{mapError}</p>
                    </div>
                </div>
            )}

            {/* 근처 장소 검색 버튼 */}
            {mapLoaded && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                    <div className="flex bg-white/95 backdrop-blur-md rounded-full p-1 shadow-xl border border-gray-100">
                        {[
                            { type: 'restaurant', icon: Utensils, label: '맛집' },
                            { type: 'cafe', icon: Coffee, label: '카페' },
                        ].map(({ type, icon: Icon, label }) => (
                            <button key={type} onClick={() => setSearchType(type)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${searchType === type ? 'bg-amber-400 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}>
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>
                    <button onClick={searchNearby} disabled={searchLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 font-black text-sm rounded-full shadow-xl border border-gray-100 hover:bg-amber-400 hover:text-white hover:border-amber-400 transition-all active:scale-95 disabled:opacity-70">
                        {searchLoading ? <Loader size={15} className="animate-spin" /> : <Navigation size={15} />}
                        이 근처 장소 추가하기
                    </button>
                </div>
            )}

            {/* 근처 장소 결과 패널 */}
            <AnimatePresence>
                {showNearby && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                        className="absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-100 rounded-t-3xl z-20 max-h-[50%] overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-amber-500" />
                                <span className="text-gray-800 font-black text-sm">근처 {searchType === 'restaurant' ? '맛집' : '카페'}</span>
                                {nearbyPlaces.length > 0 && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">{nearbyPlaces.length}개</span>}
                            </div>
                            <button onClick={() => setShowNearby(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        {searchLoading && (
                            <div className="flex items-center justify-center py-10 gap-3">
                                <Loader size={18} className="text-amber-400 animate-spin" />
                                <span className="text-gray-500 text-sm">검색 중...</span>
                            </div>
                        )}
                        {!searchLoading && nearbyPlaces.length > 0 && (
                            <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                                {nearbyPlaces.map((place, idx) => (
                                    <div key={place.place_id || idx} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            {searchType === 'restaurant' ? <Utensils size={18} className="text-amber-500" /> : <Coffee size={18} className="text-amber-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-800 font-bold text-sm truncate">{place.name}</p>
                                            <p className="text-gray-400 text-xs truncate">{place.vicinity}</p>
                                            {place.rating && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Star size={10} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-amber-500 text-xs font-bold">{place.rating}</span>
                                                    {place.user_ratings_total && <span className="text-gray-400 text-xs">({place.user_ratings_total.toLocaleString()})</span>}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleAddNearby(place)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 hover:bg-amber-400 hover:text-white transition-all shrink-0">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!searchLoading && nearbyPlaces.length === 0 && showNearby && (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <Search size={24} className="text-gray-300" />
                                <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MapView;
