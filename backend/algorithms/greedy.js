/**
 * Greedy Mandi Selector – for each selected crop, finds the Mandi offering
 * the highest price. Then picks the single best overall Mandi by total value.
 *
 * @param {Array} selectedCrops - Crops chosen by knapsack
 * @param {Array} mandis        - All Mandi records { marketName, crop, price }
 * @returns {{ bestMandi: string, mandiDetails: Array }}
 */
function greedyMandi(selectedCrops, mandis) {
  const cropNames = new Set(selectedCrops.map((c) => c.name));

  // Group mandis by marketName, summing prices for selected crops only
  const mandiScores = {};

  for (const mandi of mandis) {
    if (!cropNames.has(mandi.crop)) continue;

    if (!mandiScores[mandi.marketName]) {
      mandiScores[mandi.marketName] = { marketName: mandi.marketName, totalPrice: 0, crops: [] };
    }
    mandiScores[mandi.marketName].totalPrice += mandi.price;
    mandiScores[mandi.marketName].crops.push({ crop: mandi.crop, price: mandi.price });
  }

  const ranked = Object.values(mandiScores).sort((a, b) => b.totalPrice - a.totalPrice);

  return {
    bestMandi: ranked[0] || null,
    mandiDetails: ranked,
  };
}

module.exports = greedyMandi;
