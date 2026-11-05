import React, { useState } from 'react';
import { JokeItem } from '../types.ts';

interface JokeVaultProps {
  onShowToast: (msg: string) => void;
  onGenerateJokes: (category: string, style: string, language: string, count: number) => Promise<{ source: string; jokes: JokeItem[] }>;
}

const CATEGORIES = [
  "Programming and Developer Humor",
  "College and Student Humor",
  "Puns and Wordplay",
  "Situational Comedy",
  "Observational Comedy"
];

const STYLES = [
  "Witty",
  "Sarcastic",
  "Clean and family-friendly",
  "Dry humor",
  "Absurd"
];

export const JokeVault: React.FC<JokeVaultProps> = ({ onShowToast, onGenerateJokes }) => {
  const [category, setCategory] = useState('College and Student Humor');
  const [style, setStyle] = useState('Witty');
  const [language, setLanguage] = useState('English');
  const [count, setCount] = useState(5);
  const [jokes, setJokes] = useState<JokeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [revealedPunchlines, setRevealedPunchlines] = useState<Set<number>>(new Set());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await onGenerateJokes(category, style, language, count);
      if (data.jokes) {
        setJokes(data.jokes);
        const allIndices = new Set<number>(data.jokes.map((_: any, i: number) => i));
        setRevealedPunchlines(allIndices);
        onShowToast(`Generated ${data.jokes.length} jokes`);
      } else {
        onShowToast("Failed to generate jokes");
      }
    } catch {
      onShowToast("Error generating jokes");
    } finally {
      setIsLoading(false);
    }
  };

  const copyJoke = (j: JokeItem, idx: number) => {
    const text = `${j.setup}\n\nPunchline: ${j.punchline}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    onShowToast("Joke copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const togglePunchline = (idx: number) => {
    const next = new Set(revealedPunchlines);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setRevealedPunchlines(next);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 mb-3">
          Joke and One-Liner Vault
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Joke and One-Liner Vault
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Generate structured jokes, setup and punchline formats, and one-liners across programming, campus life, and situational humor.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                <option value="English">English</option>
                <option value="Tanglish">Tanglish (Tamil in English)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Count: {count}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer mt-2"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Generating Jokes..." : `Generate ${count} Jokes`}
          </button>
        </form>
      </div>

      {/* Jokes List */}
      {jokes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200">
              Jokes and One-Liners ({jokes.length})
            </h3>
            <button
              onClick={() => {
                if (revealedPunchlines.size === jokes.length) {
                  setRevealedPunchlines(new Set());
                } else {
                  setRevealedPunchlines(new Set(jokes.map((_, i) => i)));
                }
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              {revealedPunchlines.size === jokes.length ? "Hide All Punchlines" : "Reveal All Punchlines"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jokes.map((j, idx) => {
              const isRevealed = revealedPunchlines.has(idx);

              return (
                <div
                  key={idx}
                  className="rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {j.type || 'Humor'}
                      </span>
                      <div className="flex items-center gap-1">
                        {j.tags?.map((t) => (
                          <span key={t} className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-100 mb-3 leading-relaxed">
                      {j.setup}
                    </p>

                    <div className="my-3">
                      {isRevealed ? (
                        <div className="p-3 rounded bg-slate-950 border border-slate-800 text-sm font-semibold text-indigo-300">
                          Punchline: {j.punchline}
                        </div>
                      ) : (
                        <button
                          onClick={() => togglePunchline(idx)}
                          className="w-full py-2 px-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer text-center"
                        >
                          Click to reveal punchline
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => togglePunchline(idx)}
                      className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {isRevealed ? "Hide Punchline" : "Show Punchline"}
                    </button>

                    <button
                      onClick={() => copyJoke(j, idx)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                        copiedIndex === idx
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {copiedIndex === idx ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
