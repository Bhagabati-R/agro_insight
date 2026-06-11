export default function CropCard({ crop }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-agro-light">
      <h3 className="text-lg font-semibold text-agro-green capitalize">{crop.name}</h3>
      <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
        <span>Cost/acre:</span>       <span className="font-medium">₹{crop.cost.toLocaleString()}</span>
        <span>Yield/acre:</span>      <span className="font-medium">{crop.yield} kg</span>
        <span>Market Price:</span>    <span className="font-medium">₹{crop.price}/kg</span>
        <span>Total Cost:</span>      <span className="font-medium">₹{crop.totalCost.toLocaleString()}</span>
        <span>Expected Profit:</span> <span className="font-bold text-agro-green">₹{crop.totalProfit.toLocaleString()}</span>
      </div>
    </div>
  );
}
