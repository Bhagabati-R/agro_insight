
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CROP_SLIDES = [
  { url: '/crops/wheat.jpg',  label: 'Wheat Fields'  },
  { url: '/crops/rice.jpg',   label: 'Rice Paddies'  },
  { url: '/crops/tomato.jpg', label: 'Tomato Crop'   },
  { url: '/crops/potato.jpg', label: 'Potato Farm'   },
  { url: '/crops/onion.jpg',  label: 'Onion Harvest' },
  { url: '/crops/cotton.jpg', label: 'Cotton Fields' },
];

export default function InputPage() {
  const [budget, setBudget]     = useState('');
  const [landArea, setLandArea] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [slide, setSlide]       = useState(0);
  const navigate = useNavigate();

  // Auto-rotate every 2.5s
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % CROP_SLIDES.length), 2500);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/optimize', {
        budget: Number(budget), landArea: Number(landArea),
      });
      navigate('/results', { state: { result: data, budget, landArea } });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md animate-fadeInUp">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full glass mb-5 animate-pulse-green">
            <span className="text-5xl animate-float inline-block">🌾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Crop <span className="text-green-400">Optimizer</span>
          </h1>
          <p className="text-green-200 text-sm">
            Enter your budget &amp; land — AI picks the most profitable crops
          </p>
        </div>

        {/* Crop photo carousel */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-2xl" style={{ height: 160 }}>
          {CROP_SLIDES.map((s, i) => (
            <img
              key={i}
              src={s.url}
              alt={s.label}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ opacity: i === slide ? 1 : 0 }}
            />
          ))}
          {/* dark overlay + label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-2">
            <span className="text-white text-sm font-semibold drop-shadow">
              {CROP_SLIDES[slide].label}
            </span>
            {/* dot indicators */}
            <div className="flex gap-1.5">
              {CROP_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === slide ? 'w-5 h-2 bg-green-400' : 'w-2 h-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Budget (₹)
              </label>
              <input
                type="number" min="1" required value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full border-2 border-gray-200 focus:border-green-400 rounded-xl px-4 py-3 outline-none transition-colors text-gray-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                Land Size (acres)
              </label>
              <input
                type="number" min="1" required value={landArea}
                onChange={e => setLandArea(e.target.value)}
                placeholder="e.g. 5"
                className="w-full border-2 border-gray-200 focus:border-green-400 rounded-xl px-4 py-3 outline-none transition-colors text-gray-800 font-medium"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full shimmer-btn text-white font-bold py-4 rounded-2xl text-lg shadow-xl shadow-green-900/40 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Optimizing...
                </span>
              ) : '🚀 Optimize My Farm'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
