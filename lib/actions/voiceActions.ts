"use server"

import { auth } from "@/auth"
import { put } from "@vercel/blob"
import OpenAI from "openai"

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

export async function transcribeAudio(formData: FormData) {
    await auth() // Keep for security check if intended, or remove if not needed. User wanted it for session check.
    
    const file = formData.get("file") as File
    if (!file) throw new Error("No signal file detected")

    try {
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
        })

        return { text: transcription.text }
    } catch (error) {
        console.error("Transcription failed:", error)
        throw new Error("Unable to decode voice signal")
    }
}

export async function uploadVoiceSignal(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) throw new Error("No signal file detected")

    const blob = await put(`signals/voice-${Date.now()}.webm`, file, {
        access: "public",
        addRandomSuffix: true,
    })

    return { url: blob.url }
}
