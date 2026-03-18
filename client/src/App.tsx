import { useState, useEffect } from 'react';



function App() {
  const [locations, setLocations] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [sqft, setSqft] = useState('');
  const [bhk, setBhk] = useState('2');
  const [bath, setBath] = useState('2');
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load locations from your Flask backend
  useEffect(() => {
    fetch('http://127.0.0.1:5000/get_location_names')
      .then(res => res.json())
      .then(data => setLocations(data.locations.sort()))
      .catch(() => console.error('Could not load locations'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrice(null);

    const formData = new FormData();
    formData.append('total_sqft', sqft);
    formData.append('location', location);
    formData.append('bhk', bhk);
    formData.append('bath', bath);

    try {
      const res = await fetch('http://127.0.0.1:5000/predict_home_price', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setPrice(data.estimated_price);
    } catch {
      setError('Cannot connect to Flask server. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-10 py-8 text-white text-center">
            <h1 className="text-4xl font-bold tracking-tight">Bengaluru House Price Predictor</h1>
            <p className="mt-2 text-lg opacity-90">Instant ML-powered estimates</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
              >
                <option value="">Choose location...</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Square Feet</label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                min="300"
                step="10"
                required
                placeholder="e.g. 1200"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedroom, Hall, Kitchen</label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  value={bath}
                  onChange={(e) => setBath(e.target.value)}
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                >
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !location || !sqft}
              className="w-full py-4 bg-teal-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Predicting...
                </span>
              ) : 'Get Price Estimate'}
            </button>
          </form>

          {/* Result */}
          {price !== null && (
            <div className="px-8 pb-10 text-center border-t pt-6">
              <p className="text-gray-500 text-sm">Estimated Market Price</p>
              <div className="text-5xl font-bol text-cyan-700 mt-1">
                ₹ {price.toLocaleString('en-IN')} Lakh
              </div>
            </div>
          )}

          {error && <div className="px-8 pb-8 text-red-600 text-center">{error}</div>}
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Flask must be running → <span className="font-mono">python ../server/server.py</span>
        </p>
      </div>
    </div>
  );
}

export default App;