import { GoogleGenAI, Type } from '@google/genai';
import { getFallbackIdeas, getFallbackCaptions, getFallbackJokes, MemeIdea, CaptionItem, JokeItem } from './fallbackService.ts';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateMemeIdeas(
  topic: string,
  category: string = "Relatable Humor",
  style: string = "Witty",
  intensity: string = "Medium",
  language: string = "English",
  count: number = 5
): Promise<{ source: 'ai' | 'fallback'; ideas: MemeIdea[]; model: string }> {
  const ai = getAIClient();
  const cleanTopic = topic.trim() || "Daily Life";

  if (ai) {
    try {
      const prompt = `You are a master meme creator and comedy writer. Generate exactly ${count} creative, hilarious meme concepts based on:
- Topic: "${cleanTopic}"
- Humor Category: "${category}"
- Humor Style: "${style}"
- Humor Intensity: "${intensity}"
- Language: "${language}"

Language Guidelines:
- If Language is "Tamil", write naturally and humorously in Tamil script (e.g. தமிழ் சினிமா பாணி, நகைச்சுவை).
- If Language is "Tanglish", write conversational Tamil in English alphabets (e.g. "Machi", "Semma", "Idhu enna prachana", "Exam-la zero marks").
- If Language is "English", write in witty, modern internet meme culture format.

Output Requirements:
- Strictly produce valid JSON matching the requested schema.
- Safe, non-offensive, no hate speech.
- Do not include emojis or decorative symbols; provide clean text and typography only.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ideas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    concept: { type: Type.STRING },
                    visual_scene: { type: Type.STRING },
                    top_text: { type: Type.STRING },
                    bottom_text: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["title", "concept", "visual_scene", "top_text", "bottom_text", "caption", "hashtags"]
                }
              }
            },
            required: ["ideas"]
          }
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
          return {
            source: 'ai',
            ideas: parsed.ideas,
            model: 'gemini-3.8-flash'
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to local engine:", err);
    }
  }

  // Graceful fallback
  const fallbackIdeas = getFallbackIdeas(cleanTopic, category, style, intensity, language, count);
  return {
    source: 'fallback',
    ideas: fallbackIdeas,
    model: 'offline-template-engine'
  };
}

export async function refineMemeIdea(
  originalIdea: any,
  instruction: string,
  language: string = "English"
): Promise<{ source: 'ai' | 'fallback'; refined_idea: MemeIdea }> {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `Refine this existing meme idea:
${JSON.stringify(originalIdea, null, 2)}

Refinement instruction: "${instruction}"
Preserve the requested language (${language}).

Return a single revised meme object in JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              concept: { type: Type.STRING },
              visual_scene: { type: Type.STRING },
              top_text: { type: Type.STRING },
              bottom_text: { type: Type.STRING },
              caption: { type: Type.STRING },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "concept", "visual_scene", "top_text", "bottom_text", "caption", "hashtags"]
          }
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          source: 'ai',
          refined_idea: parsed
        };
      }
    } catch (err) {
      console.warn("Gemini refinement failed, applying rule-based refinement:", err);
    }
  }

  // Rule-based refinement
  const revised = { ...originalIdea };
  const instLower = instruction.toLowerCase();
  if (instLower.includes("shorter")) {
    revised.top_text = (revised.top_text || "").split(",")[0];
    revised.bottom_text = (revised.bottom_text || "").split(",")[0];
    revised.caption = (revised.caption || "").slice(0, 60) + "...";
  } else if (instLower.includes("funnier") || instLower.includes("extra")) {
    revised.caption = `${revised.caption || ""} #Relatable #Humor`;
  } else if (instLower.includes("relatable")) {
    revised.top_text = "Nobody: Literally Nobody:";
    revised.bottom_text = `Me dealing with ${originalIdea.title || 'this'} at 3 AM`;
  } else if (instLower.includes("tanglish")) {
    revised.top_text = `Machi: ${revised.top_text || ""}`;
    revised.bottom_text = `Me: ${revised.bottom_text || ""} (Semma scene da)`;
    revised.caption = `${revised.caption || ""} #TanglishVibes #VeraLevel`;
  }

  return {
    source: 'fallback',
    refined_idea: revised
  };
}

export async function generateCaptions(
  topic: string,
  tone: string = "Witty",
  language: string = "English",
  count: number = 5
): Promise<{ source: 'ai' | 'fallback'; captions: CaptionItem[] }> {
  const ai = getAIClient();
  const cleanTopic = topic.trim() || "Life";

  if (ai) {
    try {
      const prompt = `Generate exactly ${count} hilarious, punchy social media captions about: "${cleanTopic}".
Tone: ${tone}
Language: ${language} (if Tanglish, write colloquial Tamil in English alphabet).
Format for Instagram / Threads / Twitter. Do not include emojis or symbol clutter; rely purely on strong comedic writing and concise phrasing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              captions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    caption: { type: Type.STRING },
                    tone: { type: Type.STRING },
                    platform: { type: Type.STRING }
                  },
                  required: ["caption", "tone", "platform"]
                }
              }
            },
            required: ["captions"]
          }
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.captions)) {
          return {
            source: 'ai',
            captions: parsed.captions
          };
        }
      }
    } catch (err) {
      console.warn("Gemini caption error:", err);
    }
  }

  return {
    source: 'fallback',
    captions: getFallbackCaptions(cleanTopic, tone, language, count)
  };
}

export async function generateJokes(
  category: string,
  style: string,
  language: string = "English",
  count: number = 5
): Promise<{ source: 'ai' | 'fallback'; jokes: JokeItem[] }> {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `Generate ${count} funny jokes for Category: "${category}", Style: "${style}", Language: "${language}".
Include a mix of One-liners, Q&A, and situational jokes. Do not include emojis or decorative symbols; use clean text only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jokes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    setup: { type: Type.STRING },
                    punchline: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["type", "setup", "punchline", "tags"]
                }
              }
            },
            required: ["jokes"]
          }
        }
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.jokes)) {
          return {
            source: 'ai',
            jokes: parsed.jokes
          };
        }
      }
    } catch (err) {
      console.warn("Gemini joke error:", err);
    }
  }

  return {
    source: 'fallback',
    jokes: getFallbackJokes(category, style, language, count)
  };
}
