const Crop = require('../models/Crop');
const Mandi = require('../models/Mandi');
const knapsack = require('../algorithms/knapsack');
const greedyMandi = require('../algorithms/greedy');

async function optimize(req, res) {
  try {
    const { budget, landArea } = req.body;

    if (!budget || !landArea || budget <= 0 || landArea <= 0) {
      return res.status(400).json({ error: 'Valid budget and landArea are required.' });
    }

    const [crops, mandis] = await Promise.all([
      Crop.find().lean(),
      Mandi.find().lean(),
    ]);

    if (!crops.length) {
      return res.status(404).json({ error: 'No crop data found in database.' });
    }

    // Run Knapsack
    const { selectedCrops, totalProfit, totalCost } = knapsack(crops, Number(budget), Number(landArea));

    if (!selectedCrops.length) {
      return res.status(200).json({
        message: 'Budget too low to select any crops.',
        selectedCrops: [],
        totalProfit: 0,
        totalCost: 0,
        bestMandi: null,
        mandiDetails: [],
      });
    }

    // Run Greedy Mandi selection
    const { bestMandi, mandiDetails } = greedyMandi(selectedCrops, mandis);

    return res.status(200).json({
      selectedCrops: selectedCrops.map((c) => ({
        name: c.name,
        cost: c.cost,
        yield: c.yield,
        price: c.price,
        totalCost: c.totalCost,
        totalProfit: c.totalProfit,
      })),
      totalProfit,
      totalCost,
      bestMandi,
      mandiDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

module.exports = { optimize };
