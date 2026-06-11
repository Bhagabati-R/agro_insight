export default function StatCard({ label, value, icon, highlight }) {
  return (
    <div
      className={`rounded-xl p-5 shadow flex items-center gap-4 ${
        highlight ? 'bg-agro-green text-white' : 'bg-white text-gray-700'
      }`}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className={`text-xs uppercase tracking-wide ${highlight ? 'text-green-200' : 'text-gray-400'}`}>
          {label}
        </p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}
