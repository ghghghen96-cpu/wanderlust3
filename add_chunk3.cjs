const fs = require('fs');

let chunk3 = fs.readFileSync('src/data/destChunk3.js', 'utf8');

const barcelonaExtras = `
            { name: "Palau Güell", type: "Culture", rating: 4.6, desc: "Gaudí mansion with incredible wrought iron and wood work.", latitude: 41.3790, longitude: 2.1744 },
            { name: "MNAC (National Art Museum of Catalonia)", type: "Culture", rating: 4.8, desc: "Huge museum of Catalan art in a stunning palace.", latitude: 41.3685, longitude: 2.1534 },
            { name: "Fundació Joan Miró", type: "Culture", rating: 4.6, desc: "Museum honoring the work of Joan Miró on Montjuïc.", latitude: 41.3686, longitude: 2.1599 },
            { name: "Plaça d'Espanya", type: "City", rating: 4.6, desc: "Grand square at the foot of Montjuïc.", latitude: 41.3750, longitude: 2.1491 },
            { name: "Arc de Triomf", type: "City", rating: 4.7, desc: "Red brick triumphant arch built for the 1888 World Fair.", latitude: 41.3910, longitude: 2.1806 },
            { name: "Passeig del Born", type: "Relax", rating: 4.5, desc: "Quiet and trendy promenade in the El Born district.", latitude: 41.3846, longitude: 2.1824 },
            { name: "Bogatell Beach", type: "Relax", rating: 4.6, desc: "Cleaner, less crowded sandy beach perfect for locals.", latitude: 41.3934, longitude: 2.2062 },
            { name: "Collserola Tower", type: "Nature", rating: 4.4, desc: "Telecommunications tower offering high-altitude views.", latitude: 41.4173, longitude: 2.1139 },
            { name: "Can Culleretes", type: "Food", rating: 4.3, desc: "Barcelona's oldest restaurant serving traditional Catalan food.", latitude: 41.3807, longitude: 2.1748 },
            { name: "Los Caracoles", type: "Food", rating: 4.4, desc: "Historic restaurant famous for its snails and roast chicken.", latitude: 41.3800, longitude: 2.1764 },
            { name: "Paradiso", type: "Food", rating: 4.8, desc: "Speakeasy bar constantly ranked among the world's best.", latitude: 41.3844, longitude: 2.1825 },
`;

const romeExtras = `
            { name: "Piazza Venezia", type: "City", rating: 4.6, desc: "Central hub of Rome surrounded by monuments.", latitude: 41.8960, longitude: 12.4820 },
            { name: "Circus Maximus", type: "City", rating: 4.3, desc: "Ancient Roman chariot-racing stadium open park area.", latitude: 41.8860, longitude: 12.4852 },
            { name: "Arch of Constantine", type: "Culture", rating: 4.7, desc: "Impressive ancient arch right beside the Colosseum.", latitude: 41.8898, longitude: 12.4907 },
            { name: "Trajan's Market", type: "Culture", rating: 4.6, desc: "Fascinating large complex of ancient Roman ruins.", latitude: 41.8953, longitude: 12.4860 },
            { name: "Terme di Diocleziano", type: "Culture", rating: 4.5, desc: "Grand ruins of the largest public baths in ancient Rome.", latitude: 41.9029, longitude: 12.4984 },
            { name: "Crypt of the Capuchin Monks", type: "Culture", rating: 4.5, desc: "Macabre chapel decorated with human bones.", latitude: 41.9044, longitude: 12.4883 },
            { name: "Aventine Keyhole", type: "Relax", rating: 4.6, desc: "Famous door with a keyhole perfectly framing St. Peter's.", latitude: 41.8830, longitude: 12.4782 },
            { name: "Rose Garden", type: "Nature", rating: 4.7, desc: "Beautiful municipal rose garden facing Palatine Hill.", latitude: 41.8833, longitude: 12.4816 },
            { name: "Pincio Promenade", type: "Relax", rating: 4.8, desc: "Relaxing walkway offering excellent views over Rome.", latitude: 41.9115, longitude: 12.4795 },
            { name: "MAXXI Museum", type: "Culture", rating: 4.5, desc: "National museum of contemporary art and architecture.", latitude: 41.9282, longitude: 12.4665 },
            { name: "Armando al Pantheon", type: "Food", rating: 4.6, desc: "Historic trattoria offering excellent Roman classic dishes.", latitude: 41.8993, longitude: 12.4764 },
            { name: "Salumeria Roscioli", type: "Food", rating: 4.7, desc: "Gourmet deli turned fantastic dining spot for cured meats.", latitude: 41.8938, longitude: 12.4733 },
            { name: "Suppli Roma", type: "Food", rating: 4.8, desc: "Tiny hole-in-the-wall serving the best fried rice balls.", latitude: 41.8892, longitude: 12.4725 },
`;

const londonExtras = `
            { name: "Trafalgar Square", type: "City", rating: 4.7, desc: "Iconic public square housing Nelson's Column.", latitude: 51.5080, longitude: -0.1281 },
            { name: "London Bridge", type: "City", rating: 4.4, desc: "Modern bridge with great views of Tower Bridge and The Shard.", latitude: 51.5079, longitude: -0.0877 },
            { name: "Monument to the Great Fire", type: "Culture", rating: 4.5, desc: "Historic Doric column offering panoramic views (via stairs).", latitude: 51.5101, longitude: -0.0859 },
            { name: "Shakespeare's Globe", type: "Culture", rating: 4.7, desc: "Reconstruction of the Elizabethan playhouse.", latitude: 51.5081, longitude: -0.0971 },
            { name: "HMS Belfast", type: "Culture", rating: 4.7, desc: "Historic WWII Royal Navy cruiser moored on the Thames.", latitude: 51.5066, longitude: -0.0814 },
            { name: "Columbia Road Flower Market", type: "City", rating: 4.6, desc: "Sunday street market transforming into an oasis of foliage.", latitude: 51.5287, longitude: -0.0699 },
            { name: "Chelsea Physic Garden", type: "Nature", rating: 4.6, desc: "London's oldest botanic garden hidden in Chelsea.", latitude: 51.4852, longitude: -0.1627 },
            { name: "Holland Park", type: "Nature", rating: 4.7, desc: "Elegant park featuring the beautiful Kyoto Garden.", latitude: 51.5015, longitude: -0.2031 },
            { name: "Primrose Hill", type: "Relax", rating: 4.8, desc: "Grassy hill offering one of the best free views of the skyline.", latitude: 51.5396, longitude: -0.1607 },
            { name: "St. John", type: "Food", rating: 4.6, desc: "Pioneering 'nose-to-tail' Michelin-starred British dining.", latitude: 51.5204, longitude: -0.1018 },
            { name: "Bao Soho", type: "Food", rating: 4.6, desc: "Massively popular spot for Taiwanese steamed buns.", latitude: 51.5131, longitude: -0.1337 },
`;

chunk3 = chunk3.replace(/(name:\s*"Xurreria Trebol".*?)\n\s*\]/g, '$1,\n' + barcelonaExtras + '        ]');
chunk3 = chunk3.replace(/(name:\s*"Jewish Ghetto \\(Carciofi alla Giudia\\)".*?)\n\s*\]/g, '$1,\n' + romeExtras + '        ]');
chunk3 = chunk3.replace(/(name:\s*"Hawksmoor".*?)\n\s*\]/g, '$1,\n' + londonExtras + '        ]');

fs.writeFileSync('src/data/destChunk3.js', chunk3);
console.log('done chunk3');
