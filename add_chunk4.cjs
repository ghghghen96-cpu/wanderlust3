const fs = require('fs');

let chunk4 = fs.readFileSync('src/data/destChunk4.js', 'utf8');

const bangkokExtras = `
            { name: "Siam Discovery", type: "City", rating: 4.6, desc: "Innovative shopping mall with unique design.", latitude: 13.7466, longitude: 100.5310 },
            { name: "Terminal 21", type: "City", rating: 4.7, desc: "Airport-themed mall with floors based on world cities.", latitude: 13.7377, longitude: 100.5604 },
            { name: "Iconsiam", type: "City", rating: 4.8, desc: "Massive luxury megamall on the riverfront.", latitude: 13.7268, longitude: 100.5106 },
            { name: "SEA LIFE Bangkok Ocean World", type: "City", rating: 4.5, desc: "Giant aquarium underneath Siam Paragon mall.", latitude: 13.7461, longitude: 100.5342 },
            { name: "Silom Complex", type: "City", rating: 4.2, desc: "Central shopping and dining area in the business district.", latitude: 13.7279, longitude: 100.5338 },
            { name: "EmQuartier", type: "City", rating: 4.7, desc: "High-end luxury mall with stunning architecture and waterfall.", latitude: 13.7314, longitude: 100.5697 },
            { name: "Bangkok National Museum", type: "Culture", rating: 4.6, desc: "Extensive collection of Thai art and history.", latitude: 13.7588, longitude: 100.4916 },
            { name: "Wat Traimit (Golden Buddha)", type: "Culture", rating: 4.6, desc: "Temple housing the world's largest solid gold Buddha.", latitude: 13.7376, longitude: 100.5136 },
            { name: "Loha Prasat (Metal Castle)", type: "Culture", rating: 4.7, desc: "Unique temple with 37 metal spires.", latitude: 13.7554, longitude: 100.5050 },
            { name: "Suan Pakkad Palace", type: "Culture", rating: 4.4, desc: "Museum of Thai antiquities in traditional wooden houses.", latitude: 13.7562, longitude: 100.5372 },
            { name: "Samut Prakan Ancient City", type: "Culture", rating: 4.7, desc: "Massive outdoor museum shaping the history of Thailand.", latitude: 13.5398, longitude: 100.6229 },
            { name: "Erawan Museum", type: "Culture", rating: 4.6, desc: "Famous for its massive three-headed elephant statue.", latitude: 13.6285, longitude: 100.5891 },
            { name: "Safari World", type: "Nature", rating: 4.5, desc: "Large open zoo and marine park.", latitude: 13.8649, longitude: 100.7027 },
            { name: "Dusit Zoo", type: "Nature", rating: 4.3, desc: "Historic city zoo (recently relocated).", latitude: 13.7712, longitude: 100.5165 },
            { name: "King Power Mahanakhon", type: "Relax", rating: 4.8, desc: "Stunning observation deck and glass walk.", latitude: 13.7236, longitude: 100.5282 },
            { name: "Oasis Spa Bangkok", type: "Relax", rating: 4.7, desc: "Luxurious traditional Thai spa experience.", latitude: 13.7371, longitude: 100.5701 },
            { name: "Health Land Spa", type: "Relax", rating: 4.5, desc: "Popular and affordable traditional Thai massage chain.", latitude: 13.7259, longitude: 100.5264 },
            { name: "Baiyoke Sky Tower", type: "Relax", rating: 4.4, desc: "Panoramic view of Bangkok from the revolving roof deck.", latitude: 13.7543, longitude: 100.5407 },
            { name: "Supanniga Eating Room", type: "Food", rating: 4.6, desc: "Incredible traditional Thai comfort food.", latitude: 13.7230, longitude: 100.5794 },
            { name: "Sorn", type: "Food", rating: 4.9, desc: "Exclusive two-Michelin-star Southern Thai cuisine.", latitude: 13.7266, longitude: 100.5699 },
            { name: "Paste Bangkok", type: "Food", rating: 4.8, desc: "Refined Royal Thai cuisine with complex modern layers.", latitude: 13.7441, longitude: 100.5409 },
            { name: "Nahm", type: "Food", rating: 4.7, desc: "Acclaimed fine-dining Thai restaurant.", latitude: 13.7249, longitude: 100.5397 },
`;

