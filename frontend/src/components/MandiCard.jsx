export default function MandiCard({ bestMandi, mandiDetails }) {
  return (
    <div className="space-y-3">
      {/* Best Mandi highlight */}
      <div className="bg-agro-green text-white rounded-xl p-5 shadow">
        <p className="text-xs uppercase tracking-wide text-green-200 mb-1">Best Market</p>
        <h3 className="text-2xl font-bold">🏪 {bestMandi.marketName}</h3>
        <p className="text-sm mt-1 text-green-100">
          Combined price score: ₹{bestMandi.totalPrice.toLocaleString()}/kg
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {bestMandi.crops.map((c) => (
            <span
              key={c.crop}
              className="bg-white text-agro-green text-xs font-semibold px-3 py-1 rounded-full"
            >
              {c.crop}: ₹{c.price}/kg
            </span>
          ))}
        </div>
      </div>

      {/* Other mandis */}
      {mandiDetails.length > 1 && (
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm font-semibold text-gray-500 mb-2">Other Markets</p>
          <div className="space-y-2">
            {mandiDetails.slice(1).map((m) => (
              <div key={m.marketName} className="flex justify-between text-sm text-gray-600 border-b pb-1">
                <span>{m.marketName}</span>
                <span className="font-medium">₹{m.totalPrice.toLocaleString()}/kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
