import React, { useState } from 'react';
import { MemeIdea, GenerateResponse } from '../types.ts';

interface MemeStudioProps {
  currentResults: GenerateResponse | null;
  onGenerate: (params: {
    topic: string;
    category: string;
    style: string;
    intensity: string;
    language: string;
    count: number;
  }) => Promise<void>;
  onRefine: (idea: MemeIdea, instruction: string, index: number) => Promise<void>;
  onSaveFavorite: (idea: MemeIdea, topic: string, category: string, language: string) => Promise<boolean>;
  savedIdeaTitles: Set<string>;
  isLoading: boolean;
  onShowToast: (msg: string) => void;
}

const CATEGORIES = [
  "Relatable Humor",
  "College and Student Humor",
  "Programming and Developer Humor",
  "Sarcastic Humor",
  "Situational Comedy",
  "Puns and Wordplay",
  "Wholesome Humor",
  "Observational Comedy",
  "Trending-Style Meme Concepts",
  "Dark Humor (Safe and Clean)"
];

const STYLES = [
  "Witty",
  "Sarcastic",
  "Playful",
  "Exaggerated",
  "Dry humor",
  "Clean and family-friendly",
  "Absurd",
  "Clever wordplay"
];

const INTENSITIES = [
  { id: "Mild", label: "Mild" },
  { id: "Medium", label: "Medium" },
  { id: "Extra funny", label: "High" }
];

const LANGUAGES = [
  { id: "English", label: "English", desc: "Global English" },
  { id: "Tanglish", label: "Tanglish", desc: "Tamil in English Script" },
  { id: "Tamil", label: "Tamil", desc: "Tamil Script" }
];

const QUICK_TOPICS = [
  "8 AM College Attendance Crisis",
  "Night Before Semester Exam",
  "Hostel Mess Mysterious Food",
  "Senior Dev vs Junior Dev PR Review",
  "GPay Balance on 28th of Month",
  "WiFi Disconnects During Exam Submission",
  "Saying I am 5 mins away from bed",
  "CSS Centering a Div"
];

