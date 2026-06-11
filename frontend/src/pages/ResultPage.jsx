
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.result) { navigate('/'); return null; }

  const { result, budget, landArea } = state;
  const { selectedCrops, totalProfit, totalCost, bestMandi, mandiDetails } = result;

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <div className="max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fadeInUp">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              🌾 Optimization <span className="text-green-400">Results</span>
            </h1>
            <p className="text-green-200 text-sm mt-1">
              Budget: ₹{Number(budget).toLocaleString()} &nbsp;·&nbsp; Land: {landArea} acres
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="glass text-green-300 hover:text-white border border-green-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-green-600"
          >← New Query</button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fadeInUp">
          {[
            { label: 'Total Budget',  value: `₹${Number(budget).toLocaleString()}`,   icon: '💰', dark: false },
            { label: 'Amount Used',   value: `₹${totalCost.toLocaleString()}`,         icon: '🌱', dark: false },
            { label: 'Est. Profit',   value: `₹${totalProfit.toLocaleString()}`,       icon: '📈', dark: true  },
          ].map(({ label, value, icon, dark }) => (
            <div key={label} className={`rounded-2xl p-5 shadow-xl flex items-center gap-4 ${dark ? 'bg-gradient-to-br from-green-600 to-green-700 text-white' : 'glass-card text-gray-700'}`}>
              <span className="text-3xl">{icon}</span>
              <div>
                <p className={`text-xs uppercase tracking-wide ${dark ? 'text-green-200' : 'text-gray-400'}`}>{label}</p>
                <p className="text-xl font-black">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Crops */}
        <section className="mb-8 animate-fadeInUp">
          <h2 className="text-lg font-bold text-white mb-3">🌿 Recommended Crops</h2>
          {selectedCrops.length === 0 ? (
            <div className="glass rounded-2xl p-5 text-green-200">No crops fit within the budget.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCrops.map((crop) => (
                <div key={crop.name} className="glass-card rounded-2xl p-5 border-l-4 border-green-500 shadow-xl hover:scale-[1.01] transition-transform">
                  <h3 className="text-lg font-black text-green-700 capitalize mb-3">{crop.name}</h3>
                  <div className="grid grid-cols-2 gap-y-1.5 text-sm text-gray-600">
                    <span className="text-gray-400">Cost/acre</span>   <span className="font-semibold">₹{crop.cost.toLocaleString()}</span>
                    <span className="text-gray-400">Yield/acre</span>  <span className="font-semibold">{crop.yield} kg</span>
                    <span className="text-gray-400">Market Price</span><span className="font-semibold">₹{crop.price}/kg</span>
                    <span className="text-gray-400">Total Cost</span>  <span className="font-semibold">₹{crop.totalCost.toLocaleString()}</span>
                    <span className="text-gray-400">Profit</span>      <span className="font-black text-green-600 text-base">₹{crop.totalProfit.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mandi */}
        <section className="animate-fadeInUp">
          <h2 className="text-lg font-bold text-white mb-3">🏪 Target Market (Mandi)</h2>
          {!bestMandi ? (
            <div className="glass rounded-2xl p-5 text-green-200">No Mandi data available.</div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl p-5 shadow-xl">
                <p className="text-xs text-green-200 mb-1">Best Market</p>
                <h3 className="text-2xl font-black">🏪 {bestMandi.marketName}</h3>
                <p className="text-sm text-green-100 mt-1">Combined price score: ₹{bestMandi.totalPrice}/kg</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bestMandi.crops.map(c => (
                    <span key={c.crop} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {c.crop}: ₹{c.price}/kg
                    </span>
                  ))}
                </div>
              </div>
              {mandiDetails.length > 1 && (
                <div className="glass-card rounded-2xl p-4 shadow">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Other Markets</p>
                  <div className="space-y-2">
                    {mandiDetails.slice(1).map(m => (
                      <div key={m.marketName} className="flex justify-between text-sm text-gray-600 border-b pb-1 last:border-0">
                        <span>{m.marketName}</span>
                        <span className="font-semibold">₹{m.totalPrice}/kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