const baliExtras = `
            { name: "Lempuyang Temple", type: "Culture", rating: 4.7, desc: "Famous 'Gates of Heaven' with Mount Agung views.", latitude: -8.3908, longitude: 115.6291 },
            { name: "Tirta Gangga", type: "Culture", rating: 4.8, desc: "Former royal water palace with stepping stones and koi.", latitude: -8.4121, longitude: 115.5878 },
            { name: "Garuda Wisnu Kencana", type: "Culture", rating: 4.5, desc: "Massive cultural park featuring a gigantic Hindu statue.", latitude: -8.8116, longitude: 115.1673 },
            { name: "Pura Taman Ayun", type: "Culture", rating: 4.6, desc: "Beautiful royal temple complex with manicured gardens.", latitude: -8.5413, longitude: 115.1724 },
            { name: "Kehen Temple", type: "Culture", rating: 4.5, desc: "Ancient and tranquil terraced temple in Bangli.", latitude: -8.4526, longitude: 115.3565 },
            { name: "Tegenungan Waterfall", type: "Nature", rating: 4.5, desc: "Popular and accessible waterfall near Ubud.", latitude: -8.5750, longitude: 115.2897 },
            { name: "Gitgit Waterfall", type: "Nature", rating: 4.6, desc: "Impressive twin waterfall surrounded by tropical forest.", latitude: -8.1947, longitude: 115.1408 },
            { name: "Handara Gate", type: "Nature", rating: 4.4, desc: "Iconic split gate pathway surrounded by mountains.", latitude: -8.2562, longitude: 115.1585 },
            { name: "Twin Lakes Viewpoint", type: "Nature", rating: 4.7, desc: "Stunning views of Lake Buyan and Lake Tamblingan.", latitude: -8.2483, longitude: 115.1275 },
            { name: "West Bali National Park", type: "Nature", rating: 4.7, desc: "Pristine snorkeling and wildlife spotting.", latitude: -8.1365, longitude: 114.4578 },
            { name: "Menjangan Island", type: "Nature", rating: 4.8, desc: "Unbelievable snorkeling and diving site with deer.", latitude: -8.0950, longitude: 114.5029 },
            { name: "Bali Safari and Marine Park", type: "Nature", rating: 4.5, desc: "Wild animal park and night safari.", latitude: -8.5630, longitude: 115.3340 },
            { name: "Canggu Beach", type: "Relax", rating: 4.6, desc: "Trendy beach known for surf, sunset, and cafes.", latitude: -8.6499, longitude: 115.1264 },
            { name: "Nusa Dua Beach", type: "Relax", rating: 4.7, desc: "Pristine white-sand beach with calm, clear water.", latitude: -8.8078, longitude: 115.2285 },
            { name: "Sunday's Beach Club", type: "Relax", rating: 4.7, desc: "Stunning private beach club accessed via funicular.", latitude: -8.8354, longitude: 115.1557 },
            { name: "Ku De Ta", type: "City", rating: 4.6, desc: "Legendary beach club blending fine dining and sunset parties.", latitude: -8.6836, longitude: 115.1561 },
            { name: "La Brisa", type: "Relax", rating: 4.7, desc: "Boho-chic beach club built from reclaimed fisherman wood.", latitude: -8.6508, longitude: 115.1256 },
            { name: "Rock Bar Bali", type: "Relax", rating: 4.8, desc: "Spectacular sunset bar literally perched on ocean cliffs.", latitude: -8.7845, longitude: 115.1287 },
            { name: "Bumbu Bali", type: "Food", rating: 4.7, desc: "Authentic Balinese culinary experience.", latitude: -8.7733, longitude: 115.2260 },
            { name: "Merah Putih", type: "Food", rating: 4.8, desc: "Upscale modern Indonesian dining in a stunning cathedral space.", latitude: -8.6757, longitude: 115.1517 },
            { name: "Cuca Restaurant", type: "Food", rating: 4.8, desc: "Inventive tapas blending Western techniques with local flavors.", latitude: -8.7758, longitude: 115.1633 },
            { name: "Kynd Community", type: "Food", rating: 4.6, desc: "Famous plant-based cafe known for aesthetic smoothie bowls.", latitude: -8.6766, longitude: 115.1544 },
`;

