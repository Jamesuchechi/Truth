// lib/utils/fingerprint.ts
import { headers } from "next/headers"
import crypto from "crypto"

export async function getSenderFingerprint(): Promise<string> {
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"
  
  // Hash together IP and UA with a salt from environment (or static if not provided)
  const salt = process.env.FINGERPRINT_SALT || "truth_secure_salt_2024"
  
  return crypto
    .createHash("sha256")
    .update(`${ip}-${userAgent}-${salt}`)
    .digest("hex")
}
