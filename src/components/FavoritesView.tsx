import React, { useState } from 'react';
import { FavoriteRecord } from '../types.ts';

interface FavoritesViewProps {
  favorites: FavoriteRecord[];
  onDeleteFavorite: (id: number) => Promise<void>;
  onShowToast: (msg: string) => void;
  onNavigateToStudio: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onDeleteFavorite,
  onShowToast,
  onNavigateToStudio
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const categories = ['All', ...Array.from(new Set(favorites.map(f => f.category).filter(Boolean)))];

  const filteredFavorites = favorites.filter((f) => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const q = search.toLowerCase().trim();
    if (!q) return matchesCategory;
    const inTopic = f.topic.toLowerCase().includes(q);
    const inTitle = f.content?.title?.toLowerCase().includes(q);
    const inCaption = f.content?.caption?.toLowerCase().includes(q);
    const inScene = f.content?.visual_scene?.toLowerCase().includes(q);
    return matchesCategory && (inTopic || inTitle || inCaption || inScene);
  });

  const handleCopyCaption = (caption: string, id: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    onShowToast("Caption copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    if (favorites.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favorites, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `meme_favorites_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    onShowToast("Exported favorites to JSON");
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">
              Saved Ideas
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {favorites.length}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Persisted in SQLite database storage across sessions and application restarts.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Export JSON
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter saved ideas by topic, title, scene or caption..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-lg bg-slate-900/50 border border-slate-800">
          <h3 className="text-base font-bold text-slate-300 mb-1">No saved ideas yet</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
            Generate ideas in Meme Studio and click Save to store concepts in SQLite storage.
          </p>
          <button
            onClick={onNavigateToStudio}
            className="px-5 py-2 rounded-lg font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
          >
            Go to Meme Studio
          </button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">No saved ideas matched "{search}".</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); }}
            className="text-xs text-indigo-400 hover:underline mt-2 cursor-pointer font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((fav) => {
            const item = fav.content;
            return (
              <div
                key={fav.id}
                className="flex flex-col justify-between rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-sm transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {fav.category || 'Humor'}
                    </span>
                    <button
                      onClick={() => onDeleteFavorite(fav.id)}
                      className="px-2 py-0.5 rounded text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    {item?.title || fav.topic}
                  </h3>
                  <div className="text-xs text-slate-400 mb-3 flex gap-2">
                    <span>Topic: <strong>{fav.topic}</strong></span>
                    <span className="text-slate-600">/</span>
                    <span>{fav.language || 'English'}</span>
                  </div>

                  {/* Meme Box */}
                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 mb-3 text-center">
                    <div className="meme-impact text-xs sm:text-sm uppercase py-0.5 font-black text-white">
                      {item?.top_text || "TOP TEXT"}
                    </div>
                    {item?.visual_scene && (
                      <p className="my-2 text-[11px] text-slate-400 bg-slate-900 p-1.5 rounded text-left">
                        <span className="font-semibold text-slate-300">Scene:</span> {item.visual_scene}
                      </p>
                    )}
                    <div className="meme-impact text-xs sm:text-sm uppercase py-0.5 font-black text-white">
                      {item?.bottom_text || "BOTTOM TEXT"}
                    </div>
                  </div>

                  {/* Caption */}
                  {item?.caption && (
                    <div className="rounded bg-slate-950 border border-slate-800 p-2.5 mb-3">
                      <p className="text-xs text-slate-200 select-all font-medium">
                        {item.caption}
                      </p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {item?.hashtags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.hashtags.map((tag: string) => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleCopyCaption(item?.caption || item?.top_text || '', fav.id)}
                    className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {copiedId === fav.id ? "Copied" : "Copy Caption"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
