// lib/ai/toxicity.ts

import OpenAI from 'openai'

// OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://truth.io", // Replace with your site URL
    "X-Title": "Truth AI Moderation",
  }
})

export type ToneType = 'HONEST' | 'HARSH' | 'FUNNY' | 'DEEP' | 'NEUTRAL'

// Using a Groq model through OpenRouter
const TOXICITY_MODEL = "groq/llama-3.1-70b-versatile"
const TONE_MODEL = "groq/llama-3.1-70b-versatile"

export async function checkToxicity(content: string): Promise<boolean> {
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