export const MemeStudio: React.FC<MemeStudioProps> = ({
  currentResults,
  onGenerate,
  onRefine,
  onSaveFavorite,
  savedIdeaTitles,
  isLoading,
  onShowToast
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('College and Student Humor');
  const [style, setStyle] = useState('Witty');
  const [intensity, setIntensity] = useState('Medium');
  const [language, setLanguage] = useState('English');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      onShowToast("Please enter a topic or scenario");
      return;
    }
    onGenerate({
      topic: topic.trim(),
      category,
      style,
      intensity,
      language,
      count: 5
    });
  };

  const handleSurpriseMe = () => {
    const randomTopic = QUICK_TOPICS[Math.floor(Math.random() * QUICK_TOPICS.length)];
    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
    const randomLang = Math.random() > 0.4 ? "Tanglish" : "English";

    setTopic(randomTopic);
    setCategory(randomCat);
    setStyle(randomStyle);
    setLanguage(randomLang);

    onGenerate({
      topic: randomTopic,
      category: randomCat,
      style: randomStyle,
      intensity: "Extra funny",
      language: randomLang,
      count: 5
    });
    onShowToast(`Selected prompt: "${randomTopic}"`);
  };

  const handleCopyCaption = (caption: string, idx: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedIndex(idx);
    onShowToast("Caption copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyFullMeme = (idea: MemeIdea) => {
    const text = `Title: ${idea.title}\nTop Text: ${idea.top_text}\nVisual Scene: ${idea.visual_scene}\nBottom Text: ${idea.bottom_text}\nCaption: ${idea.caption}\nTags: ${idea.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    onShowToast("Meme concept copied to clipboard");
  };

  const handleCopyAll = () => {
    if (!currentResults?.ideas?.length) return;
    const allText = currentResults.ideas.map((idea, i) => 
      `--- IDEA ${i + 1}: ${idea.title} ---\n[TOP]: ${idea.top_text}\n[BOTTOM]: ${idea.bottom_text}\n[SCENE]: ${idea.visual_scene}\nCaption: ${idea.caption}\nTags: ${idea.hashtags.join(" ")}\n`
    ).join("\n\n");
    navigator.clipboard.writeText(allText);
    onShowToast("All 5 meme concepts copied");
  };

  const handleRefineClick = async (idea: MemeIdea, instruction: string, idx: number) => {
    setRefiningIndex(idx);
    try {
      await onRefine(idea, instruction, idx);
      onShowToast(`Refinement applied: ${instruction}`);
    } catch {
      onShowToast("Refinement failed");
    } finally {
      setRefiningIndex(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero & Generator Controls */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl mb-6">
          <div className="inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 mb-3">
            Meme and Humor Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Meme Concept and Caption Studio
          </h1>
          <p className="text-slate-400 text-sm">
            Generate structured concepts with visual framing, setup and punchline structures, captions, and language localization.
          </p>
        </div>

        {/* Quick Topic Buttons */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Suggested Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors cursor-pointer ${
                  topic === t
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Topic, Scenario, or Problem
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: Attending 8 AM lab session in winter, or pushing broken code to production"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
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

            {/* Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Humor Style
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

            {/* Language */}
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
                    {l.label} ({l.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Intensity
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {INTENSITIES.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setIntensity(i.id)}
                    className={`py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                      intensity === i.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Generating Ideas..." : "Generate 5 Ideas"}
            </button>

            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Random Topic
            </button>

            {currentResults?.ideas && currentResults.ideas.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="ml-auto px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                Copy All Concepts
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results Header */}
      {currentResults && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">
                Generated Meme Concepts
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                currentResults.source === 'ai'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {currentResults.source === 'ai' ? 'AI Generated' : 'Offline Template'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>Topic: <strong className="text-slate-200">{currentResults.topic}</strong></span>
              <span>Category: {currentResults.category}</span>
              <span>Language: {currentResults.language}</span>
            </div>
          </div>
        </div>
      )}

      {/* Result Cards Grid */}
      {currentResults?.ideas && currentResults.ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentResults.ideas.map((idea, idx) => {
            const isSaved = savedIdeaTitles.has(idea.title);
            const isRefining = refiningIndex === idx;

            return (
              <div
                key={`${idea.title}-${idx}`}
                className="flex flex-col justify-between rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-sm transition-colors"
              >
                <div>
                  {/* Card Title & Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono font-bold shrink-0">
                      Idea {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-100 text-base leading-snug flex-1">
                      {idea.title}
                    </h3>
                    <button
                      onClick={async () => {
                        await onSaveFavorite(
                          idea,
                          currentResults.topic,
                          currentResults.category,
                          currentResults.language
                        );
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                        isSaved
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </div>

                  {/* Visual Meme Box */}
                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 mb-4 text-center min-h-[160px] flex flex-col justify-between">
                    {/* Top Text in Impact Font */}
                    <div className="meme-impact text-sm sm:text-base leading-tight uppercase py-1 select-all font-black text-white">
                      {idea.top_text || "TOP TEXT"}
                    </div>

                    {/* Suggested Scene / Template Visual */}
                    <div className="my-3 px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 text-left">
                      <div className="font-semibold text-slate-400 mb-0.5 text-[11px] uppercase tracking-wider">
                        Visual Scene Description:
                      </div>
                      <div>{idea.visual_scene}</div>
                    </div>

                    {/* Bottom Text in Impact Font */}
                    <div className="meme-impact text-sm sm:text-base leading-tight uppercase py-1 select-all font-black text-white">
                      {idea.bottom_text || "BOTTOM TEXT"}
                    </div>
                  </div>

                  {/* Caption quote */}
                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 mb-3">
                    <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                      <span className="uppercase tracking-wider text-[11px]">Caption</span>
                      <button
                        onClick={() => handleCopyCaption(idea.caption, idx)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        {copiedIndex === idx ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 select-all font-medium">
                      {idea.caption}
                    </p>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {idea.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyFullMeme(idea)}
                      className="flex-1 py-1.5 px-3 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      Copy Concept
                    </button>

                    {/* Refinement dropdown menu */}
                    <div className="relative">
                      <select
                        disabled={isRefining}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRefineClick(idea, e.target.value, idx);
                            e.target.value = '';
                          }
                        }}
                        className="py-1.5 px-3 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {isRefining ? "Refining..." : "Refine"}
                        </option>
                        <option value="make it funnier">Make Funnier</option>
                        <option value="make it shorter">Make Shorter</option>
                        <option value="make it more relatable">Make More Relatable</option>
                        <option value="add tanglish punch">Convert to Tanglish</option>
                        <option value="exaggerate the situation">Exaggerate Scenario</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
