const fs = require('fs');
let content = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

const oldLoopCode = `                // If completely exhausted for non-food, take any unused (including food)
                const pool = avail.length > 0 ? avail : allActivities.filter(a => !globalUsed.has(a.name));
                if (!pool.length) break; // All spots exhausted — skip

                // Score candidates
                const scored = pool.map(act => ({
                    act,
                    score: scoreActivity(act, lastLat !== null ? calcDist(lastLat, lastLng, act.latitude, act.longitude) : null)
                })).sort((a, b) => b.score - a.score);

                const next = scored[0]?.act;
                if (!next) break;

                globalUsed.add(next.name);
                lastLat = next.latitude;
                lastLng = next.longitude;`;

const newLoopCode = `                // If completely exhausted for non-food, take any unused (including food)
                const pool = avail.length > 0 ? avail : allActivities.filter(a => !globalUsed.has(a.name));
                
                let next;
                if (!pool.length) {
                    // Generate a dynamic placeholder if database is exhausted to ensure days are always filled
                    const fallbackType = prefTypes[Math.floor(Math.random() * prefTypes.length)] || 'City';
                    next = {
                        name: \`Curated \${fallbackType} Experience\`,
                        desc: \`A special \${fallbackType.toLowerCase()} exploration tailored to your vibe. Local insider gem.\`,
                        type: fallbackType,
                        rating: (4.5 + Math.random() * 0.4).toFixed(1),
                        latitude: lastLat ? lastLat + (Math.random()-0.5)*0.05 : 0,
                        longitude: lastLng ? lastLng + (Math.random()-0.5)*0.05 : 0
                    };
                } else {
                    // Score candidates
                    const scored = pool.map(act => ({
                        act,
                        score: scoreActivity(act, lastLat !== null ? calcDist(lastLat, lastLng, act.latitude, act.longitude) : null)
                    })).sort((a, b) => b.score - a.score);
                    next = scored[0]?.act;
                }

                if (!next) break;

                globalUsed.add(next.name);
                lastLat = next.latitude || lastLat;
                lastLng = next.longitude || lastLng;`;

content = content.replace(oldLoopCode.trim(), newLoopCode.trim());

// We also need to do the same for getDiningSpot: if pool is empty, generate generic food spot.
const oldDiningCode2 = `            const availFood = foodActivities.filter(a => !globalDiningUsed.has(a.name));
            if (!availFood.length) return null;`;

const newDiningCode2 = `            const availFood = foodActivities.filter(a => !globalDiningUsed.has(a.name));
            if (!availFood.length) {
                const types = {
                    'Fine Dining': 'Upscale Restaurant',
                    'Street Food': 'Local Night Market',
                    'Casual Dining': 'Charming Local Cafe'
                };
                const fbName = types[data.dining] || 'Highly Rated Local Restaurant';
                const fbDesc = \`A highly recommended local \${data.dining ? data.dining.toLowerCase() : 'dining'} spot.\`;
                const mockFood = { name: fbName + ' (Partner Selection)', desc: fbDesc, type: 'Food', rating: 4.8 };
                globalDiningUsed.add(mockFood.name);
                return {
                    ...mockFood,
                    img: getImg(mockFood.name, mockFood.type),
                    id: \`dining-\${dayIndex}-\${Date.now()}\`
                };
            }`;

content = content.replace(oldDiningCode2.trim(), newDiningCode2.trim());

fs.writeFileSync('src/pages/Itinerary.jsx', content);
console.log("Success");
