import OpenAI from 'openai'

let _openai: OpenAI | null = null;

function getOpenAIClient() {
  if (_openai) return _openai;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  _openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://truth.io",
      "X-Title": "Truth AI Summarizer",
    }
  });
  return _openai;
}

const SUMMARY_MODEL = "google/gemini-2.0-flash-exp:free"

export async function summarizeContent(content: string): Promise<string> {
  const openai = getOpenAIClient();
  if (!openai || content.length < 100) return ""

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are TruthAI, a signal extraction engine. Summarize the provided "Truth Signal" into a single, punchy phrase (max 20 words). Focus on the core objective but keep the mysterious, high-fidelity tone of TruthOS. Use uppercase for technical terms. No jargon or filler.`
        },
        { role: 'user', content }
      ],
      max_tokens: 50,
      temperature: 0.3
    })

    return response.choices[0].message.content?.trim() || ""
  } catch (error) {
    console.error('Summarization failed:', error)
    return ""
  }
}

export async function summarizeThread(contents: string[]): Promise<string> {
  const combined = contents.join("\n\n---\n\n")
  return summarizeContent(combined)
}
