import NewPasswordForm from "@/components/auth/NewPasswordForm"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function NewPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-truth-accentRed" />}>
        <NewPasswordForm />
      </Suspense>
    </div>
  )
}
