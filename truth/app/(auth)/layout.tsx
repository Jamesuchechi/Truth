// app/(auth)/layout.tsx
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-truth-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-truth-accentRed/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-truth-accentPurple/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Back to Home Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/" 
          className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-truth-textGray hover:text-truth-accentRed transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-truth-midGray flex items-center justify-center group-hover:border-truth-accentRed transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Hub
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-truth-textGray opacity-40 select-none">
          TruTH OS — Identity Verification Protocol v1.0.4
        </span>
      </div>
    </div>
  )
}
