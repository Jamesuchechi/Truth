import { confirmEmail } from "@/lib/actions/user"
import Link from "next/link"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
        <XCircle className="w-16 h-16 text-truth-accentRed mb-6" />
        <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase mb-4">Invalid Request</h2>
        <p className="font-mono text-sm text-truth-textGray mb-8">No verification token provided in the URL.</p>
        <Link href="/login" className="px-8 py-4 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:scale-105 transition-all">
          Back to Login
        </Link>
      </div>
    )
  }

  const result = await confirmEmail(token)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-truth-nearBlack border-2 border-truth-midGray shadow-[10px_10px_0px_rgba(255,51,102,0.2)]">
      {result.success ? (
        <>
          <CheckCircle2 className="w-16 h-16 text-truth-accentGreen mb-6 animate-bounce" />
          <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase mb-4">Protocol Verified</h2>
          <p className="font-mono text-sm text-truth-textGray mb-8">{result.success}</p>
          <Link href="/login" className="px-8 py-4 bg-truth-accentGreen text-truth-bg font-mono font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
            Access System <ArrowRight className="w-5 h-5" />
          </Link>
        </>
      ) : (
        <>
          <XCircle className="w-16 h-16 text-truth-accentRed mb-6" />
          <h2 className="font-bitter text-3xl font-black text-truth-textLight uppercase mb-4">Verification Failed</h2>
          <p className="font-mono text-sm text-truth-textGray mb-8">{result.error as string}</p>
          <Link href="/signup" className="px-8 py-4 bg-truth-accentRed text-truth-bg font-mono font-bold uppercase tracking-widest hover:scale-105 transition-all">
            Retry Registration
          </Link>
        </>
      )}
    </div>
  )
}
