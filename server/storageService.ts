import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FAV_FILE = path.join(DATA_DIR, 'favorites.json');
const HIST_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface FavoriteRecord {
  id: number;
  topic: string;
  category: string;
  language: string;
  content: any;
  created_at: string;
}

export interface HistoryRecord {
  id: number;
  topic: string;
  mode: string;
  settings: any;
  result: any;
  created_at: string;
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJson(filePath: string, data: any): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

export const Storage = {
  getFavorites(search?: string): FavoriteRecord[] {
    const favs = readJson<FavoriteRecord[]>(FAV_FILE, []);
    if (!search || !search.trim()) {
      return favs;
    }
    const q = search.toLowerCase().trim();
    return favs.filter(f => 
      f.topic.toLowerCase().includes(q) ||
      (f.category && f.category.toLowerCase().includes(q)) ||
      JSON.stringify(f.content).toLowerCase().includes(q)
    );
  },

  addFavorite(topic: string, category: string, language: string, content: any): FavoriteRecord {
    const favs = readJson<FavoriteRecord[]>(FAV_FILE, []);
    const newId = favs.length > 0 ? Math.max(...favs.map(f => f.id)) + 1 : 1;
    const record: FavoriteRecord = {
      id: newId,
      topic: topic || 'Meme Idea',
      category: category || 'General',
      language: language || 'English',
      content,
      created_at: new Date().toISOString()
    };
    favs.unshift(record);
    writeJson(FAV_FILE, favs);
    return record;
  },

  deleteFavorite(id: number): boolean {
    const favs = readJson<FavoriteRecord[]>(FAV_FILE, []);
    const filtered = favs.filter(f => f.id !== id);
    if (filtered.length !== favs.length) {
      writeJson(FAV_FILE, filtered);
      return true;
    }
    return false;
  },

  getHistory(limit: number = 30): HistoryRecord[] {
    const hist = readJson<HistoryRecord[]>(HIST_FILE, []);
    return hist.slice(0, limit);
  },

  addHistory(topic: string, mode: string, settings: any, result: any, maxItems: number = 50): HistoryRecord {
    const hist = readJson<HistoryRecord[]>(HIST_FILE, []);
    const newId = hist.length > 0 ? Math.max(...hist.map(h => h.id)) + 1 : 1;
    const record: HistoryRecord = {
      id: newId,
      topic,
      mode,
      settings,
      result,
      created_at: new Date().toISOString()
    };
    hist.unshift(record);
    if (hist.length > maxItems) {
      hist.length = maxItems;
    }
    writeJson(HIST_FILE, hist);
    return record;
  },

  clearHistory(): boolean {
    writeJson(HIST_FILE, []);
    return true;
  }
};
