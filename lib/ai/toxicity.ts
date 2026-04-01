// lib/ai/toxicity.ts

import OpenAI from 'openai'

// OpenRouter configuration
let _openai: OpenAI | null = null;

function getOpenAIClient() {
  if (_openai) return _openai;
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is missing. AI features will fail open.");
    return null;
  }

  _openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://truth.io", // Replace with your site URL
      "X-Title": "Truth AI Moderation",
    }
  });
  
  return _openai;
}

export type ToneType = 'HONEST' | 'HARSH' | 'FUNNY' | 'DEEP' | 'NEUTRAL'

// Using a Groq model through OpenRouter
const TOXICITY_MODEL = "groq/llama-3.1-70b-versatile"
const TONE_MODEL = "groq/llama-3.1-70b-versatile"

export async function checkToxicity(content: string): Promise<boolean> {
  const openai = getOpenAIClient();
  if (!openai) return false;

  try {
    const response = await openai.chat.completions.create({
      model: TOXICITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `Analyze this message for toxicity. Respond with ONLY 'TRUE' if it contains hate speech, harassment, or extreme violence, and 'FALSE' otherwise.`
        },
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 5
    })

    const result = response.choices[0].message.content?.trim().toUpperCase()
    return result === 'TRUE'
  } catch (error) {
    console.error('Toxicity check failed:', error)
    // Fail open - don't block if API fails
    return false
  }
}

export async function detectTone(content: string): Promise<ToneType> {
  const openai = getOpenAIClient();
  if (!openai) return 'NEUTRAL';

  try {
    const response = await openai.chat.completions.create({
      model: TONE_MODEL,
      messages: [
        {
          role: 'system',
          content: `Analyze the tone of this message. Respond with ONLY one word: HONEST, HARSH, FUNNY, DEEP, or NEUTRAL.`
        },
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 10
    })

    const tone = response.choices[0].message.content?.trim().toUpperCase()
    
    const validTones: ToneType[] = ['HONEST', 'HARSH', 'FUNNY', 'DEEP', 'NEUTRAL']
    if (validTones.includes(tone as ToneType)) {
      return tone as ToneType
    }

    return 'NEUTRAL'
  } catch (error) {
    console.error('Tone detection failed:', error)
    return 'NEUTRAL'
  }
}