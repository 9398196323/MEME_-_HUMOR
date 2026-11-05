import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MemeStudio } from './components/MemeStudio.tsx';
import { CaptionGenerator } from './components/CaptionGenerator.tsx';
import { JokeVault } from './components/JokeVault.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { Toast } from './components/Toast.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { GenerateResponse, MemeIdea, FavoriteRecord, HistoryRecord, HealthStatus } from './types.ts';
import {
  isGeminiConfigured,
  getFavorites,
  addFavorite,
  deleteFavorite as removeFavorite,
  getHistory,
  addHistory,
  clearHistory as eraseHistory,
  generateMemeIdeas,
  refineMemeIdea,
  generateCaptions,
  generateJokes,
  getStoredApiKey,
} from './clientGemini.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('memes');
  const [currentResults, setCurrentResults] = useState<GenerateResponse | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const savedIdeaTitles = new Set(favorites.map((f) => f.content?.title).filter(Boolean));

  const refreshHealth = () => {
    const configured = isGeminiConfigured();
    setHealth({
      status: 'healthy',
      service: 'Meme and Humor Idea Generator',
      ai_configured: configured,
      provider: configured ? 'Google Gemini (gemini-2.0-flash)' : 'Offline Template Fallback Engine',
      database: 'Browser LocalStorage',
    });
  };

  useEffect(() => {
    refreshHealth();
    setFavorites(getFavorites());
    setHistory(getHistory());

    // Show API key modal on first visit if no key stored
    if (!getStoredApiKey()) {
      setTimeout(() => setShowApiKeyModal(true), 800);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleGenerate = async (params: {
    topic: string;
    category: string;
    style: string;
    intensity: string;
    language: string;
    count: number;
  }) => {
    setIsLoading(true);
    try {
      const result = await generateMemeIdeas(
        params.topic,
        params.category,
        params.style,
        params.intensity,
        params.language,
        params.count,
      );
      setCurrentResults(result);
      addHistory(params.topic, 'meme_generator', {
        category: params.category,
        style: params.style,
        intensity: params.intensity,
        language: params.language,
        count: params.count,
      }, result);
      setHistory(getHistory());
      showToast(`Generated ${result.ideas.length} ideas`);
    } catch (err) {
      showToast('Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (idea: MemeIdea, instruction: string, index: number) => {
    try {
      const data = await refineMemeIdea(idea, instruction, currentResults?.language || 'English');
      if (data.refined_idea && currentResults) {
        const updatedIdeas = [...currentResults.ideas];
        updatedIdeas[index] = data.refined_idea;
        setCurrentResults({ ...currentResults, ideas: updatedIdeas });
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSaveFavorite = async (
    idea: MemeIdea,
    topic: string,
    category: string,
    language: string,
  ): Promise<boolean> => {
    try {
      addFavorite(topic || idea.title, category, language, idea);
      setFavorites(getFavorites());
      showToast('Saved to Favorites!');
      return true;
    } catch {
      showToast('Error saving favorite');
      return false;
    }
  };

  const handleDeleteFavorite = async (id: number) => {
    removeFavorite(id);
    setFavorites(getFavorites());
    showToast('Favorite removed');
  };

  const handleReopenHistory = (record: HistoryRecord) => {
    if (record.result) {
      setCurrentResults(record.result);
      setActiveTab('memes');
      showToast(`Reopened previous prompt: "${record.topic}"`);
    }
  };

  const handleClearHistory = async () => {
    eraseHistory();
    setHistory([]);
    showToast('History cleared');
  };

  const handleApiKeySaved = () => {
    refreshHealth();
    showToast('API key saved! AI generation is now enabled.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        health={health}
        onOpenApiKey={() => setShowApiKeyModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Offline mode banner when no AI key */}
        {health && !health.ai_configured && (
          <div className="mb-6 rounded-lg bg-amber-900/30 border border-amber-700/50 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-lg">⚡</span>
              <div>
                <p className="text-amber-300 font-semibold text-sm">Running in Offline Mode</p>
                <p className="text-amber-400/70 text-xs">Add your Gemini API key to unlock AI-powered generation.</p>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Add API Key
            </button>
          </div>
        )}

        {activeTab === 'memes' && (
          <MemeStudio
            currentResults={currentResults}
            onGenerate={handleGenerate}
            onRefine={handleRefine}
            onSaveFavorite={handleSaveFavorite}
            savedIdeaTitles={savedIdeaTitles}
            isLoading={isLoading}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'captions' && (
          <CaptionGenerator onShowToast={showToast} onGenerateCaptions={generateCaptions} />
        )}

        {activeTab === 'jokes' && (
          <JokeVault onShowToast={showToast} onGenerateJokes={generateJokes} />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onDeleteFavorite={handleDeleteFavorite}
            onShowToast={showToast}
            onNavigateToStudio={() => setActiveTab('memes')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onReopen={handleReopenHistory}
            onClearHistory={handleClearHistory}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal
          onClose={() => setShowApiKeyModal(false)}
          onSaved={handleApiKeySaved}
        />
      )}

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
