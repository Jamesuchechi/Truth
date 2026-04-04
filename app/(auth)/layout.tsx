// app/(auth)/layout.tsx
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "@/components/shared/Footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-truth-bg flex flex-col">
      {/* Background Atmosphere */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-truth-accentRed/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-truth-accentPurple/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Back to Home Navigation */}
      <div className="relative z-50 pt-8 pl-8">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-truth-midGray flex items-center justify-center group-hover:border-truth-accentRed transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Hub
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </div>

      {/* Shared Footer */}
      <Footer />
    </div>
  )
}
