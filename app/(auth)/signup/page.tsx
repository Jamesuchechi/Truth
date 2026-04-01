// app/(auth)/signup/page.tsx
import SignupForm from "@/components/auth/SignupForm"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Initialize Protocol | signup',
  description: 'Join the TruTH network and reclaim your digital reality.',
}

export default function SignupPage() {
  return <SignupForm />
}
