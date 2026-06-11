/**
 * Run: node backend/data/cropInfoSeed.js
 * Seeds the CropInfo collection with static crop knowledge base.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const CropInfo = require('../models/CropInfo');

const crops = [
  {
    name: 'Tomato',
    aliases: ['tamatar'],
    scientificName: 'Solanum lycopersicum',
    growingSeason: 'Kharif (June–Sep) & Rabi (Oct–Feb)',
    harvestTime: '60–80 days after transplanting',
    soilType: 'Well-drained loamy soil, pH 6.0–7.0',
    waterRequirement: 'Medium',
    estimatedYield: '20–25 tonnes per acre',
    colorProfile: { greenScore: 15, yellowIndex: 5 },
    diseases: [
      {
        name: 'Early Blight',
        symptoms: ['Dark brown spots with concentric rings', 'Yellowing around spots', 'Leaf drop'],
        treatment: ['Remove infected leaves', 'Apply Mancozeb 75% WP @ 2g/L', 'Avoid overhead irrigation'],
      },
      {
        name: 'Late Blight',
        symptoms: ['Water-soaked lesions', 'White mold on underside', 'Rapid wilting'],
        treatment: ['Spray Metalaxyl + Mancozeb', 'Destroy infected plants', 'Improve air circulation'],
      },
    ],
    pests: [
      {
        name: 'Whitefly',
        symptoms: ['Yellowing leaves', 'Sticky honeydew on leaves', 'Stunted growth'],
        treatment: ['Spray Imidacloprid 17.8 SL @ 0.3ml/L', 'Use yellow sticky traps', 'Remove weeds nearby'],
      },
    ],
  },
  {
    name: 'Wheat',
    aliases: ['gehun'],
    scientificName: 'Triticum aestivum',
    growingSeason: 'Rabi (Oct–Nov sowing, Mar–Apr harvest)',
    harvestTime: '120–150 days after sowing',
    soilType: 'Well-drained loam to clay-loam, pH 6.0–7.5',
    waterRequirement: 'Medium',
    estimatedYield: '15–20 quintals per acre',
    colorProfile: { greenScore: 10, yellowIndex: 15 },
    diseases: [
      {
        name: 'Yellow Rust',
        symptoms: ['Yellow stripes on leaves', 'Powdery yellow pustules', 'Premature drying'],
        treatment: ['Spray Propiconazole 25 EC @ 0.1%', 'Use resistant varieties', 'Early sowing'],
      },
    ],
    pests: [
      {
        name: 'Aphid',
        symptoms: ['Curling leaves', 'Sticky deposits', 'Yellowing tillers'],
        treatment: ['Spray Dimethoate 30 EC @ 1ml/L', 'Encourage natural predators'],
      },
    ],
  },
  {
    name: 'Rice',
    aliases: ['paddy', 'chawal', 'dhan'],
    scientificName: 'Oryza sativa',
    growingSeason: 'Kharif (June–July sowing)',
    harvestTime: '100–150 days after sowing',
    soilType: 'Clay or clay-loam, pH 5.5–6.5',
    waterRequirement: 'High',
    estimatedYield: '20–25 quintals per acre',
    colorProfile: { greenScore: 20, yellowIndex: 8 },
    diseases: [
      {
        name: 'Blast',
        symptoms: ['Diamond-shaped lesions on leaves', 'Gray center with brown border', 'Neck rot'],
        treatment: ['Spray Tricyclazole 75 WP @ 0.6g/L', 'Avoid excess nitrogen', 'Drain fields periodically'],
      },
    ],
    pests: [
      {
        name: 'Brown Plant Hopper',
        symptoms: ['Hopper burn (circular drying patches)', 'Honeydew deposits', 'Lodging'],
        treatment: ['Spray Buprofezin 25 SC @ 1ml/L', 'Avoid excess nitrogen', 'Drain water for 3–4 days'],
      },
    ],
  },
  {
    name: 'Potato',
    aliases: ['aloo'],
    scientificName: 'Solanum tuberosum',
    growingSeason: 'Rabi (Oct–Nov)',
    harvestTime: '70–120 days after planting',
    soilType: 'Sandy loam, pH 5.2–6.4',
    waterRequirement: 'Medium',
    estimatedYield: '80–120 quintals per acre',
    colorProfile: { greenScore: 12, yellowIndex: 10 },
    diseases: [
      {
        name: 'Late Blight',
        symptoms: ['Dark water-soaked lesions', 'White fungal growth', 'Tuber rot'],
        treatment: ['Spray Cymoxanil + Mancozeb', 'Use certified seed', 'Avoid waterlogging'],
      },
    ],
    pests: [
      {
        name: 'Potato Tuber Moth',
        symptoms: ['Mines in leaves', 'Tunneling in tubers', 'Frass visible'],
        treatment: ['Deep planting', 'Spray Chlorpyrifos 20 EC', 'Proper storage'],
      },
    ],
  },
  {
    name: 'Onion',
    aliases: ['pyaz', 'kanda'],
    scientificName: 'Allium cepa',
    growingSeason: 'Kharif (June–July) & Rabi (Oct–Nov)',
    harvestTime: '90–120 days after transplanting',
    soilType: 'Well-drained loamy soil, pH 6.0–7.5',
    waterRequirement: 'Medium',
    estimatedYield: '80–100 quintals per acre',
    colorProfile: { greenScore: 18, yellowIndex: 6 },
    diseases: [
      {
        name: 'Purple Blotch',
        symptoms: ['Small white lesions with purple center', 'Tip dieback', 'Bulb rot'],
        treatment: ['Spray Iprodione 50 WP @ 2g/L', 'Crop rotation', 'Avoid dense planting'],
      },
    ],
    pests: [
      {
        name: 'Thrips',
        symptoms: ['Silver streaks on leaves', 'Leaf curling', 'Stunted bulbs'],
        treatment: ['Spray Spinosad 45 SC @ 0.3ml/L', 'Blue sticky traps', 'Remove crop debris'],
      },
    ],
  },
  {
    name: 'Cotton',
    aliases: ['kapas', 'rui'],
    scientificName: 'Gossypium hirsutum',
    growingSeason: 'Kharif (April–May sowing)',
    harvestTime: '150–180 days after sowing',
    soilType: 'Deep black cotton soil, pH 6.0–8.0',
    waterRequirement: 'Medium',
    estimatedYield: '8–12 quintals per acre (seed cotton)',
    colorProfile: { greenScore: 14, yellowIndex: 7 },
    diseases: [
      {
        name: 'Bacterial Blight',
        symptoms: ['Angular water-soaked spots', 'Brown lesions', 'Boll rot'],
        treatment: ['Spray Streptocycline + Copper oxychloride', 'Use resistant varieties', 'Seed treatment'],
      },
    ],
    pests: [
      {
        name: 'Bollworm',
        symptoms: ['Entry holes in bolls', 'Frass near holes', 'Shedding of squares'],
        treatment: ['Spray Emamectin benzoate 5 SG @ 0.4g/L', 'Pheromone traps', 'Bt spray'],
      },
    ],
  },
  {
    name: 'Maize',
    aliases: ['makka', 'corn', 'bhutta'],
    scientificName: 'Zea mays',
    growingSeason: 'Kharif (June–July) & Rabi (Oct–Nov)',
    harvestTime: '90–110 days after sowing',
    soilType: 'Well-drained loamy soil, pH 5.8–7.0',
    waterRequirement: 'Medium',
    estimatedYield: '20–25 quintals per acre',
    colorProfile: { greenScore: 22, yellowIndex: 5 },
    diseases: [
      {
        name: 'Turcicum Blight',
        symptoms: ['Long elliptical gray-green lesions', 'Tan colored spots', 'Leaf blight'],
        treatment: ['Spray Mancozeb 75 WP @ 2g/L', 'Use resistant hybrids', 'Crop rotation'],
      },
    ],
    pests: [
      {
        name: 'Fall Armyworm',
        symptoms: ['Ragged leaf feeding', 'Frass in whorl', 'Window pane damage'],
        treatment: ['Spray Spinetoram 11.7 SC @ 0.5ml/L', 'Apply sand + lime in whorl', 'Early detection'],
      },
    ],
  },
  {
    name: 'Mustard',
    aliases: ['sarson', 'rai'],
    scientificName: 'Brassica juncea',
    growingSeason: 'Rabi (Oct–Nov sowing)',
    harvestTime: '110–140 days after sowing',
    soilType: 'Well-drained loamy soil, pH 6.0–7.5',
    waterRequirement: 'Low',
    estimatedYield: '6–8 quintals per acre',
    colorProfile: { greenScore: 16, yellowIndex: 20 },
    diseases: [
      {
        name: 'White Rust',
        symptoms: ['White pustules on leaves', 'Distorted stems', 'Yellowing'],
        treatment: ['Spray Metalaxyl + Mancozeb @ 2g/L', 'Avoid dense sowing', 'Crop rotation'],
      },
    ],
    pests: [
      {
        name: 'Aphid',
        symptoms: ['Colonies on tender shoots', 'Curling leaves', 'Honeydew deposits'],
        treatment: ['Spray Dimethoate 30 EC @ 1ml/L', 'Spray in early morning', 'Conserve natural enemies'],
      },
    ],
  },
  {
    name: 'Soybean',
    aliases: ['soya', 'bhatmas'],
    scientificName: 'Glycine max',
    growingSeason: 'Kharif (June–July)',
    harvestTime: '90–120 days after sowing',
    soilType: 'Well-drained loamy soil, pH 6.0–7.5',
    waterRequirement: 'Medium',
    estimatedYield: '8–12 quintals per acre',
    colorProfile: { greenScore: 19, yellowIndex: 8 },
    diseases: [
      {
        name: 'Rust',
        symptoms: ['Tan to brown pustules on leaves', 'Premature defoliation', 'Yield loss'],
        treatment: ['Spray Tebuconazole 25.9 EC @ 1ml/L', 'Early planting', 'Resistant varieties'],
      },
    ],
    pests: [
      {
        name: 'Stem Fly',
        symptoms: ['Wilting seedlings', 'Tunneling in stem', 'Dead heart'],
        treatment: ['Seed treatment with Thiamethoxam', 'Spray Dimethoate @ 1ml/L', 'Early sowing'],
      },
    ],
  },
  {
    name: 'Sugarcane',
    aliases: ['ganna', 'ikshu'],
    scientificName: 'Saccharum officinarum',
    growingSeason: 'Spring (Feb–Mar) & Autumn (Sep–Oct)',
    harvestTime: '10–18 months after planting',
    soilType: 'Deep loamy soil, pH 6.5–7.5',
    waterRequirement: 'High',
    estimatedYield: '300–400 quintals per acre',
    colorProfile: { greenScore: 25, yellowIndex: 6 },
    diseases: [
      {
        name: 'Red Rot',
        symptoms: ['Red discoloration of internal tissue', 'Sour smell', 'Wilting'],
        treatment: ['Use disease-free setts', 'Hot water treatment of setts', 'Crop rotation'],
      },
    ],
    pests: [
      {
        name: 'Early Shoot Borer',
        symptoms: ['Dead heart in young shoots', 'Frass in bored shoots', 'Wilting'],
        treatment: ['Remove and destroy dead hearts', 'Apply Carbofuran 3G @ 8kg/acre', 'Flood irrigation'],
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await CropInfo.deleteMany({});
  await CropInfo.insertMany(crops);
  console.log(`Seeded ${crops.length} crops into CropInfo collection`);
  await mongoose.disconnect();
}

seed().catch(console.error);
