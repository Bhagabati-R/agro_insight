
import { useState } from 'react';

const healthConfig = {
  'Healthy':       { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  icon: '✅' },
  'Diseased':      { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    icon: '🦠' },
  'Pest-Infected': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: '🐛' },
  'Stressed':      { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: '⚠️' },
  'Unknown':       { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-300',   icon: '❓' },
};

/* ── Accordion card ── */
function AccordionCard({ icon, title, badge, badgeColor = 'bg-green-100 text-green-700', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`glass-card rounded-2xl shadow-lg transition-all duration-300 overflow-hidden
        hover:-translate-y-1 hover:shadow-xl`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-bold text-gray-800 text-sm sm:text-base">{title}</span>
          {badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <span className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-fadeInUp">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ScanResult({ result, onReset }) {
  const { identified, confidence, healthStatus, detectedIssue, imageMeta, marketData } = result;
  const hc = healthConfig[healthStatus] || healthConfig.Unknown;

  if (!identified) {
    return (
      <div className="mt-6 glass rounded-2xl p-6 text-center animate-fadeInUp">
        <p className="text-yellow-300 text-lg mb-3">🤔 Could not identify the crop</p>
        <p className="text-white/60 text-sm mb-4">Try a clearer, closer photo of the plant or leaf.</p>
        <button onClick={onReset} className="shimmer-btn text-white px-6 py-2 rounded-xl font-semibold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 animate-fadeInUp">

      {/* ── Identity hero card ── */}
      <div className="glass-card rounded-2xl p-5 shadow-xl border-l-4 border-green-500">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Identified Crop</p>
            <h2 className="text-2xl sm:text-3xl font-black text-green-700 truncate">{identified.name}</h2>
            {identified.localName && (
              <p className="text-sm text-green-600 font-semibold mt-0.5">{identified.localName}</p>
            )}
            <p className="text-xs text-gray-400 italic mt-0.5">{identified.scientificName}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {identified.category && (
                <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                  {identified.category}
                </span>
              )}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                confidence === 'High' ? 'bg-green-100 text-green-700' :
                confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
              }`}>
                {confidence} confidence
              </span>
            </div>
          </div>
          <span className={`self-start text-sm font-bold px-4 py-2 rounded-full border-2 whitespace-nowrap
            ${hc.bg} ${hc.text} ${hc.border}`}>
            {hc.icon} {healthStatus}
          </span>
        </div>
      </div>

      {/* ── Treatment (open by default if issue found) ── */}
      {detectedIssue ? (
        <AccordionCard
          icon={healthStatus === 'Pest-Infected' ? '🐛' : '🦠'}
          title={detectedIssue.name}
          badge={healthStatus}
          badgeColor="bg-red-100 text-red-700"
          defaultOpen={true}
        >
          {detectedIssue.description && (
            <p className="text-sm text-gray-600 mb-3">{detectedIssue.description}</p>
          )}
          {detectedIssue.symptoms?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2">Symptoms</p>
              <ul className="space-y-1.5">
                {detectedIssue.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detectedIssue.treatment?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Treatment Steps</p>
              <ol className="space-y-2">
                {detectedIssue.treatment.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </AccordionCard>
      ) : (
        <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3 shadow">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-700 text-sm">No Disease or Pest Detected</p>
            <p className="text-xs text-gray-400">Crop appears healthy</p>
          </div>
        </div>
      )}

      {/* ── Farming Details accordion ── */}
      <AccordionCard icon="🌱" title="Farming Details" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon="🌦️" label="Growing Season"    value={identified.growingSeason} />
          <InfoRow icon="⏱️" label="Harvest Time"      value={identified.harvestTime} />
          <InfoRow icon="🪨" label="Soil Type"         value={identified.soilType} />
          <InfoRow icon="💧" label="Water Requirement" value={identified.waterRequirement} />
          <InfoRow icon="📦" label="Est. Yield/acre"   value={identified.estimatedYield} />
        </div>
      </AccordionCard>

      {/* ── Live Mandi Prices accordion ── */}
      {marketData?.records?.length > 0 ? (
        <AccordionCard
          icon="📡"
          title="Live Mandi Prices"
          badge="Live · Agmarknet"
          badgeColor="bg-green-100 text-green-700"
          defaultOpen={false}
        >
          {marketData.summary && (
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl p-4 mb-4">
              <p className="text-xs text-green-200 mb-1">🏆 Best Market to Sell</p>
              <h3 className="text-lg sm:text-xl font-black">🏪 {marketData.summary.bestMarket}</h3>
              <p className="text-sm text-green-100">{marketData.summary.bestDistrict}, {marketData.summary.bestState}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Best Price', val: `₹${marketData.summary.bestPrice}` },
                  { label: 'Avg Price',  val: `₹${marketData.summary.averagePrice}` },
                  { label: 'Markets',    val: marketData.summary.totalMarkets },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white/20 rounded-lg p-2">
                    <p className="text-xs text-green-200">{label}</p>
                    <p className="font-black text-base sm:text-lg">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b">
                  <th className="text-left py-2 pr-2">Market</th>
                  <th className="text-left py-2 pr-2 hidden sm:table-cell">State</th>
                  <th className="text-right py-2 pr-2">Min ₹</th>
                  <th className="text-right py-2 pr-2 text-green-600">Modal ₹</th>
                  <th className="text-right py-2">Max ₹</th>
                </tr>
              </thead>
              <tbody>
                {marketData.records.map((m, i) => (
                  <tr key={i} className={`border-b last:border-0 hover:bg-green-50 transition-colors ${i === 0 ? 'bg-green-50 font-semibold' : ''}`}>
                    <td className="py-2 pr-2 text-gray-700 max-w-[120px] truncate">{m.market}</td>
                    <td className="py-2 pr-2 text-gray-400 text-xs hidden sm:table-cell">{m.state}</td>
                    <td className="py-2 pr-2 text-right text-gray-400">₹{m.minPrice}</td>
                    <td className="py-2 pr-2 text-right text-green-600 font-bold">₹{m.modalPrice}</td>
                    <td className="py-2 text-right text-gray-400">₹{m.maxPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">Per quintal (100 kg) · {marketData.records[0]?.date}</p>
          </div>
        </AccordionCard>
      ) : (
        <div className="glass rounded-2xl px-5 py-4 text-sm text-yellow-300 border border-yellow-500/30">
          ⚠️ Live mandi prices unavailable for this crop
        </div>
      )}

      {/* ── Image analysis accordion ── */}
      {imageMeta && (
        <AccordionCard icon="🔬" title="Image Analysis" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InfoRow icon="☀️" label="Brightness"    value={`${imageMeta.brightness}/255`} />
            <InfoRow icon="🟢" label="Green Score"   value={imageMeta.greenScore} />
            <InfoRow icon="🟡" label="Yellow Index"  value={imageMeta.yellowIndex} />
            <InfoRow icon="🟤" label="Necrosis Hint" value={imageMeta.necrosisHint} />
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            Dominant tone: <span className="font-medium text-gray-700">{imageMeta.dominantTone}</span>
          </p>
        </AccordionCard>
      )}

      <button
        onClick={onReset}
        className="w-full glass text-green-300 hover:text-white border border-green-500/40
          hover:bg-green-600 font-semibold py-3 rounded-2xl transition-all duration-200
          hover:-translate-y-0.5 hover:shadow-lg"
      >
        📷 Scan Another Crop
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="font-semibold text-gray-700 text-sm leading-snug">{value || '—'}</p>
      </div>
    </div>
  );
}
