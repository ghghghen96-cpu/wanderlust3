const fs = require('fs');
let content = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

const oldVibeCode = `        // ── [CONSTRAINT 3] Vibe & Focus scoring weights ────────────────────────
        const VIBE_PREFS = {
            'Chill': ['Relax', 'Nature', 'Culture'],
            'Chill Wanderer': ['Relax', 'Nature', 'Culture'],
            'Active': ['Nature', 'City', 'Culture'],
            'Active Explorer': ['Nature', 'City', 'Culture'],
            'Social': ['City', 'Food', 'Culture'],
            'Spontaneous': ['City', 'Food', 'Culture'],
            'Quiet': ['Nature', 'Relax', 'Culture'],
        };
        const prefTypes = VIBE_PREFS[data.vibe] || [];
        const focusTypes = Array.isArray(data.focus) ? data.focus : [];

        // ── Scoring function: higher = pick first ─────────────────────────────
        const scoreActivity = (act, distKm) => {
            let score = 0;
            // Base: rating
            score += (act.rating || 4.0) * 10;
            // Focus match gives highest boost
            if (focusTypes.some(f => act.type?.toLowerCase().includes(f.toLowerCase()))) score += 30;
            // Vibe/preference match
            if (prefTypes.includes(act.type)) score += 20;
            // Geo-proximity bonus (closer = higher score). 0km = +50, 10km = +25, 20km+ = 0
            if (distKm !== null) score += Math.max(0, 50 - distKm * 2.5);
            // Small random jitter for variety
            score += Math.random() * 5;
            return score;
        };`;

const newVibeCode = `        // ── [CONSTRAINT 3] Vibe, Focus & Style scoring weights ───────────────
        const VIBE_BOOST = {
            'Chill': ['Relax', 'Nature'],
            'Active': ['City', 'Nature'],
            'Cultural': ['Culture', 'City']
        };
        const prefTypes = VIBE_BOOST[data.vibe] || [];
        const focusTypes = Array.isArray(data.focus) ? data.focus : [];

        // ── Scoring function: higher = pick first ─────────────────────────────
        const scoreActivity = (act, distKm) => {
            let score = 0;
            // Base: rating
            score += (act.rating || 4.0) * 10;
            
            // Focus match gives highest boost
            if (focusTypes.some(f => act.type?.toLowerCase().includes(f.toLowerCase()))) score += 40;
            
            // Vibe match
            if (prefTypes.includes(act.type)) score += 30;

            // Exploration matching: if Spontaneous, boost Relax/Nature. If Planned, boost Culture/City
            if (data.exploration === 'Spontaneous' && ['Relax', 'Nature'].includes(act.type)) score += 15;
            if (data.exploration === 'Planned' && ['Culture', 'City'].includes(act.type)) score += 15;

            // Geo-proximity bonus: 0km = +50, 10km = +25, 20km+ = 0
            if (distKm !== null) {
                // Adjust distance penalty based on pace. Relaxed pace heavily penalizes distance, packed tolerates it.
                const distWeight = data.pace === 'Packed' ? 1.5 : (data.pace === 'Relaxed' ? 3.5 : 2.5);
                score += Math.max(0, 50 - distKm * distWeight);
            }

            // Small random jitter
            score += Math.random() * 5;
            return score;
        };`;

content = content.replace(oldVibeCode.trim(), newVibeCode.trim());

const oldDiningCode = `        // ── [CONSTRAINT 5] Dining injection based on dining preference ──────────
        const DINING_SPOTS = {
            'Fine Dining': [
                { name: 'Fine Dining Dinner', desc: 'Michelin-rated or top-tier restaurant experience for the evening.', type: 'Food', rating: 4.9 },
                { name: 'Upscale Lunch', desc: 'Premium lunch at a top local restaurant.', type: 'Food', rating: 4.8 },
            ],
            'Street Food': [
                { name: 'Local Street Food Tour', desc: 'Explore authentic local flavours at street stalls.', type: 'Food', rating: 4.7 },
                { name: 'Night Market Eats', desc: 'Evening feast at a popular local night market.', type: 'Food', rating: 4.6 },
            ],
            'Cafe Culture': [
                { name: 'Specialty Coffee & Brunch', desc: 'Start the day with an artisan coffee and brunch.', type: 'Food', rating: 4.7 },
                { name: 'Afternoon Cafe', desc: 'A relaxing stop at a charming local cafe.', type: 'Food', rating: 4.6 },
            ],
        };
        const diningSlots = DINING_SPOTS[data.dining] || [];
        const globalDiningUsed = new Set();

        const getDiningSpot = (dayIndex) => {
            const slot = diningSlots.find(d => !globalDiningUsed.has(d.name)) || null;
            if (slot) globalDiningUsed.add(slot.name);
            return slot ? {
                ...slot,
                img: getImg(slot.name, slot.type),
                id: \`dining-\${dayIndex}-\${Date.now()}\`
            } : null;
        };`;

const newDiningCode = `        // ── [CONSTRAINT 5] Dining injection based on actual database ──────────
        const globalDiningUsed = new Set();
        const foodActivities = allActivities.filter(a => a.type === 'Food');

        const getDiningSpot = (dayIndex, lat, lng) => {
            const availFood = foodActivities.filter(a => !globalDiningUsed.has(a.name));
            if (!availFood.length) return null;

            const scoredFood = availFood.map(food => {
                let s = (food.rating || 4.0) * 10;
                
                const desc = (food.desc || '').toLowerCase();
                const nm = (food.name || '').toLowerCase();
                if (data.dining === 'Fine Dining' && (desc.includes('fine') || desc.includes('michelin') || desc.includes('upscale') || desc.includes('elegant') || nm.includes('fine'))) s += 40;
                if (data.dining === 'Street Food' && (desc.includes('street') || desc.includes('market') || nm.includes('market') || desc.includes('stall') || desc.includes('night') || desc.includes('authentic'))) s += 40;
                if (data.dining === 'Casual Dining' && (desc.includes('cafe') || desc.includes('casual') || nm.includes('cafe') || desc.includes('bistro') || desc.includes('pub') || desc.includes('brunch'))) s += 40;

                if (lat !== null && lng !== null) {
                    const dist = calcDist(lat, lng, food.latitude, food.longitude);
                    s += Math.max(0, 40 - dist * 2);
                }
                
                s += Math.random() * 5;
                return { food, score: s };
            }).sort((a, b) => b.score - a.score);

            const bestFood = scoredFood[0]?.food;
            if (bestFood) {
                globalDiningUsed.add(bestFood.name);
                return {
                    ...bestFood,
                    img: getImg(bestFood.name, bestFood.type),
                    id: \`dining-\${dayIndex}-\${Date.now()}\`
                };
            }
            return null;
        };`;

content = content.replace(oldDiningCode.trim(), newDiningCode.trim());

const oldInjectCode = `const diningSpot = getDiningSpot(i);`;
const newInjectCode = `const diningSpot = getDiningSpot(i, lastLat, lastLng);`;

content = content.replace(oldInjectCode, newInjectCode);

fs.writeFileSync('src/pages/Itinerary.jsx', content);
console.log("Success");
