export const TRENDING_AESTHETICS_25: string[] = [
  'Gorpcore',
  'Minimalist',
  'Streetwear',
  'Quiet Luxury',
  'Avant-Garde',
  'Workwear',
  'Vintage 70s Retro',
  '90s Grunge',
  'Y2K Cyber',
  'Old Money',
  'Dark Academia',
  'Techwear',
  'Punk Rock',
  'Skatecore',
  'Blokecore',
  'Bohemian Indie',
  'Western Americana',
  'Utilitarian Military',
  'Futuristic Cyberpunk',
  'Coquette Softcore',
  'Normcore',
  'Japanese Americana',
  'Rave Acid House',
  'Coastal Grandmillennial',
  'Clean Sartorial',
];

export interface AestheticInfo {
  name: string;
  era: string;
  description: string;
  signaturePieces: string;
}

export const AESTHETIC_DETAILS: Record<string, AestheticInfo> = {
  'Gorpcore': {
    name: 'Gorpcore',
    era: '2020s Peak Outdoor',
    description: 'Technical mountain gear repurposed for modern urban exploration.',
    signaturePieces: 'Gore-Tex shells, trail runners, utility carabiners',
  },
  'Minimalist': {
    name: 'Minimalist',
    era: '1990s & Timeless',
    description: 'Stripped-back silhouettes with meticulous cuts and neutral palettes.',
    signaturePieces: 'Boxy white tees, monochrome trousers, sleek blazers',
  },
  'Streetwear': {
    name: 'Streetwear',
    era: '1990s-2020s Global',
    description: 'Casual apparel rooted in skate, hip-hop, and drop culture.',
    signaturePieces: 'Graphic hoodies, collectible sneakers, boxy overshirts',
  },
  'Quiet Luxury': {
    name: 'Quiet Luxury',
    era: '2020s Stealth Wealth',
    description: 'Hyper-understated elegance focusing on ultra-premium natural fabrics.',
    signaturePieces: 'Cashmere crewnecks, unbranded wool coats, fine leather loafers',
  },
  'Avant-Garde': {
    name: 'Avant-Garde',
    era: '1980s-Present',
    description: 'Experimental garment geometry, deconstruction, and non-linear cuts.',
    signaturePieces: 'Micro-pleated trousers, asymmetrical coats, sculptural footwear',
  },
  'Workwear': {
    name: 'Workwear',
    era: '1970s Heritage to Now',
    description: 'Durable, functional canvas and denim crafted for tough daily utility.',
    signaturePieces: 'Duck canvas chore jackets, double-knee carpenter pants, steel-toe boots',
  },
  'Vintage 70s Retro': {
    name: 'Vintage 70s Retro',
    era: '1970s Golden Era',
    description: 'Rich earth tones, wide collars, corduroy textures, and groovy knitwear.',
    signaturePieces: 'Wide-wale corduroys, track zip-ups, ringer tees, suede jackets',
  },
  '90s Grunge': {
    name: '90s Grunge',
    era: '1990s Pacific Northwest',
    description: 'Subversive, thrifted comfort featuring layered plaids and distressed textiles.',
    signaturePieces: 'Heavy plaid flannels, ripped denim, thermal henleys, combat boots',
  },
  'Y2K Cyber': {
    name: 'Y2K Cyber',
    era: 'Late 1990s - Early 2000s',
    description: 'Millennium optimism meets chrome hardware, metallic textiles, and low slung waists.',
    signaturePieces: 'Silver parachute pants, reflective jackets, wrap sunglasses',
  },
  'Old Money': {
    name: 'Old Money',
    era: '1980s Ivy League & European Riviera',
    description: 'Preppy collegiate tradition with timeless sporting heritage.',
    signaturePieces: 'Cable-knit cricket sweaters, polo shirts, pleated chinos, boat shoes',
  },
  'Dark Academia': {
    name: 'Dark Academia',
    era: '1980s Collegiate Gothic',
    description: 'Literary intellectualism wrapped in dark tweeds, woolens, and vintage leather.',
    signaturePieces: 'Herringbone blazers, turtleneck knits, oxford shoes, trench coats',
  },
  'Techwear': {
    name: 'Techwear',
    era: '2010s Urban Tactical',
    description: 'Futuristic performance utility with weather-resistant fabrics and modular straps.',
    signaturePieces: 'Waterproof storm shells, multi-pocket cargos, sling bags, gaiters',
  },
  'Punk Rock': {
    name: 'Punk Rock',
    era: '1970s London & NYC',
    description: 'Raw DIY counterculture with studs, distressed denim, and safety-pin rebellion.',
    signaturePieces: 'Biker leather jackets, ripped band tees, tartan trousers, creepers',
  },
  'Skatecore': {
    name: 'Skatecore',
    era: '1980s-2000s Dogtown & Bay Area',
    description: 'Relaxed durability designed for street skating, parks, and laid-back sessions.',
    signaturePieces: 'Baggy skate denim, waffle-sole sneakers, heavyweight graphic tees',
  },
  'Blokecore': {
    name: 'Blokecore',
    era: '1980s-1990s British Football Casuals',
    description: 'Terrace sports nostalgia blending archive jerseys with retro trainers.',
    signaturePieces: 'Vintage football kits, nylon tracksuits, terrace suede sneakers',
  },
  'Bohemian Indie': {
    name: 'Bohemian Indie',
    era: '2000s Indie Sleaze & 70s Boho',
    description: 'Carefree artistic layering with textured knits, vintage shearling, and suede.',
    signaturePieces: 'Slouchy cardigans, suede fringe jackets, beat-up Chelsea boots',
  },
  'Western Americana': {
    name: 'Western Americana',
    era: '1970s Heritage & Modern Rodeo',
    description: 'Frontier spirit with rugged denim, yoke stitching, and silver buckle belts.',
    signaturePieces: 'Pearl-snap shirts, trucker denim jackets, leather belts with silver buckles',
  },
  'Utilitarian Military': {
    name: 'Utilitarian Military',
    era: '1970s-1980s Surplus Revival',
    description: 'Field-tested surplus wear featuring olive drabs and reinforced ripstop.',
    signaturePieces: 'M-65 field jackets, BDU fatigue pants, olive drab thermal tops',
  },
  'Futuristic Cyberpunk': {
    name: 'Futuristic Cyberpunk',
    era: '2020s Neo-Tokyo',
    description: 'High-contrast neon details, angular tailoring, and sleek synthetic materials.',
    signaturePieces: 'Asymmetrical zip jackets, technical vests, high-collar coats',
  },
  'Coquette Softcore': {
    name: 'Coquette Softcore',
    era: '2020s Romantic Nostalgia',
    description: 'Soft pastels, delicate lace trimmings, ribbons, and sweet knitwear.',
    signaturePieces: 'Cropped pastel cardigans, pleated miniskirts, ballet flats, bow pins',
  },
  'Normcore': {
    name: 'Normcore',
    era: '2010s Anti-Fashion',
    description: 'Effortless everyday basics that celebrate comfort and hyper-normal staple pieces.',
    signaturePieces: 'Classic gray crewneck sweatshirts, straight-leg denim, neutral sneakers',
  },
  'Japanese Americana': {
    name: 'Japanese Americana',
    era: '1980s-Present Ametora',
    description: 'Obsessive Japanese reinterpretation of vintage American classic tailoring and denim.',
    signaturePieces: 'Selvedge raw denim, loopwheel cotton tees, sashiko overshirts',
  },
  'Rave Acid House': {
    name: 'Rave Acid House',
    era: 'Late 1980s - 1990s Club Culture',
    description: 'Euphoric fluorescent colors, nylon windbreakers, and wavy geometric patterns.',
    signaturePieces: 'Colorblock windbreakers, bucket hats, baggy parachute pants',
  },
  'Coastal Grandmillennial': {
    name: 'Coastal Grandmillennial',
    era: '1990s New England Coastal',
    description: 'Sun-bleached linens, fisherman cable knits, and nautical sea-breeze comfort.',
    signaturePieces: 'Chunky cream fisherman sweaters, crisp linen button-downs, canvas slip-ons',
  },
  'Clean Sartorial': {
    name: 'Clean Sartorial',
    era: 'Classic Modern Tailoring',
    description: 'Impeccable proportions, tailored trousers, double-breasted blazers, and clean lines.',
    signaturePieces: 'Pleated wool trousers, structured Italian blazers, penny loafers',
  },
};