const singaporeExtras = `
            { name: "Bugis Street Market", type: "City", rating: 4.4, desc: "Bustling covered shopping street perfect for souvenirs.", latitude: 1.3006, longitude: 103.8546 },
            { name: "Suntec City", type: "City", rating: 4.5, desc: "Vast mall housing the Fountain of Wealth.", latitude: 1.2941, longitude: 103.8587 },
            { name: "VivoCity", type: "City", rating: 4.6, desc: "Singapore's largest shopping mall connecting to Sentosa.", latitude: 1.2644, longitude: 103.8222 },
            { name: "Haji Lane", type: "City", rating: 4.7, desc: "Narrow alley filled with indie boutiques and street art.", latitude: 1.3009, longitude: 103.8588 },
            { name: "National Library Singapore", type: "City", rating: 4.6, desc: "Striking eco-friendly library building with city views.", latitude: 1.2965, longitude: 103.8532 },
            { name: "Fort Canning Park", type: "Nature", rating: 4.6, desc: "Historical hilltop park with spice gardens and battlebox.", latitude: 1.2943, longitude: 103.8465 },
            { name: "Sungei Buloh Wetland", type: "Nature", rating: 4.6, desc: "Mangrove forest reserve famous for bird watching.", latitude: 1.4429, longitude: 103.7303 },
            { name: "Bukit Timah Nature Reserve", type: "Nature", rating: 4.7, desc: "Dense rainforest housing Singapore's highest hill.", latitude: 1.3546, longitude: 103.7766 },
            { name: "East Coast Park", type: "Relax", rating: 4.7, desc: "Scenic beach park perfect for cycling and rollerblading.", latitude: 1.3023, longitude: 103.9180 },
            { name: "MacRitchie Reservoir Walk", type: "Nature", rating: 4.7, desc: "Forest trails featuring the suspension TreeTop walk.", latitude: 1.3415, longitude: 103.8239 },
            { name: "Southern Ridges", type: "Nature", rating: 4.8, desc: "Elevated walkway offering panoramic views of the city greens.", latitude: 1.2801, longitude: 103.8055 },
            { name: "Singapore Cable Car", type: "Relax", rating: 4.6, desc: "Scenic cable car ride from Mount Faber to Sentosa.", latitude: 1.2713, longitude: 103.8197 },
            { name: "Asian Civilisations Museum", type: "Culture", rating: 4.7, desc: "Museum showing the diverse cultural roots of Singapore.", latitude: 1.2874, longitude: 103.8514 },
            { name: "Thian Hock Keng Temple", type: "Culture", rating: 4.7, desc: "Oldest Chinese temple in Singapore, built without nails.", latitude: 1.2813, longitude: 103.8475 },
            { name: "Kranji War Memorial", type: "Culture", rating: 4.6, desc: "Tranquil cemetery honoring those who fell during WWII.", latitude: 1.4184, longitude: 103.7584 },
            { name: "Sri Mariamman Temple", type: "Culture", rating: 4.6, desc: "Singapore's oldest Hindu temple in Chinatown.", latitude: 1.2826, longitude: 103.8451 },
            { name: "Chinatown Heritage Centre", type: "Culture", rating: 4.5, desc: "Recreated shophouses depicting early immigrant life.", latitude: 1.2829, longitude: 103.8443 },
            { name: "Tiong Bahru Food Centre", type: "Food", rating: 4.6, desc: "Local favorite hawker center known for Chwee Kueh.", latitude: 1.2851, longitude: 103.8322 },
            { name: "Chomp Chomp Food Centre", type: "Food", rating: 4.5, desc: "Famous for BBQ stingray and late-night supper.", latitude: 1.3644, longitude: 103.8665 },
            { name: "Old Airport Road Food Centre", type: "Food", rating: 4.7, desc: "One of the oldest and largest hawker centres in Singapore.", latitude: 1.3082, longitude: 103.8859 },
            { name: "Song Fa Bak Kut Teh", type: "Food", rating: 4.7, desc: "Legendary peppery pork rib soup.", latitude: 1.2887, longitude: 103.8465 },
            { name: "Odette", type: "Food", rating: 4.9, desc: "Three-Michelin-starred modern French fine dining.", latitude: 1.2903, longitude: 103.8519 },
`;

