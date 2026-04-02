"use client"

import { useState, useRef, useEffect } from "react"
import { 
    Mic, Square, RotateCcw, Play, Pause, 
    Loader2, Trash2, CheckCircle2, Waves 
} from "lucide-react"

interface VoiceRecorderProps {
    onComplete: (url: string, transcription: string) => void
    onCancel: () => void
}

export default function VoiceRecorder({ onComplete, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (audioUrl) URL.revokeObjectURL(audioUrl)
        }
    }, [audioUrl])
    
    // Playback Logic
    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play().catch(e => {
                console.error("Playback failed:", e)
                setIsPlaying(false)
            })
        } else {
            audioRef.current?.pause()
        }
    }, [isPlaying])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            mediaRecorderRef.current = recorder
            audioChunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                const url = URL.createObjectURL(blob)
                setAudioBlob(blob)
                setAudioUrl(url)
                if (timerRef.current) clearInterval(timerRef.current)
            }

            recorder.start()
            setIsRecording(true)
            setRecordingTime(0)
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (err) {
            console.error("Failed to start recording:", err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
        }
    }

    const resetRecording = () => {
        setAudioBlob(null)
        setAudioUrl(null)
        setRecordingTime(0)
        setIsPlaying(false)
    }

    const handleUpload = async () => {
        if (!audioBlob) return
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", audioBlob, "signal.webm")
            
            // Sequential: Upload then Transcribe
            const { uploadVoiceSignal, transcribeAudio } = await import("@/lib/actions/voiceActions")
            const { url } = await uploadVoiceSignal(formData)
            const { text } = await transcribeAudio(formData)
            
            onComplete(url, text)
        } catch (err) {
            console.error("Signal transmission failed:", err)
        } finally {
            setIsUploading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="bg-truth-nearBlack border-2 border-truth-midGray p-6 space-y-6 relative overflow-hidden">
            {/* Visualizer Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <Waves className={`w-64 h-64 text-truth-accentRed ${isRecording ? "animate-pulse scale-110" : ""}`} />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-truth-textGray uppercase tracking-[0.4em]">Signal_Frequency</span>
                    <div className="text-4xl font-bitter font-black text-truth-textLight">{formatTime(recordingTime)}</div>
                </div>

                {!audioBlob ? (
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all 
                            ${isRecording 
                                ? "bg-truth-accentRed border-4 border-white animate-pulse" 
                                : "bg-truth-nearBlack border-2 border-truth-accentRed hover:bg-truth-accentRed/10"}`}
                    >
                        {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-truth-accentRed" />}
                    </button>
                ) : (
                    <div className="flex items-center gap-8">
                        <button onClick={resetRecording} className="p-3 border-2 border-truth-midGray text-truth-textGray hover:text-truth-accentRed hover:border-truth-accentRed transition-all">
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 bg-truth-textLight rounded-full flex items-center justify-center text-truth-bg hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                        </button>

                        <button onClick={resetRecording} className="p-3 border-2 border-truth-midGray text-truth-textGray hover:text-truth-accentRed hover:border-truth-accentRed transition-all">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="w-full flex gap-4 pt-4 border-t border-truth-midGray">
                    <button 
                        onClick={onCancel}
                        disabled={isUploading}
                        className="flex-1 py-3 border-2 border-truth-midGray text-truth-textGray font-mono text-[10px] uppercase font-bold hover:border-truth-textLight hover:text-truth-textLight disabled:opacity-50"
                    >
                        Abort_Signal
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!audioBlob || isUploading}
                        className="flex-3 py-3 bg-truth-accentRed text-white font-mono text-[10px] uppercase font-black tracking-widest hover:bg-truth-accentRed/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(255,51,102,0.2)]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Encrypting_Signal...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Transmit_Voice_Packet
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden Audio for Playback */}
            {audioUrl && (
                <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="hidden"
                />
            )}
        </div>
    )
}
