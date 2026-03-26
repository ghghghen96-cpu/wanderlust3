const fs = require('fs');
let chunk3 = fs.readFileSync('src/data/destChunk3.js', 'utf8');
const romeExtras = `            { name: "Piazza Venezia", type: "City", rating: 4.6, desc: "Central hub of Rome surrounded by monuments.", latitude: 41.8960, longitude: 12.4820 },
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

const matchStr = 'name: "Jewish Ghetto (Carciofi alla Giudia)"';
const matchIndex = chunk3.indexOf(matchStr);
if (matchIndex !== -1) {
    const bracketIndex = chunk3.indexOf(']', matchIndex);
    if (bracketIndex !== -1) {
        chunk3 = chunk3.slice(0, bracketIndex) + ",\n" + romeExtras + chunk3.slice(bracketIndex);
        fs.writeFileSync('src/data/destChunk3.js', chunk3);
        console.log('done rome');
    }
}
