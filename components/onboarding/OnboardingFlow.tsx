"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, X } from "lucide-react"
import { completeOnboarding } from "@/lib/actions/user"
import { WelcomeStep } from "./WelcomeStep"
import { ChannelStep } from "./ChannelStep"
import { TutorialStep } from "./TutorialStep"
import { PromptStep } from "./PromptStep"
import { useToast } from "@/components/providers/ToastProvider"
import { useSession } from "next-auth/react"

export type OnboardingStep = "WELCOME" | "CHANNELS" | "TUTORIAL" | "PROMPT"

export default function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>("WELCOME")
  const [isExiting, setIsExiting] = useState(false)
  const { showToast } = useToast()
  const { update } = useSession()

  const handleComplete = async () => {
    setIsExiting(true)
    const res = await completeOnboarding()
    if (res.error) {
      showToast("Protocol synchronization failed.", "error")
      setIsExiting(false)
      return
    }
    // Push hasCompletedOnboarding:true into the JWT cookie so hard
    // refreshes don't re-read the stale token and re-show this modal.
    await update({ hasCompletedOnboarding: true })
  }

  const handleSkip = () => handleComplete()

  const nextStep = (current: OnboardingStep) => {
    if (current === "WELCOME") setStep("CHANNELS")
    else if (current === "CHANNELS") setStep("TUTORIAL")
    else if (current === "TUTORIAL") setStep("PROMPT")
    else handleComplete()
  }

  if (isExiting) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
      {/* Protocol Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-size-[100%_2px] z-10 opacity-20" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-card border-4 border-border shadow-[20px_20px_0px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_0px_rgba(0,0,0,0.4)] p-8 md:p-12 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-truth-accentRed flex items-center justify-center rounded-sm">
              <Shield className="text-black w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bitter text-xl font-black uppercase tracking-tighter text-foreground">Protocol_Init</h2>
              <p className="font-mono text-[8px] text-muted uppercase tracking-widest mt-0.5">Step {step === "WELCOME" ? 1 : step === "CHANNELS" ? 2 : step === "TUTORIAL" ? 3 : 4} of 4</p>
            </div>
          </div>
          <button 
            onClick={handleSkip}
            className="flex items-center gap-2 font-mono text-[10px] text-muted hover:text-truth-accentRed transition-colors uppercase tracking-widest"
          >
            Skip_Protocol <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === "WELCOME" && (
              <WelcomeStep key="welcome" onNext={() => nextStep("WELCOME")} />
            )}
            {step === "CHANNELS" && (
              <ChannelStep key="channels" onNext={() => nextStep("CHANNELS")} />
            )}
            {step === "TUTORIAL" && (
              <TutorialStep key="tutorial" onNext={() => nextStep("TUTORIAL")} />
            )}
            {step === "PROMPT" && (
              <PromptStep key="prompt" onComplete={handleComplete} />
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {(["WELCOME", "CHANNELS", "TUTORIAL", "PROMPT"] as OnboardingStep[]).map((s) => (
            <div 
              key={s}
              className={`h-1.5 transition-all duration-300 rounded-full ${step === s ? "w-8 bg-truth-accentRed" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
