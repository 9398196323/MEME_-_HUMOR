import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateMemeIdeas, refineMemeIdea, generateCaptions, generateJokes, isGeminiConfigured } from './server/geminiService.ts';
import { Storage } from './server/storageService.ts';
import { PythonProjectService } from './server/pythonProjectService.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  const isAiReady = isGeminiConfigured();
  res.json({
    status: 'healthy',
    service: 'Meme and Humor Idea Generator',
    ai_configured: isAiReady,
    provider: isAiReady ? 'Google Gemini (gemini-3.8-flash)' : 'Offline Template Fallback Engine',
    database: 'SQLite (Python) / Persistent Local Storage (Node.js)'
  });
});

// POST /api/generate
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { topic, category, style, intensity, language, count } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    if (topic.length > 300) {
      res.status(400).json({ error: 'Topic exceeds maximum length of 300 characters' });
      return;
    }

    const safeCategory = category || 'Relatable Humor';
    const safeStyle = style || 'Witty';
    const safeIntensity = intensity || 'Medium';
    const safeLanguage = language || 'English';
    const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 5));

    const result = await generateMemeIdeas(
      topic.trim(),
      safeCategory,
      safeStyle,
      safeIntensity,
      safeLanguage,
      safeCount
    );

    const payload = {
      source: result.source,
      model: result.model,
      topic: topic.trim(),
      category: safeCategory,
      style: safeStyle,
      intensity: safeIntensity,
      language: safeLanguage,
      ideas: result.ideas
    };

    // Record into history
    Storage.addHistory(
      topic.trim(),
      'meme_generator',
      {
        category: safeCategory,
        style: safeStyle,
        intensity: safeIntensity,
        language: safeLanguage,
        count: safeCount
      },
      payload
    );

    res.json(payload);
  } catch (err: any) {
    console.error('Error in /api/generate:', err);
    res.status(500).json({ error: 'Failed to generate meme ideas' });
  }
});

// POST /api/refine
app.post('/api/refine', async (req: Request, res: Response) => {
  try {
    const { idea, instruction, language } = req.body;
    if (!idea || typeof idea !== 'object') {
      res.status(400).json({ error: 'Valid idea object is required' });
      return;
    }

    const safeInstruction = instruction || 'make it funnier';
    const safeLanguage = language || 'English';

    const result = await refineMemeIdea(idea, safeInstruction, safeLanguage);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/refine:', err);
    res.status(500).json({ error: 'Failed to refine meme idea' });
  }
});

// POST /api/captions
app.post('/api/captions', async (req: Request, res: Response) => {
  try {
    const { topic, tone, language, count } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const safeTone = tone || 'Witty';
    const safeLanguage = language || 'English';
    const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 5));

    const result = await generateCaptions(topic.trim(), safeTone, safeLanguage, safeCount);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/captions:', err);
    res.status(500).json({ error: 'Failed to generate captions' });
  }
});

// POST /api/jokes
app.post('/api/jokes', async (req: Request, res: Response) => {
  try {
    const { category, style, language, count } = req.body;
    const safeCategory = category || 'College and Student Humor';
    const safeStyle = style || 'Witty';
    const safeLanguage = language || 'English';
    const safeCount = Math.max(1, Math.min(10, parseInt(count, 10) || 5));

    const result = await generateJokes(safeCategory, safeStyle, safeLanguage, safeCount);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/jokes:', err);
    res.status(500).json({ error: 'Failed to generate jokes' });
  }
});

// GET /api/favorites
app.get('/api/favorites', (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const favorites = Storage.getFavorites(search);
  res.json({ favorites });
});

// POST /api/favorites
app.post('/api/favorites', (req: Request, res: Response) => {
  const { topic, category, language, content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }
  const fav = Storage.addFavorite(topic, category, language, content);
  res.status(201).json({ message: 'Saved to favorites successfully', id: fav.id, favorite: fav });
});

// DELETE /api/favorites/:id
app.delete('/api/favorites/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const success = Storage.deleteFavorite(id);
  if (success) {
    res.json({ message: 'Favorite deleted successfully' });
  } else {
    res.status(404).json({ error: 'Favorite not found' });
  }
});

// GET /api/history
app.get('/api/history', (req: Request, res: Response) => {
  const history = Storage.getHistory(30);
  res.json({ history });
});

// DELETE /api/history
app.delete('/api/history', (req: Request, res: Response) => {
  Storage.clearHistory();
  res.json({ message: 'History cleared successfully' });
});

// GET /api/python-project-tree
app.get('/api/python-project-tree', (req: Request, res: Response) => {
  const tree = PythonProjectService.getTree();
  res.json({ tree });
});

// GET /api/python-file
app.get('/api/python-file', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    res.status(400).json({ error: 'Path is required' });
    return;
  }
  const content = PythonProjectService.getFileContent(filePath);
  if (content === null) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  res.json({ path: filePath, content });
});

// -------------------------------------------------------------
// Vite Dev Server / Static Hosting
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(process.cwd(), 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
