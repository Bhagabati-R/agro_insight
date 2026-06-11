/**
 * Fetches REAL daily mandi prices from data.gov.in (Agmarknet).
 * API: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
 *
 * Get your free API key at: https://data.gov.in/user/register
 */

const axios = require('axios');

const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY  = process.env.DATA_GOV_API_KEY;

// Crop name aliases — Gemini may return "Tomato" but Agmarknet uses "Tomato"
// Add more mappings as needed
const CROP_ALIASES = {
  'chilli':      'Dry Chillies',
  'chili':       'Dry Chillies',
  'red chilli':  'Dry Chillies',
  'paddy':       'Paddy(Dhan)(Common)',
  'rice':        'Rice',
  'wheat':       'Wheat',
  'maize':       'Maize',
  'corn':        'Maize',
  'tomato':      'Tomato',
  'potato':      'Potato',
  'onion':       'Onion',
  'soybean':     'Soyabean',
  'soya':        'Soyabean',
  'cotton':      'Cotton',
  'mustard':     'Mustard',
  'sugarcane':   'Sugarcane',
  'banana':      'Banana',
  'mango':       'Mango',
  'groundnut':   'Groundnut',
  'sunflower':   'Sunflower',
  'turmeric':    'Turmeric',
  'garlic':      'Garlic',
  'ginger':      'Ginger',
  'cauliflower': 'Cauliflower',
  'cabbage':     'Cabbage',
  'brinjal':     'Brinjal',
  'eggplant':    'Brinjal',
  'pea':         'Peas Wet',
  'lentil':      'Lentil',
  'chickpea':    'Gram',
  'gram':        'Gram',
};

function normalizeCropName(name) {
  const lower = name.toLowerCase().trim();
  return CROP_ALIASES[lower] || name;
}

/**
 * Fetch live mandi prices for a given crop.
 * Returns array of { market, district, state, minPrice, maxPrice, modalPrice, date }
 */
async function fetchMandiPrices(cropName, limit = 20) {
  const commodity = normalizeCropName(cropName);

  const params = {
    'api-key': API_KEY,
    format:    'json',
    limit,
    'filters[commodity]': commodity,
  };

  try {
    const { data } = await axios.get(BASE_URL, { params, timeout: 10000 });

    if (!data.records || data.records.length === 0) {
      return { commodity, records: [], source: 'agmarknet' };
    }

    const records = data.records.map((r) => ({
      market:     r.market,
      district:   r.district,
      state:      r.state,
      minPrice:   Number(r.min_price),
      maxPrice:   Number(r.max_price),
      modalPrice: Number(r.modal_price), // most common traded price
      date:       r.arrival_date,
    }));

    // Sort by modal price descending — best price first
    records.sort((a, b) => b.modalPrice - a.modalPrice);

    return { commodity, records, source: 'agmarknet' };
  } catch (err) {
    console.error('Agmarknet API error:', err.message);
    throw new Error('Could not fetch live mandi prices. Check DATA_GOV_API_KEY.');
  }
}

/**
 * Get price summary: best market, average, min, max
 */
function summarizePrices(records) {
  if (!records.length) return null;

  const modals = records.map((r) => r.modalPrice).filter(Boolean);
  const avg    = Math.round(modals.reduce((a, b) => a + b, 0) / modals.length);
  const best   = records[0]; // already sorted by modal price desc

  return {
    bestMarket:    best.market,
    bestDistrict:  best.district,
    bestState:     best.state,
    bestPrice:     best.modalPrice,
    averagePrice:  avg,
    lowestPrice:   Math.min(...modals),
    highestPrice:  Math.max(...modals),
    totalMarkets:  records.length,
  };
}

module.exports = { fetchMandiPrices, summarizePrices, normalizeCropName };
