const { GoogleGenerativeAI } = require('@google/generative-ai');
const { processImage } = require('../utils/imageProcessor');
const { fetchMandiPrices, summarizePrices } = require('../services/mandiPriceService');
const CropInfo = require('../models/CropInfo');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /api/crops
async function getAllCrops(req, res) {
  const crops = await CropInfo.find({}, 'name scientificName growingSeason waterRequirement');
  res.json(crops);
}

// GET /api/crops/:name
async function getCropByName(req, res) {
  const crop = await CropInfo.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${req.params.name}$`, 'i') } },
      { aliases: { $regex: new RegExp(`^${req.params.name}$`, 'i') } },
    ],
  });
  if (!crop) return res.status(404).json({ error: 'Crop not found.' });
  res.json(crop);
}

// GET /api/crops/:name/mandi
async function getCropMandiPrices(req, res) {
  try {
    const mandiData = await fetchMandiPrices(req.params.name, Number(req.query.limit) || 20);
    res.json({ ...mandiData, summary: summarizePrices(mandiData.records) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

// POST /api/identify  — Gemini Vision identifies crop, then fetch live mandi prices
async function identifyCrop(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    // Step 1: preprocess image
    const { processedBuffer, mimeType, meta } = await processImage(req.file.buffer);

    // Step 2: Gemini Vision — identify crop
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const imagePart = {
      inlineData: {
        data: processedBuffer.toString('base64'),
        mimeType,
      },
    };

    const prompt = `You are an expert Indian agricultural scientist.
Analyze this plant/crop/vegetable image carefully.
Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "cropName": "common name in English, e.g. Tomato",
  "localName": "Hindi/regional name if known, e.g. Tamatar",
  "scientificName": "scientific name",
  "confidence": "High / Medium / Low",
  "category": "Vegetable / Fruit / Cereal / Pulse / Oilseed / Spice / Fiber / Fodder / Unknown",
  "healthStatus": "Healthy / Diseased / Pest-Infected / Stressed / Unknown",
  "diseaseOrPest": "name of disease or pest detected, or null",
  "diseaseDescription": "brief description, or null",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["treatment step 1", "treatment step 2"],
  "growingSeason": "e.g. Kharif (June-Oct) or Rabi (Oct-Mar)",
  "harvestTime": "e.g. 60-90 days after sowing",
  "soilType": "e.g. Well-drained loamy soil",
  "waterRequirement": "Low / Medium / High",
  "estimatedYield": "e.g. 20-25 tonnes per acre",
  "agmarknetName": "exact commodity name used on Agmarknet/data.gov.in for price lookup"
}
Cover all Indian crops including: all cereals, pulses, oilseeds, vegetables, fruits, spices, fiber crops, and medicinal plants grown in India.`;

    const result = await model.generateContent([prompt, imagePart]);
    const raw = result.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/```$/, '').trim();

    let cropData;
    try {
      cropData = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Could not parse AI response. Try a clearer image.' });
    }

    // Step 3: fetch live mandi prices
    let marketData = null;
    try {
      const name = cropData.agmarknetName || cropData.cropName;
      const mandiData = await fetchMandiPrices(name, 10);
      marketData = { ...mandiData, summary: summarizePrices(mandiData.records) };
    } catch (_) { /* non-fatal */ }

    return res.json({
      identified: {
        name:            cropData.cropName,
        localName:       cropData.localName,
        scientificName:  cropData.scientificName,
        category:        cropData.category,
        growingSeason:   cropData.growingSeason,
        harvestTime:     cropData.harvestTime,
        soilType:        cropData.soilType,
        waterRequirement: cropData.waterRequirement,
        estimatedYield:  cropData.estimatedYield,
      },
      confidence:    cropData.confidence,
      healthStatus:  cropData.healthStatus,
      detectedIssue: cropData.diseaseOrPest
        ? {
            name:      cropData.diseaseOrPest,
            description: cropData.diseaseDescription,
            symptoms:  cropData.symptoms,
            treatment: cropData.treatment,
          }
        : null,
      marketData,
      imageMeta: meta,
    });

  } catch (err) {
    console.error('Identify error:', err.message);
    if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
      return res.status(500).json({
        error: 'Gemini API key missing or invalid. Add GEMINI_API_KEY to backend/.env',
      });
    }
    res.status(500).json({ error: err.message || 'Identification failed.' });
  }
}

module.exports = { getAllCrops, getCropByName, getCropMandiPrices, identifyCrop };
