import React from 'react';
import { HealthStatus } from '../types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  health: HealthStatus | null;
  onOpenApiKey: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  health,
  onOpenApiKey,
}) => {
  const tabs = [
    { id: 'memes', label: 'Meme Studio' },
    { id: 'captions', label: 'Captions' },
    { id: 'jokes', label: 'Joke Vault' },
    { id: 'favorites', label: `Saved (${favoritesCount})` },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs text-white tracking-widest border border-indigo-500">
              MG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  MemeGen Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Concept, Caption and Humor Generation Platform
              </p>
            </div>
          </div>

          {/* AI Key Button */}
          <button
            onClick={onOpenApiKey}
            title="Configure Gemini API Key"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              health?.ai_configured
                ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50'
                : 'bg-amber-900/30 border-amber-700/40 text-amber-300 hover:bg-amber-800/40'
            }`}
          >
            <span>{health?.ai_configured ? '✓' : '⚡'}</span>
            <span className="hidden sm:inline">{health?.ai_configured ? 'AI Active' : 'Add Key'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
