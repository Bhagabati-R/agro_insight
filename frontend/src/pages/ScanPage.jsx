
import { useState, useRef } from 'react';
import axios from 'axios';
import ScanResult from '../components/ScanResult';

const SCAN_STEPS = [
  'Preprocessing image...',
  'Extracting pixel features...',
  'Analyzing leaf structure...',
  'Detecting crop type...',
  'Checking for diseases...',
  'Fetching live mandi prices...',
  'Generating report...',
];

export default function ScanPage() {
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError]     = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const stepTimer = useRef(null);

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) { setError('Please upload a valid image.'); return; }
    setError(''); setResult(null);
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  function onDrop(e) { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }

  function startStepCycle() {
    let i = 0;
    setStepIdx(0);
    stepTimer.current = setInterval(() => {
      i = (i + 1) % SCAN_STEPS.length;
      setStepIdx(i);
    }, 900);
  }

  function stopStepCycle() {
    clearInterval(stepTimer.current);
  }

  async function handleScan() {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    startStepCycle();
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await axios.post('/api/identify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed. Try a clearer image.');
    } finally {
      stopStepCycle();
      setLoading(false);
    }
  }

  function reset() {
    setFile(null); setPreview(null); setResult(null); setError('');
    inputRef.current.value = '';
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <div className="max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass mb-4 animate-pulse-green">
            <span className="text-4xl">🔬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Crop <span className="text-green-400">Scanner</span>
          </h1>
          <p className="text-green-200 text-xs sm:text-sm">
            Upload a photo — AI identifies the crop, detects diseases &amp; shows live market prices
          </p>
        </div>

        {/* Upload / Preview Zone */}
        {!result && (
          <div className="animate-fadeInUp">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !preview && !loading && inputRef.current.click()}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                ${dragging ? 'scale-[1.02] ring-2 ring-green-400' : ''}
                ${preview ? 'cursor-default' : 'hover:scale-[1.01]'}
                glass`}
              style={{ minHeight: 280 }}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

              {preview ? (
                <>
                  {/* Image preview */}
                  <img src={preview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 340 }} />

                  {/* Scan overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                      {/* Scan corners */}
                      <div className="relative w-48 h-48">
                        <div className="scan-corner scan-corner-tl" />
                        <div className="scan-corner scan-corner-tr" />
                        <div className="scan-corner scan-corner-bl" />
                        <div className="scan-corner scan-corner-br" />
                        <div className="scan-line" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl animate-spin-slow">🌿</span>
                        </div>
                      </div>
                      <p className="text-green-400 font-semibold mt-4 text-sm tracking-wide animate-pulse">
                        {SCAN_STEPS[stepIdx]}
                      </p>
                      <div className="flex gap-1 mt-3">
                        {SCAN_STEPS.map((_, i) => (
                          <div key={i} className={`h-1 w-6 rounded-full transition-all duration-300 ${i <= stepIdx ? 'bg-green-400' : 'bg-white/20'}`} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remove button */}
                  {!loading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
                    >×</button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="text-6xl mb-4 animate-float inline-block">📷</div>
                  <p className="text-white font-semibold text-lg mb-1">Drop your crop photo here</p>
                  <p className="text-green-300 text-sm">or click to browse · JPG, PNG, WEBP up to 10MB</p>
                  <div className="mt-6 flex gap-3 text-xs text-green-400/70">
                    <span>🌿 Leaf scan</span>
                    <span>🌾 Crop ID</span>
                    <span>🦠 Disease detect</span>
                    <span>📊 Market price</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 glass rounded-xl px-4 py-3 text-red-300 text-sm border border-red-500/30">
                ⚠️ {error}
              </div>
            )}

            {preview && !loading && (
              <button
                onClick={handleScan}
                className="mt-4 w-full shimmer-btn text-white font-bold py-4 rounded-2xl text-lg shadow-xl shadow-green-900/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                🔍 Scan This Crop
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && <ScanResult result={result} onReset={reset} />}
      </div>
    </div>
  );
}
