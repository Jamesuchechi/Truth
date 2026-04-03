// lib/ai/moderation.ts
import OpenAI from 'openai'
import type { ToneType } from '@prisma/client'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY

// Configuration
export const MODERATION_CONFIG = {
  TOXICITY_THRESHOLD_BLOCK: 0.8,
  TOXICITY_THRESHOLD_WARN: 0.5,
  MODELS: {
    TOXICITY: "groq/llama-3.1-70b-versatile",
    TONE: "google/gemini-2.0-flash-exp:free",
    SENTIMENT: "mistralai/mistral-7b-instruct:free" // Fallback if HF fails
  }
}

// Simple internal blacklist (can be expanded later)
const BLACKLIST = [
  "badword1", "badword2", // placeholders
]

let _openai: OpenAI | null = null

function getAIClient() {
  if (_openai) return _openai
  if (!OPENROUTER_API_KEY) return null

  _openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "https://truth.io",
      "X-Title": "Truth AI Moderation Engine",
    }
  })
  return _openai
}

export interface AnalysisResult {
  toxicityScore: number
  isBlocked: boolean
  isFlagged: boolean
  flagReason?: string
  tone: ToneType
  toneConfidence: number
  sentiment: string
  emotions: string[]
  shouldWarn: boolean
  isSarcastic?: boolean
  culturalSensitivityScore?: number
}

/**
 * Robust content analysis for protocol integrity
 */
export async function analyzeContent(content: string): Promise<AnalysisResult> {
  const defaultResult: AnalysisResult = {
    toxicityScore: 0,
    isBlocked: false,
    isFlagged: false,
    tone: 'NEUTRAL',
    toneConfidence: 1,
    sentiment: 'Neutral',
    emotions: [],
    shouldWarn: false
  }

  if (!content.trim()) return defaultResult

  // 1. Keyword Blacklist Check (Static)
  const normalized = content.toLowerCase()
  const foundBlacklist = BLACKLIST.filter(word => normalized.includes(word))
  if (foundBlacklist.length > 0) {
    return {
      ...defaultResult,
      isBlocked: true,
      flagReason: `BLOCK_LIST_VIOLATION: ${foundBlacklist.join(', ')}`
    }
  }

  const ai = getAIClient()
  if (!ai) return defaultResult

  try {
    // 2. Comprehensive AI Analysis (Single pass for efficiency)
    const prompt = `
      Analyze the following message for the Truth protocol.
      
      Return a JSON object with:
      - toxicity: (0.0 to 1.0) High score for hate speech, harassment, threats.
      - tone: EXACTLY ONE: HONEST, HARSH, FUNNY, DEEP, NEUTRAL.
      - confidence: (0.0 to 1.0) For the tone detection.
      - sentiment: (Positive, Negative, Neutral).
      - emotions: Array of detected emotions (e.g., ["anger", "sadness"]).
      - isSarcastic: (True/False) Is the message likely sarcastic or ironic?
      - culturalSensitivity: (0.0 to 1.0) High score if it contains culturally insensitive or offensive phrasing.
      - summary: Briefly describe why it's toxic, sarcastic, or insensitive.
      
      Context: The Truth protocol values raw honesty but prohibits targeted harassment and hate.
      
      Message: "${content}"
    `

    const completion = await ai.chat.completions.create({
      model: MODERATION_CONFIG.MODELS.TOXICITY,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    })

    const raw = JSON.parse(completion.choices[0].message.content || '{}')
    
    // 3. Hugging Face Sentiment Override (Optional/Enhancement)
    let emotions = raw.emotions || []
    if (HUGGINGFACE_API_KEY) {
      try {
        const hfRes = await fetch("https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions", {
          headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` },
          method: "POST",
          body: JSON.stringify({ inputs: content }),
        })
        const hfData = await hfRes.json()
        if (Array.isArray(hfData?.[0])) {
          emotions = hfData[0]
            .filter((e: { score: number; label: string }) => e.score > 0.4)
            .map((e: { score: number; label: string }) => e.label)
        }
      } catch (err) {
        console.warn("HF Emotion detection failed, using primary AI result", err)
      }
    }

    const toxicityScore = raw.toxicity || 0
    const isBlocked = toxicityScore >= MODERATION_CONFIG.TOXICITY_THRESHOLD_BLOCK
    const shouldWarn = toxicityScore >= MODERATION_CONFIG.TOXICITY_THRESHOLD_WARN && !isBlocked

    return {
      toxicityScore,
      isBlocked,
      isFlagged: isBlocked || shouldWarn,
      flagReason: raw.summary,
      tone: (raw.tone as ToneType) || 'NEUTRAL',
      toneConfidence: raw.confidence || 0.5,
      sentiment: raw.sentiment || 'Neutral',
      emotions: emotions,
      shouldWarn,
      isSarcastic: raw.isSarcastic || false,
      culturalSensitivityScore: raw.culturalSensitivity || 0
    }
  } catch (error) {
    console.error("Content analysis system failure:", error)
    return defaultResult // Fail-open to preserve protocol availability
  }
}
