import { destChunk1 } from './destChunk1';
import { destChunk2 } from './destChunk2';
import { destChunk3 } from './destChunk3';
import { destChunk4 } from './destChunk4';
import { destChunk5 } from './destChunk5';
import { destChunk6 } from './destChunk6';
import { destChunk7 } from './destChunk7';
import { destChunk8 } from './destChunk8';
import { destChunk9 } from './destChunk9';
import { destChunk10 } from './destChunk10';
import { destChunk11 } from './destChunk11';
import { destChunk12 } from './destChunk12';
import { destChunk13 } from './destChunk13';
import { destChunk14 } from './destChunk14';
import { destChunk15 } from './destChunk15';

export const DESTINATION_DATA = {
    ...destChunk1,
    ...destChunk2,
    ...destChunk3,
    ...destChunk4,
    ...destChunk5,
    ...destChunk6,
    ...destChunk7,
    ...destChunk8,
    ...destChunk9,
    ...destChunk10,
    ...destChunk11,
    ...destChunk12,
    ...destChunk13,
    ...destChunk14,
    ...destChunk15,
    'default': {
        activities: [
            { name: "City Exploration", type: "City", rating: 4.5, desc: "Explore the main attractions of the city.", latitude: null, longitude: null },
            { name: "Local Market", type: "Food", rating: 4.4, desc: "Visit a traditional market to taste local flavors.", latitude: null, longitude: null },
            { name: "Cultural Landmark", type: "Culture", rating: 4.6, desc: "Discover the rich history and heritage of the region.", latitude: null, longitude: null },
            { name: "Park & Garden", type: "Nature", rating: 4.7, desc: "Relax in a beautiful public park or botanical garden.", latitude: null, longitude: null },
            { name: "Scenic Viewpoint", type: "Relax", rating: 4.8, desc: "Enjoy stunning views from a prominent city viewpoint.", latitude: null, longitude: null }
        ]
    }
};
