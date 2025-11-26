import React, { useState } from 'react';
import axios from 'axios';
import { Brain, Send, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Backend is exposed on port 5000 of localhost
      const response = await axios.post('http://localhost:5000/predict', {
        text: text
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the analysis engine. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    return sentiment === 'Positive' ? 'text-green-600' : 'text-red-600';
  };

  const getBgColor = (sentiment) => {
    return sentiment === 'Positive' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 flex items-center justify-center">
          <Brain className="text-white w-10 h-10 mr-3" />
          <h1 className="text-2xl font-bold text-white">Tiny Sentiment</h1>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to analyze:
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none transition-all"
            placeholder="e.g., I absolutely love this product!"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={analyzeSentiment}
            disabled={loading || !text}
            className={`mt-4 w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-colors
              ${loading || !text ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Analyze Sentiment
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className={`mt-6 p-4 rounded-lg border border-gray-100 ${getBgColor(result.sentiment)} animate-fade-in`}>
              <h3 className="text-sm font-uppercase text-gray-500 tracking-wide mb-1">Result</h3>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getSentimentColor(result.sentiment)}`}>
                  {result.sentiment}
                </span>
                <span className="text-gray-600 font-medium">
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
          Powered by PyTorch & Flask
        </div>
      </div>
    </div>
  );
}

export default App;