import React, { useState } from 'react';
import { CaptionItem } from '../types.ts';

interface CaptionGeneratorProps {
  onShowToast: (msg: string) => void;
  onGenerateCaptions: (topic: string, tone: string, language: string, count: number) => Promise<{ source: string; captions: CaptionItem[] }>;
}

const TONES = [
  "Witty",
  "Sarcastic",
  "Self-deprecating",
  "Hype and Energetic",
  "Casual and Chill",
  "Minimalist"
];

const LANGUAGES = [
  { id: "English", label: "English" },
  { id: "Tanglish", label: "Tanglish (Tamil in English)" },
  { id: "Tamil", label: "Tamil (Tamil Script)" }
];

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ onShowToast, onGenerateCaptions }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Witty');
  const [language, setLanguage] = useState('English');
  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      onShowToast("Please enter a topic or scenario");
      return;
    }

    setIsLoading(true);
    try {
      const data = await onGenerateCaptions(topic.trim(), tone, language, 5);
      if (data.captions) {
        setCaptions(data.captions);
        onShowToast("Generated 5 captions");
      } else {
        onShowToast("Failed to generate captions");
      }
    } catch {
      onShowToast("Error generating captions");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCaption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    onShowToast("Caption copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 mb-3">
          Caption Generator
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Social Media Caption Generator
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Describe your scenario, photo context, or topic to generate 5 distinctive captions tailored for social platforms.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Topic, Photo Context, or Scenario
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Example: Sitting with an iced coffee staring at my 37 open browser tabs pretending to study"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Generating Captions..." : "Generate 5 Captions"}
          </button>
        </form>
      </div>

      {/* Results */}
      {captions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200">
              Generated Captions ({captions.length})
            </h3>
            <span className="text-xs text-slate-400">Click Copy to copy any caption</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {captions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm sm:text-base text-slate-100 font-medium select-all mb-2">
                    {item.caption}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="text-indigo-400 font-semibold">{item.tone}</span>
                    <span className="text-slate-600">/</span>
                    <span>{item.platform || 'Social Media'}</span>
                  </div>
                </div>

                <button
                  onClick={() => copyCaption(item.caption, idx)}
                  className={`shrink-0 px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                    copiedIndex === idx
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {copiedIndex === idx ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
