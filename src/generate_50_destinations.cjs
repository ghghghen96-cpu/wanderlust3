const fs = require('fs');
const path = require('path');

const destinations = [
    // Chunk 5: Europe 1
    { id: 'uk_edinburgh', name: 'UK (Edinburgh)', country: 'UK', type: 'Culture', lat: 55.9533, lng: -3.1883 },
    { id: 'spain_madrid', name: 'Spain (Madrid)', country: 'Spain', type: 'City', lat: 40.4168, lng: -3.7038 },
    { id: 'spain_seville', name: 'Spain (Seville)', country: 'Spain', type: 'Culture', lat: 37.3891, lng: -5.9845 },
    { id: 'italy_venice', name: 'Italy (Venice)', country: 'Italy', type: 'Relax', lat: 45.4408, lng: 12.3155 },
    { id: 'italy_florence', name: 'Italy (Florence)', country: 'Italy', type: 'Culture', lat: 43.7696, lng: 11.2558 },
    { id: 'italy_milan', name: 'Italy (Milan)', country: 'Italy', type: 'City', lat: 45.4642, lng: 9.1900 },
    { id: 'france_nice', name: 'France (Nice)', country: 'France', type: 'Relax', lat: 43.7102, lng: 7.2620 },
    { id: 'germany_berlin', name: 'Germany (Berlin)', country: 'Germany', type: 'City', lat: 52.5200, lng: 13.4050 },
    { id: 'germany_munich', name: 'Germany (Munich)', country: 'Germany', type: 'Culture', lat: 48.1351, lng: 11.5820 },
    { id: 'netherlands_amsterdam', name: 'Netherlands (Amsterdam)', country: 'Netherlands', type: 'Relax', lat: 52.3676, lng: 4.9041 },

    // Chunk 6: Europe 2
    { id: 'belgium_brussels', name: 'Belgium (Brussels)', country: 'Belgium', type: 'Culture', lat: 50.8503, lng: 4.3517 },
    { id: 'austria_vienna', name: 'Austria (Vienna)', country: 'Austria', type: 'Culture', lat: 48.2082, lng: 16.3738 },
    { id: 'czech_prague', name: 'Czech Republic (Prague)', country: 'Czech Republic', type: 'Culture', lat: 50.0755, lng: 14.4378 },
    { id: 'hungary_budapest', name: 'Hungary (Budapest)', country: 'Hungary', type: 'Relax', lat: 47.4979, lng: 19.0402 },
    { id: 'greece_athens', name: 'Greece (Athens)', country: 'Greece', type: 'Culture', lat: 37.9838, lng: 23.7275 },
    { id: 'greece_santorini', name: 'Greece (Santorini)', country: 'Greece', type: 'Relax', lat: 36.3932, lng: 25.4615 },
    { id: 'portugal_lisbon', name: 'Portugal (Lisbon)', country: 'Portugal', type: 'Relax', lat: 38.7223, lng: -9.1393 },
    { id: 'portugal_porto', name: 'Portugal (Porto)', country: 'Portugal', type: 'Culture', lat: 41.1579, lng: -8.6291 },
    { id: 'turkey_istanbul', name: 'Turkey (Istanbul)', country: 'Turkey', type: 'Culture', lat: 41.0082, lng: 28.9784 },
    { id: 'croatia_dubrovnik', name: 'Croatia (Dubrovnik)', country: 'Croatia', type: 'Relax', lat: 42.6507, lng: 18.0944 },

    // Chunk 7: Americas
    { id: 'usa_losangeles', name: 'USA (Los Angeles)', country: 'USA', type: 'City', lat: 34.0522, lng: -118.2437 },
    { id: 'usa_sanfrancisco', name: 'USA (San Francisco)', country: 'USA', type: 'City', lat: 37.7749, lng: -122.4194 },
    { id: 'usa_lasvegas', name: 'USA (Las Vegas)', country: 'USA', type: 'City', lat: 36.1699, lng: -115.1398 },
    { id: 'canada_toronto', name: 'Canada (Toronto)', country: 'Canada', type: 'City', lat: 43.6510, lng: -79.3470 },
    { id: 'canada_vancouver', name: 'Canada (Vancouver)', country: 'Canada', type: 'Nature', lat: 49.2827, lng: -123.1207 },
    { id: 'mexico_mexicocity', name: 'Mexico (Mexico City)', country: 'Mexico', type: 'Culture', lat: 19.4326, lng: -99.1332 },
    { id: 'mexico_cancun', name: 'Mexico (Cancun)', country: 'Mexico', type: 'Relax', lat: 21.1619, lng: -86.8515 },
    { id: 'brazil_rio', name: 'Brazil (Rio de Janeiro)', country: 'Brazil', type: 'Nature', lat: -22.9068, lng: -43.1729 },
    { id: 'argentina_buenosaires', name: 'Argentina (Buenos Aires)', country: 'Argentina', type: 'Culture', lat: -34.6037, lng: -58.3816 },
    { id: 'peru_cusco', name: 'Peru (Cusco)', country: 'Peru', type: 'Culture', lat: -13.5226, lng: -71.9675 },

    // Chunk 8: Asia / Middle East
    { id: 'taiwan_taipei', name: 'Taiwan (Taipei)', country: 'Taiwan', type: 'City', lat: 25.0330, lng: 121.5654 },
    { id: 'hongkong', name: 'Hong Kong', country: 'Hong Kong', type: 'City', lat: 22.3193, lng: 114.1694 },
    { id: 'macau', name: 'Macau', country: 'Macau', type: 'Culture', lat: 22.1987, lng: 113.5439 },
    { id: 'vietnam_hanoi', name: 'Vietnam (Hanoi)', country: 'Vietnam', type: 'Culture', lat: 21.0285, lng: 105.8542 },
    { id: 'vietnam_hcmc', name: 'Vietnam (Ho Chi Minh City)', country: 'Vietnam', type: 'City', lat: 10.8231, lng: 106.6297 },
    { id: 'malaysia_kl', name: 'Malaysia (Kuala Lumpur)', country: 'Malaysia', type: 'City', lat: 3.1390, lng: 101.6869 },
    { id: 'philippines_palawan', name: 'Philippines (Palawan)', country: 'Philippines', type: 'Nature', lat: 9.8349, lng: 118.7384 },
    { id: 'india_delhi', name: 'India (New Delhi)', country: 'India', type: 'Culture', lat: 28.6139, lng: 77.2090 },
    { id: 'uae_abudhabi', name: 'UAE (Abu Dhabi)', country: 'UAE', type: 'City', lat: 24.4539, lng: 54.3773 },
    { id: 'qatar_doha', name: 'Qatar (Doha)', country: 'Qatar', type: 'City', lat: 25.2854, lng: 51.5310 },

    // Chunk 9: Africa / Oceania / Misc
    { id: 'morocco_marrakech', name: 'Morocco (Marrakech)', country: 'Morocco', type: 'Culture', lat: 31.6295, lng: -7.9811 },
    { id: 'egypt_cairo', name: 'Egypt (Cairo)', country: 'Egypt', type: 'Culture', lat: 30.0444, lng: 31.2357 },
    { id: 'southafrica_capetown', name: 'South Africa (Cape Town)', country: 'South Africa', type: 'Nature', lat: -33.9249, lng: 18.4241 },
    { id: 'newzealand_auckland', name: 'New Zealand (Auckland)', country: 'New Zealand', type: 'Nature', lat: -36.8485, lng: 174.7633 },
    { id: 'newzealand_queenstown', name: 'New Zealand (Queenstown)', country: 'New Zealand', type: 'Nature', lat: -45.0312, lng: 168.6626 },
    { id: 'australia_melbourne', name: 'Australia (Melbourne)', country: 'Australia', type: 'City', lat: -37.8136, lng: 144.9631 },
    { id: 'fiji', name: 'Fiji', country: 'Fiji', type: 'Relax', lat: -17.7134, lng: 178.0650 },
    { id: 'maldives', name: 'Maldives', country: 'Maldives', type: 'Relax', lat: 3.2028, lng: 73.2207 },
    { id: 'sweden_stockholm', name: 'Sweden (Stockholm)', country: 'Sweden', type: 'City', lat: 59.3293, lng: 18.0686 },
    { id: 'denmark_copenhagen', name: 'Denmark (Copenhagen)', country: 'Denmark', type: 'City', lat: 55.6761, lng: 12.5683 }
];

