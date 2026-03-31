// app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authorize Access | login',
  description: 'Log in to the TruTH OS and reclaim your authentic identity.',
}

export default function LoginPage() {
  return <LoginForm />
}
