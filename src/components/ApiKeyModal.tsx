import React, { useState } from 'react';
import { saveApiKey, getStoredApiKey, clearApiKey } from '../clientGemini.ts';

interface ApiKeyModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSaved }) => {
  const [key, setKey] = useState(getStoredApiKey());
  const [show, setShow] = useState(false);

  const handleSave = () => {
    if (key.trim()) {
      saveApiKey(key.trim());
      onSaved();
      onClose();
    }
  };

  const handleClear = () => {
    clearApiKey();
    setKey('');
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Gemini API Key</h2>
            <p className="text-xs text-slate-400 mt-0.5">Required for AI-powered generation</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Info box */}
        <div className="mb-4 rounded-lg bg-indigo-900/30 border border-indigo-700/40 p-3">
          <p className="text-xs text-indigo-300 leading-relaxed">
            Your key is stored only in your browser's local storage — never sent anywhere except directly to Google's Gemini API.
            Get a free key at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-200 hover:text-white"
            >
              aistudio.google.com
            </a>
          </p>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={() => setShow(!show)}
              className="px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Key & Enable AI
          </button>
          {getStoredApiKey() && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 hover:text-red-200 font-semibold text-sm border border-red-800/50 transition-colors cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="mt-3 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          Skip for now — use offline fallback templates
        </button>
      </div>
    </div>
  );
};