const sydneyExtras = `
            { name: "Hyde Park Sydney", type: "Nature", rating: 4.6, desc: "Australia's oldest public parklet featuring the ANZAC Memorial.", latitude: -33.8732, longitude: 151.2126 },
            { name: "Wendy's Secret Garden", type: "Nature", rating: 4.8, desc: "Whimsical community garden with harbor views.", latitude: -33.8430, longitude: 151.2059 },
            { name: "Glebe Markets", type: "City", rating: 4.6, desc: "Bustling weekend market for vintage clothes and food.", latitude: -33.8821, longitude: 151.1924 },
            { name: "Sea Life Sydney", type: "City", rating: 4.5, desc: "Underwater tunnels showcasing Australia's marine life.", latitude: -33.8696, longitude: 151.2023 },
            { name: "Wild Life Sydney Zoo", type: "Nature", rating: 4.4, desc: "Indoor zoo displaying native Australian wildlife.", latitude: -33.8693, longitude: 151.2018 },
            { name: "Madame Tussauds Sydney", type: "City", rating: 4.4, desc: "Famous wax museum with local and international figures.", latitude: -33.8690, longitude: 151.2016 },
            { name: "Sydney Observatory", type: "Culture", rating: 4.6, desc: "Heritage-listed hilltop observatory and museum.", latitude: -33.8593, longitude: 151.2045 },
            { name: "Susannah Place Museum", type: "Culture", rating: 4.7, desc: "Historic terraces showing working-class life from 1844.", latitude: -33.8606, longitude: 151.2078 },
            { name: "Justice & Police Museum", type: "Culture", rating: 4.5, desc: "Museum exploring Sydney's criminal underworld history.", latitude: -33.8617, longitude: 151.2117 },
            { name: "Chinese Garden of Friendship", type: "Relax", rating: 4.7, desc: "Tranquil oasis of waterfalls and koi ponds in Darling Harbour.", latitude: -33.8765, longitude: 151.2023 },
            { name: "Coogee Beach", type: "Relax", rating: 4.7, desc: "Family-friendly beach with calmer surf and ocean baths.", latitude: -33.9202, longitude: 151.2583 },
            { name: "Bronte Beach", type: "Relax", rating: 4.7, desc: "Small, beautiful beach lined with excellent cafes.", latitude: -33.9038, longitude: 151.2678 },
            { name: "Palm Beach", type: "Relax", rating: 4.8, desc: "Pristine northern beach, famous filming location for Home and Away.", latitude: -33.5976, longitude: 151.3216 },
            { name: "Watsons Bay Boutique Hotel", type: "Food", rating: 4.6, desc: "Chic seaside dining known for great seafood and views.", latitude: -33.8437, longitude: 151.2818 },
            { name: "Icebergs Dining", type: "Food", rating: 4.7, desc: "Iconic spectacular views over the Bondi Icebergs pool.", latitude: -33.8943, longitude: 151.2748 },
            { name: "Tetsuya's", type: "Food", rating: 4.8, desc: "World-renowned fusion of Japanese and French cuisines.", latitude: -33.8741, longitude: 151.2039 },
            { name: "Ester", type: "Food", rating: 4.8, desc: "Award-winning modern Australian cooked over a wood fire.", latitude: -33.8860, longitude: 151.2008 },
            { name: "The Grounds of Alexandria", type: "Food", rating: 4.6, desc: "Massive rustic cafe, garden, and bakery space.", latitude: -33.9107, longitude: 151.1944 },
            { name: "Mamak", type: "Food", rating: 4.6, desc: "Incredibly popular casual Malaysian spot famous for roti canai.", latitude: -33.8770, longitude: 151.2037 },
`;

