/**
 * 0/1 Knapsack – selects the most profitable crop combination within budget.
 *
 * @param {Array}  crops      - Array of { name, cost, yield, price }
 * @param {number} budget     - Total available budget (₹)
 * @param {number} landArea   - Total land area (units)
 * @returns {{ selectedCrops: Array, totalProfit: number, totalCost: number }}
 */
function knapsack(crops, budget, landArea) {
  // Normalize to units of 1000 to keep DP table small (max ~10,000 cells)
  const UNIT = 1000;

  const items = crops.map((c) => ({
    ...c,
    totalCost:   Math.round(c.cost * landArea),
    totalProfit: Math.round((c.yield * c.price - c.cost) * landArea),
    // scaled cost for DP
    scaledCost: Math.max(1, Math.round((c.cost * landArea) / UNIT)),
  }));

  const W = Math.max(1, Math.round(budget / UNIT)); // e.g. 50000 → 50
  const n = items.length;

  // Build DP table (1D rolling array for space efficiency)
  const dp = new Array(W + 1).fill(0);
  // Track selections
  const keep = Array.from({ length: n }, () => new Array(W + 1).fill(false));

  for (let i = 0; i < n; i++) {
    const { scaledCost, totalProfit } = items[i];
    for (let w = W; w >= scaledCost; w--) {
      const withItem = dp[w - scaledCost] + totalProfit;
      if (withItem > dp[w]) {
        dp[w] = withItem;
        keep[i][w] = true;
      }
    }
  }

  // Backtrack
  const selectedCrops = [];
  let w = W;
  for (let i = n - 1; i >= 0; i--) {
    if (keep[i][w]) {
      selectedCrops.push(items[i]);
      w -= items[i].scaledCost;
    }
  }

  return {
    selectedCrops,
    totalProfit: dp[W],
    totalCost: selectedCrops.reduce((sum, c) => sum + c.totalCost, 0),
  };
}

module.exports = knapsack;
