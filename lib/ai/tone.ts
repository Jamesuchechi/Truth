// lib/ai/tone.ts
import { ToneType } from "@prisma/client"

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

const OPENROUTER_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free"
]

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768"
]

async function callOpenRouter(content: string, model: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://truth-so4f.vercel.app", 
      "X-Title": "TruthOS"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a tone analysis engine for a secure messaging protocol called TruthOS. Your task is to analyze the tone of the provided message and return EXACTLY ONE of the following keywords: HONEST, HARSH, FUNNY, DEEP, NEUTRAL. Output ONLY the keyword."
        },
        { role: "user", content: content }
      ],
      max_tokens: 10,
      temperature: 0
    })
  })

  if (!response.ok) throw new Error(`OpenRouter error: ${response.statusText}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim().toUpperCase()
}

async function callGroq(content: string, model: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a tone analysis engine for a secure messaging protocol called TruthOS. Your task is to analyze the tone of the provided message and return EXACTLY ONE of the following keywords: HONEST, HARSH, FUNNY, DEEP, NEUTRAL. Output ONLY the keyword."
        },
        { role: "user", content: content }
      ],
      max_tokens: 10,
      temperature: 0
    })
  })

  if (!response.ok) throw new Error(`Groq error: ${response.statusText}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim().toUpperCase()
}

export async function detectTone(content: string): Promise<ToneType> {
  // Try OpenRouter (Primary)
  if (OPENROUTER_API_KEY) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const tone = await callOpenRouter(content, model)
        if (isValidTone(tone)) return tone as ToneType
      } catch (error) {
        console.error(`OpenRouter (${model}) failed:`, error)
      }
    }
  }

  // Try Groq (Fallback)
  if (GROQ_API_KEY) {
    for (const model of GROQ_MODELS) {
      try {
        const tone = await callGroq(content, model)
        if (isValidTone(tone)) return tone as ToneType
      } catch (error) {
        console.error(`Groq (${model}) failed:`, error)
      }
    }
  }

  return ToneType.NEUTRAL
}

function isValidTone(tone: string): boolean {
  return Object.values(ToneType).includes(tone as ToneType)
}