const defaultExtras = `
            { name: "Pyramids of Giza", type: "Culture", rating: 5.0, desc: "Ancient pyramid complex in Egypt.", latitude: 29.9792, longitude: 31.1342 },
            { name: "Stonehenge", type: "Culture", rating: 4.6, desc: "Prehistoric stone circle monument in England.", latitude: 51.1789, longitude: -1.8262 },
            { name: "Chichén Itzá", type: "Culture", rating: 4.8, desc: "Complex of Mayan ruins on Mexico's Yucatán Peninsula.", latitude: 20.6843, longitude: -88.5678 },
            { name: "Acropolis of Athens", type: "Culture", rating: 4.9, desc: "Ancient citadel located on a rocky outcrop above Athens.", latitude: 37.9715, longitude: 23.7257 },
            { name: "Christ the Redeemer", type: "Culture", rating: 4.8, desc: "Art Deco statue of Jesus Christ in Rio de Janeiro.", latitude: -22.9519, longitude: -43.2105 },
            { name: "Table Mountain", type: "Nature", rating: 4.8, desc: "Flat-topped mountain forming a prominent landmark overlooking Cape Town.", latitude: -33.9628, longitude: 18.4098 },
            { name: "Salar de Uyuni", type: "Nature", rating: 4.9, desc: "World's largest salt flat located in Bolivia.", latitude: -20.1338, longitude: -67.4891 },
            { name: "Iguazu Falls", type: "Nature", rating: 4.9, desc: "Spectacular waterfalls of the Iguazu River on the border of Argentina and Brazil.", latitude: -25.6953, longitude: -54.4367 },
            { name: "Yosemite National Park", type: "Nature", rating: 4.9, desc: "National park in California known for its giant sequoias and towering bridalveil fall.", latitude: 37.8651, longitude: -119.5383 },
            { name: "Galápagos Islands", type: "Nature", rating: 4.9, desc: "Volcanic archipelago in the Pacific Ocean famous for endemic species.", latitude: -0.8293, longitude: -90.9821 },
            { name: "Burj Al Arab", type: "City", rating: 4.7, desc: "Luxury hotel located in Dubai.", latitude: 25.1412, longitude: 55.1852 },
            { name: "Golden Gate Bridge", type: "City", rating: 4.8, desc: "Iconic suspension bridge spanning the Golden Gate in San Francisco.", latitude: 37.8199, longitude: -122.4783 },
            { name: "Empire State Building", type: "City", rating: 4.7, desc: "102-story Art Deco skyscraper in Midtown Manhattan.", latitude: 40.7484, longitude: -73.9857 },
            { name: "Sydney Opera House", type: "City", rating: 4.8, desc: "Multi-venue performing arts centre at Sydney Harbour.", latitude: -33.8568, longitude: 151.2153 },
            { name: "The Louvre", type: "City", rating: 4.8, desc: "World's most-visited museum and historical monument in Paris.", latitude: 48.8606, longitude: 2.3376 },
            { name: "The Blue Lagoon", type: "Relax", rating: 4.7, desc: "Geothermal spa in southwestern Iceland.", latitude: 63.8804, longitude: -22.4495 },
            { name: "Maldives Resorts", type: "Relax", rating: 4.9, desc: "Luxury resorts and overwater bungalows in the Indian Ocean.", latitude: 4.1755, longitude: 73.5093 },
            { name: "Amalfi Coast", type: "Relax", rating: 4.8, desc: "Stretch of coastline in Southern Italy overlooking the Tyrrhenian Sea.", latitude: 40.6333, longitude: 14.6029 },
            { name: "Cinque Terre", type: "Relax", rating: 4.8, desc: "Five historic, brightly coloured villages on the rugged Italian Riviera coastline.", latitude: 44.1461, longitude: 9.6439 },
            { name: "Lake Como", type: "Relax", rating: 4.8, desc: "Upscale resort area known for its dramatic scenery in Northern Italy.", latitude: 46.0160, longitude: 9.2572 },
            { name: "Ginza Sushi-ya", type: "Food", rating: 4.9, desc: "Area renowned for world-class Michelin-starred omakase.", latitude: 35.6712, longitude: 139.7668 },
            { name: "Osteria Francescana", type: "Food", rating: 4.9, desc: "Three-Michelin-star restaurant in Modena, Italy.", latitude: 44.6433, longitude: 10.9231 },
            { name: "Noma", type: "Food", rating: 4.9, desc: "Renowned fine dining restaurant in Copenhagen.", latitude: 55.6828, longitude: 12.6096 },
            { name: "Pujol", type: "Food", rating: 4.8, desc: "Famous modern Mexican restaurant in Mexico City.", latitude: 19.4326, longitude: -99.1982 },
            { name: "La Boqueria", type: "Food", rating: 4.7, desc: "Large public market in the Ciudad Vieja district of Barcelona.", latitude: 41.3818, longitude: 2.1716 },
            { name: "Pike Place Market", type: "Food", rating: 4.7, desc: "Public market overlooking the Elliott Bay waterfront in Seattle.", latitude: 47.6086, longitude: -122.3400 },
            { name: "Borough Market", type: "Food", rating: 4.8, desc: "Historic food market in central London.", latitude: 51.5055, longitude: -0.0909 },
            { name: "Mercado San Miguel", type: "Food", rating: 4.7, desc: "Covered market in Madrid serving upscale tapas.", latitude: 40.4154, longitude: -3.7090 },
            { name: "Tsukiji Outer Market", type: "Food", rating: 4.6, desc: "Famous market for sushi and fresh seafood in Tokyo.", latitude: 35.6654, longitude: 139.7706 },
            { name: "Jemaa el-Fnaa Night Market", type: "Food", rating: 4.6, desc: "Bustling square and market place in Marrakesh's medina quarter.", latitude: 31.6258, longitude: -7.9892 }
`;

chunk4 = chunk4.replace(/(name:\s*"Wattana Panich".*?)\n\s*\]/g, '$1,\n' + bangkokExtras + '        ]');
chunk4 = chunk4.replace(/(name:\s*"Pison Coffee".*?)\n\s*\]/g, '$1,\n' + baliExtras + '        ]');
chunk4 = chunk4.replace(/(name:\s*"Burnt Ends".*?)\n\s*\]/g, '$1,\n' + singaporeExtras + '        ]');
chunk4 = chunk4.replace(/(name:\s*"Gelato Messina".*?)\n\s*\]/g, '$1,\n' + sydneyExtras + '        ]');
chunk4 = chunk4.replace(/(name:\s*"Bora Bora Lagoon".*?)\n\s*\]/g, '$1,\n' + defaultExtras + '        ]');

fs.writeFileSync('src/data/destChunk4.js', chunk4);
console.log('done chunk4');