// Activity Templates
const templates = {
    City: [
        { suffix: "Grand Plaza", desc: "The bustling central square filled with historic architecture and vibrant street life." },
        { suffix: "Observation Deck", desc: "Enjoy panoramic views of the spectacular city skyline from high above." },
        { suffix: "Downtown Walk", desc: "A guided walking tour through the heart of the modern business and shopping districts." },
        { suffix: "Skyline Bridge", desc: "An iconic structural marvel connecting major parts of the city with great photo ops." },
        { suffix: "Tech Hub & Avenue", desc: "Explore the modern architectural wonders and futuristic lifestyle centers." },
        { suffix: "Central Station Walk", desc: "The historic and beautifully designed central transit hub surrounded by local life." },
        { suffix: "Riverside Promenade", desc: "A lively walkway alongside the city's main waterway lined with cafes and shops." },
        { suffix: "Night Market", desc: "Experience the local vibe, street performances, and bustling energy after dark." },
        { suffix: "Financial District", desc: "Towering skyscrapers and ultra-modern architecture in the city center." },
        { suffix: "Shopping Mile", desc: "The premium shopping destination offering high-end brands and local boutiques." }
    ],
    Culture: [
        { suffix: "National Museum", desc: "A massive collection of historical artifacts and national treasures." },
        { suffix: "Ancient Ruins", desc: "Explore the beautifully preserved archaeological remains of early civilizations." },
        { suffix: "Royal Palace", desc: "The spectacular historical residence showcasing opulent architecture." },
        { suffix: "Art Gallery", desc: "A premier gallery featuring both classical masterpieces and modern art." },
        { suffix: "Historic Old Town", desc: "Wander through centuries-old cobblestone streets and heritage buildings." },
        { suffix: "Grand Cathedral", desc: "A magnificent religious center known for its stunning stained glass and design." },
        { suffix: "Folk Village", desc: "An immersive outdoor museum depicting traditional life and architecture." },
        { suffix: "Opera House", desc: "Catch a classic performance in one of the world's most beautiful venues." },
        { suffix: "Heritage Monument", desc: "An iconic landmark symbolizing the city's struggles and triumphs." },
        { suffix: "Local Crafts Market", desc: "A vibrant market where artisans sell traditional handmade goods." }
    ],
    Nature: [
        { suffix: "Botanical Gardens", desc: "A lush, expansive garden featuring exotic plants and serene walking paths." },
        { suffix: "National Park Trail", desc: "A scenic hiking trail offering breathtaking views of natural landscapes." },
        { suffix: "Mountain Peak", desc: "A stunning viewpoint requiring a moderate hike, rewarding you with fresh air." },
        { suffix: "Crystal Lake", desc: "A peaceful and pristine lake perfect for kayaking or a quiet afternoon." },
        { suffix: "Hidden Waterfall", desc: "A majestic natural waterfall surrounded by dense, vibrant greenery." },
        { suffix: "Coastal Cliff Walk", desc: "A dramatic seaside trail offering uninterrupted ocean panoramas." },
        { suffix: "Wildlife Reserve", desc: "A protected sanctuary to observe local fauna in their natural habitat." },
        { suffix: "Forest Canopy Tour", desc: "An adventurous walk through dense old-growth forest canopies." },
        { suffix: "Volcanic Crater", desc: "A fascinating geological site offering unique hiking and photo opportunities." },
        { suffix: "Sunset Beach View", desc: "A beautiful natural coastline known for its spectacular evening skies." }
    ],
    Relax: [
        { suffix: "Thermal Spa", desc: "A luxurious day spa offering hot springs, massages, and total relaxation." },
        { suffix: "Central Park Lounge", desc: "A quiet, green oasis in the city perfect for reading or a casual picnic." },
        { suffix: "Sunset Cruise", desc: "A relaxing boat ride along the water offering drinks and beautiful views." },
        { suffix: "Jazz Lounge", desc: "A laid-back evening venue featuring smooth live music and great cocktails." },
        { suffix: "Yoga Retreat Center", desc: "A peaceful morning session to center your mind and stretch your body." },
        { suffix: "Tea House", desc: "A traditional and serene spot to enjoy artisan teas and light pastries." },
        { suffix: "Seaside Cabana", desc: "Rent a cozy cabana by the water for a day of uninterrupted sunbathing." },
        { suffix: "Library Cafe", desc: "A quiet, aesthetically pleasing bookstore cafe to relax for a few hours." },
        { suffix: "Rooftop Garden", desc: "A serene, plant-filled rooftop offering peaceful views away from the noise." },
        { suffix: "Wine Tasting Room", desc: "A sophisticated but relaxed environment to sample local vintages." }
    ],
    Food: [
        { suffix: "Gourmet Dining", desc: "A highly-rated fine dining experience featuring innovative tasting menus." },
        { suffix: "Street Food Alley", desc: "A bustling lane filled with incredibly authentic and affordable local bites." },
        { suffix: "Seafood Grill", desc: "Fresh, locally caught seafood prepared perfectly with regional spices." },
        { suffix: "Classic Steakhouse", desc: "A premium restaurant known for perfectly aged cuts and great ambiance." },
        { suffix: "Vegan Bistro", desc: "A trendy, highly-reviewed cafe serving delicious plant-based creations." },
        { suffix: "Traditional Tavern", desc: "A historic pub serving hearty local comfort food and fantastic brews." },
        { suffix: "Dessert Patisserie", desc: "A famous bakery offering beautifully crafted cakes and sweet treats." },
        { suffix: "Fusion Kitchen", desc: "A popular spot blending traditional local flavors with modern techniques." },
        { suffix: "Hidden Speakeasy", desc: "A moody, atmospheric bar serving world-class craft cocktails and tapas." },
        { suffix: "Breakfast Cafe", desc: "The best brunch spot in town renowned for its coffee and amazing pastries." }
    ]
};

