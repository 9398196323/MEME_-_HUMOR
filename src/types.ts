export interface MemeIdea {
  title: string;
  concept: string;
  visual_scene: string;
  top_text: string;
  bottom_text: string;
  caption: string;
  hashtags: string[];
}

export interface GenerateResponse {
  source: 'ai' | 'fallback';
  model: string;
  topic: string;
  category: string;
  style: string;
  intensity: string;
  language: string;
  ideas: MemeIdea[];
}

export interface CaptionItem {
  caption: string;
  tone: string;
  platform: string;
}

export interface JokeItem {
  type: string;
  setup: string;
  punchline: string;
  tags: string[];
}

export interface FavoriteRecord {
  id: number;
  topic: string;
  category: string;
  language: string;
  content: MemeIdea;
  created_at: string;
}

export interface HistoryRecord {
  id: number;
  topic: string;
  mode: string;
  settings: {
    category?: string;
    style?: string;
    intensity?: string;
    language?: string;
    count?: number;
  };
  result: GenerateResponse;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  ai_configured: boolean;
  provider: string;
  database: string;
}

export interface ProjectFileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: ProjectFileNode[];
}
