// lib/ai/toxicity.ts

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function checkToxicity(content: string): Promise<boolean> {
  try {
    const response = await openai.moderations.create({
      input: content
    })

    const result = response.results[0]

    // Flag if any category exceeds threshold
    const isToxic = 
      result.categories.harassment ||
      result.categories.hate ||
      result.categories.self_harm ||
      result.categories.sexual_minors ||
      result.categories.violence

    return isToxic
  } catch (error) {
    console.error('Toxicity check failed:', error)
    // Fail open - don't block if API fails
    return false
  }
}

export async function detectTone(content: string): Promise<ToneType> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    
    if (['HONEST', 'HARSH', 'FUNNY', 'DEEP', 'NEUTRAL'].includes(tone || '')) {
      return tone as ToneType
    }

    return 'NEUTRAL'
  } catch (error) {
    console.error('Tone detection failed:', error)
    return 'NEUTRAL'
  }
}