function generateActivities(city) {
    let acts = [];
    ['City', 'Culture', 'Nature', 'Relax', 'Food'].forEach(type => {
        let items = templates[type];
        items.forEach((item) => {
            let dLat = (Math.random() - 0.5) * 0.05;
            let dLng = (Math.random() - 0.5) * 0.05;
            let cityNameSplit = city.name.split(' (');
            let baseName = cityNameSplit.length > 1 ? cityNameSplit[1].replace(')', '') : cityNameSplit[0];
            
            acts.push({
                name: baseName + " " + item.suffix,
                type: type,
                rating: parseFloat((4.0 + Math.random()).toFixed(1)),
                desc: item.desc,
                latitude: city.lat + dLat,
                longitude: city.lng + dLng
            });
        });
    });
    return acts; // 50 total
}

function writeChunk(chunkNum, startIdx, endIdx) {
    let fileContent = 'export const destChunk' + chunkNum + ' = {\\n';
    for (let i = startIdx; i < endIdx; i++) {
        let d = destinations[i];
        let acts = generateActivities(d);
        
        fileContent += '    "' + d.id + '": {\\n';
        fileContent += '        name: "' + d.name + '",\\n';
        fileContent += '        type: "' + d.type + '",\\n';
        fileContent += '        activities: [\\n';
        acts.forEach(a => {
            fileContent += '            { name: "' + a.name + '", type: "' + a.type + '", rating: ' + a.rating + ', desc: "' + a.desc + '", latitude: ' + a.latitude.toFixed(4) + ', longitude: ' + a.longitude.toFixed(4) + ' },\\n';
        });
        fileContent += '        ]\\n';
        fileContent += '    },\\n';
    }
    fileContent += '};\n';
    fs.writeFileSync(path.join(__dirname, 'src', 'data', 'destChunk' + chunkNum + '.js'), fileContent);
    console.log('Generated destChunk' + chunkNum + '.js with ' + (endIdx - startIdx) + ' destinations.');
}

// 5 chunks (5 to 9), 10 destinations each
writeChunk(5, 0, 10);
writeChunk(6, 10, 20);
writeChunk(7, 20, 30);
writeChunk(8, 30, 40);
writeChunk(9, 40, 50);

console.log("All chunks generated!");
