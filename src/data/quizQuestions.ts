export interface QuizOption {
  text: string;
  subtext?: string;
  aestheticWeights: Record<string, number>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your ideal Saturday afternoon outfit?",
    category: "Weekend Vibe",
    options: [
      {
        text: "Technical weatherproof shell, cargo pants & trail runners",
        aestheticWeights: { 'Gorpcore': 15, 'Techwear': 10, 'Utilitarian Military': 5 },
      },
      {
        text: "Oversized hoodie, vintage distressed denim & chunky sneakers",
        aestheticWeights: { 'Streetwear': 15, 'Skatecore': 10, '90s Grunge': 5 },
      },
      {
        text: "Pristine heavyweight boxy tee & clean pleated trousers",
        aestheticWeights: { 'Minimalist': 15, 'Quiet Luxury': 10, 'Clean Sartorial': 8 },
      },
      {
        text: "Thrifted 70s corduroy jacket & beat-up graphic tee",
        aestheticWeights: { 'Vintage 70s Retro': 15, 'Bohemian Indie': 10, '90s Grunge': 8 },
      },
    ],
  },
  {
    id: 2,
    question: "Which color palette dominates your dream closet?",
    category: "Color Preference",
    options: [
      {
        text: "Forest green, slate silver, jet black & deep charcoal",
        aestheticWeights: { 'Gorpcore': 10, 'Techwear': 12, 'Avant-Garde': 10 },
      },
      {
        text: "Cream, beige, camel, navy & crisp bone white",
        aestheticWeights: { 'Old Money': 15, 'Quiet Luxury': 15, 'Coastal Grandmillennial': 10 },
      },
      {
        text: "Faded olive, tobacco brown, washed mustard & denim blue",
        aestheticWeights: { 'Workwear': 15, 'Vintage 70s Retro': 12, 'Western Americana': 10 },
      },
      {
        text: "Electric neon highlights, silver metallics & pitch black",
        aestheticWeights: { 'Y2K Cyber': 15, 'Futuristic Cyberpunk': 15, 'Rave Acid House': 10 },
      },
    ],
  },
  {
    id: 3,
    question: "What footwear do you reach for the most?",
    category: "Footwear Choice",
    options: [
      {
        text: "Agile trail runners or technical Salomon/Vibram soles",
        aestheticWeights: { 'Gorpcore': 15, 'Normcore': 8, 'Techwear': 8 },
      },
      {
        text: "Lug-sole loafers, classic oxfords, or leather derbies",
        aestheticWeights: { 'Dark Academia': 15, 'Clean Sartorial': 15, 'Old Money': 10 },
      },
      {
        text: "Vintage terrace trainers (Samba/Gazelle) or retro skate shoes",
        aestheticWeights: { 'Blokecore': 15, 'Skatecore': 12, 'Streetwear': 8 },
      },
      {
        text: "Heavy combat boots, weathered Chelsea boots, or cowboy boots",
        aestheticWeights: { 'Punk Rock': 15, 'Western Americana': 12, '90s Grunge': 10 },
      },
    ],
  },
  {
    id: 4,
    question: "Pick an outerwear piece you would wear forever:",
    category: "Outerwear Staple",
    options: [
      {
        text: "Heavy duck canvas chore jacket or double-knee coat",
        aestheticWeights: { 'Workwear': 18, 'Japanese Americana': 10, 'Utilitarian Military': 8 },
      },
      {
        text: "3-layer Gore-Tex taped alpine technical shell",
        aestheticWeights: { 'Gorpcore': 18, 'Techwear': 12 },
      },
      {
        text: "Sculptural double-breasted virgin wool overcoat",
        aestheticWeights: { 'Quiet Luxury': 15, 'Clean Sartorial': 15, 'Avant-Garde': 10 },
      },
      {
        text: "Oversized flannel overshirt or worn-in leather biker jacket",
        aestheticWeights: { '90s Grunge': 15, 'Punk Rock': 15, 'Bohemian Indie': 8 },
      },
    ],
  },
  {
    id: 5,
    question: "Where do you find your favorite fashion inspiration?",
    category: "Inspiration Source",
    options: [
      {
        text: "Japanese street style magazines (Popeye, Tune, FRUiTS)",
        aestheticWeights: { 'Japanese Americana': 18, 'Avant-Garde': 12, 'Streetwear': 10 },
      },
      {
        text: "Vintage bins, flea markets, and local Goodwill racks",
        aestheticWeights: { 'Vintage 70s Retro': 15, '90s Grunge': 12, 'Normcore': 10 },
      },
      {
        text: "Old European campus libraries, art archives, and classic cinema",
        aestheticWeights: { 'Dark Academia': 18, 'Old Money': 12, 'Clean Sartorial': 10 },
      },
      {
        text: "Outdoor trail expeditions, climbing documentaries & brutalist architecture",
        aestheticWeights: { 'Gorpcore': 15, 'Techwear': 15, 'Minimalist': 10 },
      },
    ],
  },
  {
    id: 6,
    question: "What's your go-to fit silhouette?",
    category: "Silhouette",
    options: [
      {
        text: "Ultra-wide baggy puddle pants with a cropped boxy top",
        aestheticWeights: { 'Skatecore': 15, 'Streetwear': 12, '90s Grunge': 10 },
      },
      {
        text: "Clean, straight-leg tailored drape with zero excess fabric",
        aestheticWeights: { 'Minimalist': 18, 'Clean Sartorial': 12, 'Normcore': 8 },
      },
      {
        text: "Asymmetrical layers, micro-pleats, and sculptural volumes",
        aestheticWeights: { 'Avant-Garde': 18, 'Futuristic Cyberpunk': 10 },
      },
      {
        text: "Fitted knit sweater, high-waisted pleated trousers, and structured collar",
        aestheticWeights: { 'Old Money': 15, 'Dark Academia': 12, 'Coastal Grandmillennial': 10 },
      },
    ],
  },
  {
    id: 7,
    question: "Which music genre best matches your everyday playlist?",
    category: "Music Resonance",
    options: [
      {
        text: "Underground Hip-Hop, Grime & Golden Era Beats",
        aestheticWeights: { 'Streetwear': 15, 'Skatecore': 10, 'Blokecore': 8 },
      },
      {
        text: "Post-Punk, 90s Alt-Rock & Shoegaze",
        aestheticWeights: { 'Punk Rock': 15, '90s Grunge': 15, 'Bohemian Indie': 8 },
      },
      {
        text: "Ambient Electronic, Dark Synthwave & UK Garage",
        aestheticWeights: { 'Techwear': 15, 'Futuristic Cyberpunk': 15, 'Rave Acid House': 12 },
      },
      {
        text: "70s Soul, Bossa Nova, Folk & Classic Jazz",
        aestheticWeights: { 'Vintage 70s Retro': 15, 'Quiet Luxury': 10, 'Coastal Grandmillennial': 10 },
      },
    ],
  },
  {
    id: 8,
    question: "Select your favorite pants style:",
    category: "Pants & Bottoms",
    options: [
      {
        text: "Double-knee heavyweight work pants with hammer loops",
        aestheticWeights: { 'Workwear': 18, 'Skatecore': 10, 'Japanese Americana': 8 },
      },
      {
        text: "Micro-pleated fluid trousers that sway when walking",
        aestheticWeights: { 'Avant-Garde': 18, 'Minimalist': 12 },
      },
      {
        text: "Ripstop nylon cargo pants with cinched bungee ankles",
        aestheticWeights: { 'Techwear': 15, 'Gorpcore': 15, 'Y2K Cyber': 8 },
      },
      {
        text: "100% Selvedge raw denim with a clean single cuff",
        aestheticWeights: { 'Japanese Americana': 18, 'Western Americana': 10, 'Normcore': 8 },
      },
    ],
  },
  {
    id: 9,
    question: "How do you feel about visible brand logos?",
    category: "Branding Attitude",
    options: [
      {
        text: "Zero logos — true luxury and quality speaks silently through craftsmanship",
        aestheticWeights: { 'Quiet Luxury': 18, 'Minimalist': 15, 'Clean Sartorial': 10 },
      },
      {
        text: "Bold graphic prints, box logos, and iconic street emblems",
        aestheticWeights: { 'Streetwear': 18, 'Skatecore': 10, 'Rave Acid House': 8 },
      },
      {
        text: "Only functional technical badges like Gore-Tex or subtle reflective hits",
        aestheticWeights: { 'Gorpcore': 15, 'Techwear': 15 },
      },
      {
        text: "Vintage sports crests, 80s sponsor badges, and retro collegiate letters",
        aestheticWeights: { 'Blokecore': 18, 'Old Money': 10, 'Dark Academia': 10 },
      },
    ],
  },
  {
    id: 10,
    question: "What accessory can you never leave home without?",
    category: "Essential Accessory",
    options: [
      {
        text: "Tactical cross-body sling with carabiners and waterproof zips",
        aestheticWeights: { 'Techwear': 15, 'Gorpcore': 15 },
      },
      {
        text: "Sterling silver signet ring, slim cable chain, or leather watch",
        aestheticWeights: { 'Quiet Luxury': 12, 'Minimalist': 12, 'Clean Sartorial': 12 },
      },
      {
        text: "Washed dad cap, beanie, or retro 5-panel corduroy hat",
        aestheticWeights: { 'Normcore': 15, 'Workwear': 10, 'Skatecore': 10 },
      },
      {
        text: "Thrifted silk scarf, delicate ribbon, or Western buckle belt",
        aestheticWeights: { 'Western Americana': 12, 'Coquette Softcore': 15, 'Bohemian Indie': 10 },
      },
    ],
  },
  {
    id: 11,
    question: "What's your ideal weekend travel destination?",
    category: "Destination",
    options: [
      {
        text: "Alpine hiking cabin in the misty Pacific Northwest mountains",
        aestheticWeights: { 'Gorpcore': 18, 'Normcore': 8 },
      },
      {
        text: "A boutique hotel in Tokyo exploring Nakameguro vintage stores",
        aestheticWeights: { 'Japanese Americana': 15, 'Avant-Garde': 15, 'Streetwear': 10 },
      },
      {
        text: "Coastal estate in Martha's Vineyard or an Italian seaside villa",
        aestheticWeights: { 'Old Money': 15, 'Coastal Grandmillennial': 18, 'Quiet Luxury': 12 },
      },
      {
        text: "Old library town in Edinburgh browsing antique bookshops",
        aestheticWeights: { 'Dark Academia': 18, 'Vintage 70s Retro': 8 },
      },
    ],
  },
  {
    id: 12,
    question: "What fabric texture feels most comforting to wear?",
    category: "Texture & Fabric",
    options: [
      {
        text: "Ultra-soft brushed mohair or heavy cable-knit wool",
        aestheticWeights: { 'Minimalist': 12, 'Dark Academia': 12, 'Old Money': 12 },
      },
      {
        text: "Rugged 12oz duck canvas and broken-in rigid cotton denim",
        aestheticWeights: { 'Workwear': 18, 'Western Americana': 12, 'Japanese Americana': 10 },
      },
      {
        text: "Crisp waterproof ripstop nylon with taped seam backing",
        aestheticWeights: { 'Gorpcore': 15, 'Techwear': 15 },
      },
      {
        text: "Distressed thermal waffle knit or sun-faded vintage jersey",
        aestheticWeights: { '90s Grunge': 15, 'Vintage 70s Retro': 12, 'Normcore': 10 },
      },
    ],
  },
  {
    id: 13,
    question: "What era of fashion would you time travel to?",
    category: "Decade Love",
    options: [
      {
        text: "1970s: Wide lapels, groovy earth tones, flares & corduroy",
        aestheticWeights: { 'Vintage 70s Retro': 20, 'Bohemian Indie': 12 },
      },
      {
        text: "1990s: Grunge flannel, Britpop sportswear & oversized hip-hop",
        aestheticWeights: { '90s Grunge': 18, 'Blokecore': 12, 'Streetwear': 10 },
      },
      {
        text: "Early 2000s: Y2K metallics, shiny tracksuits, and tech optimistic futurism",
        aestheticWeights: { 'Y2K Cyber': 20, 'Rave Acid House': 12 },
      },
      {
        text: "Right now: Hybrid modular utility combining technical gear with luxury cuts",
        aestheticWeights: { 'Gorpcore': 15, 'Techwear': 15, 'Quiet Luxury': 10 },
      },
    ],
  },
  {
    id: 14,
    question: "How do you prefer your tees and shirts to fit?",
    category: "Shirt Silhouette",
    options: [
      {
        text: "Boxy, dropped shoulders, thick high-rib collar, slightly cropped",
        aestheticWeights: { 'Streetwear': 15, 'Minimalist': 12, 'Skatecore': 10 },
      },
      {
        text: "Slim tailored button-down tucked smoothly into trousers",
        aestheticWeights: { 'Clean Sartorial': 18, 'Old Money': 14, 'Dark Academia': 10 },
      },
      {
        text: "Distressed oversized slouch with frayed hems and worn graphics",
        aestheticWeights: { '90s Grunge': 18, 'Punk Rock': 14, 'Bohemian Indie': 8 },
      },
      {
        text: "Pearl-snap Western shirt with contrast yoke stitching",
        aestheticWeights: { 'Western Americana': 20, 'Vintage 70s Retro': 10 },
      },
    ],
  },
  {
    id: 15,
    question: "What's your attitude toward vintage clothing stores?",
    category: "Thrifting Mindset",
    options: [
      {
        text: "I love digging through $10 bins for 90s single-stitch gems and faded Carhartt",
        aestheticWeights: { '90s Grunge': 15, 'Workwear': 15, 'Vintage 70s Retro': 12 },
      },
      {
        text: "I seek curated archival designer pieces (Margiela, Issey, Raf)",
        aestheticWeights: { 'Avant-Garde': 18, 'Quiet Luxury': 12, 'Minimalist': 10 },
      },
      {
        text: "I hunt for authentic 80s/90s football kits and retro track tops",
        aestheticWeights: { 'Blokecore': 20, 'Rave Acid House': 10 },
      },
      {
        text: "I prefer high-quality military surplus field jackets and fatigue pants",
        aestheticWeights: { 'Utilitarian Military': 20, 'Workwear': 10 },
      },
    ],
  },
  {
    id: 16,
    question: "Which jacket silhouette do you gravitate toward?",
    category: "Jacket Cut",
    options: [
      {
        text: "Harrington jacket or classic unlined cotton bomber",
        aestheticWeights: { 'Normcore': 15, 'Old Money': 12, 'Blokecore': 10 },
      },
      {
        text: "Asymmetrical technical shell with taped waterproof diagonal zip",
        aestheticWeights: { 'Techwear': 18, 'Futuristic Cyberpunk': 15 },
      },
      {
        text: "Tailored tweed or houndstooth blazer with elbow patches",
        aestheticWeights: { 'Dark Academia': 20, 'Clean Sartorial': 12 },
      },
      {
        text: "Oversized cozy knit cardigan with contrast pearl buttons or ribbons",
        aestheticWeights: { 'Coquette Softcore': 18, 'Bohemian Indie': 12 },
      },
    ],
  },
  {
    id: 17,
    question: "When picking knitwear, what stands out?",
    category: "Knitwear Preference",
    options: [
      {
        text: "Chunky Aran cable-knit fisherman crewneck in undyed ecru wool",
        aestheticWeights: { 'Coastal Grandmillennial': 18, 'Old Money': 15, 'Dark Academia': 10 },
      },
      {
        text: "Fluffy fuzzy mohair sweater with bold abstract color-blocking",
        aestheticWeights: { 'Vintage 70s Retro': 15, 'Avant-Garde': 12, '90s Grunge': 10 },
      },
      {
        text: "Fine-gauge lightweight Merino wool turtleneck",
        aestheticWeights: { 'Minimalist': 15, 'Clean Sartorial': 15, 'Quiet Luxury': 15 },
      },
      {
        text: "Wavy geometric textured 90s sweater (Coogi / rave style)",
        aestheticWeights: { 'Rave Acid House': 18, 'Vintage 70s Retro': 10, 'Streetwear': 10 },
      },
    ],
  },
  {
    id: 18,
    question: "What's your go-to headwear?",
    category: "Headwear",
    options: [
      {
        text: "Fisherman ribbed watch cap / roll-up beanie",
        aestheticWeights: { 'Workwear': 15, 'Skatecore': 12, '90s Grunge': 10 },
      },
      {
        text: "Technical 5-panel bungee cinch cap in breathable nylon",
        aestheticWeights: { 'Gorpcore': 18, 'Techwear': 12 },
      },
      {
        text: "Vintage corduroy unstructured baseball cap with small embroidery",
        aestheticWeights: { 'Normcore': 15, 'Vintage 70s Retro': 10, 'Old Money': 10 },
      },
      {
        text: "No hat, just a clean haircut or natural textured hair",
        aestheticWeights: { 'Minimalist': 15, 'Clean Sartorial': 15, 'Quiet Luxury': 12 },
      },
    ],
  },
  {
    id: 19,
    question: "How do you style footwear with trousers?",
    category: "Trouser Break",
    options: [
      {
        text: "Generous puddle stacking over chunky low-top sneakers",
        aestheticWeights: { 'Skatecore': 15, 'Streetwear': 15, 'Y2K Cyber': 10 },
      },
      {
        text: "Zero break clean crop just above the ankle, highlighting socks or derbies",
        aestheticWeights: { 'Minimalist': 15, 'Clean Sartorial': 15, 'Dark Academia': 12 },
      },
      {
        text: "Bungee hem toggle pulled tight over trail lugs to show shoe tech",
        aestheticWeights: { 'Gorpcore': 18, 'Techwear': 15 },
      },
      {
        text: "Straight leg gently falling over boots with a crisp raw denim cuff",
        aestheticWeights: { 'Workwear': 15, 'Western Americana': 15, 'Japanese Americana': 12 },
      },
    ],
  },
  {
    id: 20,
    question: "In one word, what should your personal style convey?",
    category: "Style Manifesto",
    options: [
      {
        text: "Resilient: prepared for any weather, durable, and ready for adventure",
        aestheticWeights: { 'Gorpcore': 18, 'Workwear': 12, 'Utilitarian Military': 10 },
      },
      {
        text: "Refined: understated, impeccably cut, quiet, and timeless",
        aestheticWeights: { 'Quiet Luxury': 18, 'Clean Sartorial': 15, 'Minimalist': 15 },
      },
      {
        text: "Expressive: nostalgic, thrifted, subversive, and full of cultural stories",
        aestheticWeights: { 'Vintage 70s Retro': 15, '90s Grunge': 15, 'Punk Rock': 12, 'Blokecore': 10 },
      },
      {
        text: "Futuristic: innovative, geometric, tactical, and boundary-pushing",
        aestheticWeights: { 'Techwear': 18, 'Avant-Garde': 15, 'Futuristic Cyberpunk': 15 },
      },
    ],
  },
];
