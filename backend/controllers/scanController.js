const { GoogleGenerativeAI } = require('@google/generative-ai');
const { processImage } = require('../utils/imageProcessor');
const { fetchMandiPrices, summarizePrices } = require('../services/mandiPriceService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanCrop(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    // ── Step 1: Preprocess image with Sharp ───────────────────────
    const { processedBuffer, mimeType, meta } = await processImage(req.file.buffer);

    // ── Step 2: Gemini Vision — identify crop + health ────────────
    const model = genAI.getGenerativeModel({ model:  "models/gemini-2.0-flash" });

    const imagePart = {
      inlineData: {
        data: processedBuffer.toString('base64'),
        mimeType,
      },
    };

    const statsContext = meta
      ? `Pixel stats: brightness=${meta.brightness}/255, tone="${meta.dominantTone}", ` +
        `green=${meta.greenScore}, yellow=${meta.yellowIndex}, necrosis=${meta.necrosisHint}.`
      : '';

    const prompt = `You are an expert agricultural scientist and plant pathologist.
${statsContext}
Analyze this crop/plant image. Respond ONLY in this exact JSON (no markdown, no extra text):
{
  "cropName": "common name of the crop, e.g. Tomato",
  "scientificName": "scientific name",
  "confidence": "High / Medium / Low",
  "healthStatus": "Healthy / Diseased / Pest-Infected / Stressed / Unknown",
  "diseaseOrPest": "name of disease or pest, or null if healthy",
  "diseaseDescription": "what it is and how it spreads, or null",
  "symptoms": ["visible symptom 1", "visible symptom 2"],
  "treatment": ["actionable treatment step 1", "step 2"],
  "growingSeason": "e.g. Kharif (June-October)",
  "harvestTime": "e.g. 90-120 days after sowing",
  "soilType": "e.g. Well-drained loamy soil",
  "waterRequirement": "Low / Medium / High",
  "estimatedYield": "e.g. 20-25 tonnes per acre",
  "agmarknetName": "exact commodity name as listed on Agmarknet/data.gov.in, e.g. Tomato"
}`;

    const geminiResult = await model.generateContent([prompt, imagePart]);
    const raw = geminiResult.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/```$/, '').trim();

    let cropData;
    try {
      cropData = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: 'Could not parse AI response. Try a clearer image.' });
    }

    // ── Step 3: Fetch REAL mandi prices from data.gov.in ─────────
    let mandiData = null;
    let priceSummary = null;

    try {
      const cropNameForAPI = cropData.agmarknetName || cropData.cropName;
      mandiData = await fetchMandiPrices(cropNameForAPI, 20);
      priceSummary = summarizePrices(mandiData.records);
    } catch (priceErr) {
      console.warn('Mandi price fetch failed:', priceErr.message);
      // Non-fatal — still return crop analysis
    }

    // ── Step 4: Compose final response ───────────────────────────
    return res.status(200).json({
      // Crop identification
      cropName:        cropData.cropName,
      scientificName:  cropData.scientificName,
      confidence:      cropData.confidence,

      // Health analysis
      healthStatus:    cropData.healthStatus,
      diseaseOrPest:   cropData.diseaseOrPest,
      diseaseDescription: cropData.diseaseDescription,
      symptoms:        cropData.symptoms,
      treatment:       cropData.treatment,

      // Farming info
      growingSeason:   cropData.growingSeason,
      harvestTime:     cropData.harvestTime,
      soilType:        cropData.soilType,
      waterRequirement: cropData.waterRequirement,
      estimatedYield:  cropData.estimatedYield,

      // Real market prices
      marketData: mandiData
        ? {
            commodity:    mandiData.commodity,
            source:       'Agmarknet / data.gov.in (live)',
            summary:      priceSummary,
            topMarkets:   mandiData.records.slice(0, 10), // top 10 by price
          }
        : null,

      // Image processing metadata
      imageMeta: meta,
    });

  } catch (err) {
    console.error('Scan error:', err.message);
    res.status(500).json({ error: err.message || 'Scan failed.' });
  }
}

module.exports = { scanCrop };
