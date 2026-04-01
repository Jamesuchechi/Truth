// lib/actions/user.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth, signIn, signOut } from "@/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { AuthError } from "next-auth"
import { rateLimit } from "@/lib/rate-limit"
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail"
import { generateSecret, verify, generateURI } from "otplib"
import QRCode from "qrcode"

export async function logoutUser() {
  await signOut({ redirectTo: "/" })
}

export type ActionState = {
  error?: string | Record<string, string[] | undefined>
  success?: string
  twoFactor?: boolean
}

const SignupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const SettingsSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
  isTwoFactorEnabled: z.boolean().optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal("")),
  securityQuestion: z.string().optional(),
  securityAnswer: z.string().optional(),
})

export async function loginUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  const code = formData.get("code") as string

  // Rate Limiting: 5 attempts per 10 minutes
  const { success: rateLimitOk } = await rateLimit(`login:${email}`, 5, 600)
  if (!rateLimitOk) return { error: "Too many login attempts. Please wait." }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (!existingUser || !existingUser.passwordHash) return { error: "Invalid credentials" }

  const passwordsMatch = await bcrypt.compare(password, existingUser.passwordHash)
  if (!passwordsMatch) return { error: "Invalid credentials" }

  if (!existingUser.emailVerified) {
    const token = await generateVerificationToken(email)
    await sendVerificationEmail(token.identifier, token.token)
    return { success: "Verification email sent!" }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.twoFactorSecret) {
    if (code) {
      const { valid: isValid } = await verify({
        token: code,
        secret: existingUser.twoFactorSecret
      })
      if (!isValid) return { error: "Invalid 2FA code" }

      await prisma.twoFactorConfirmation.create({
        data: { userId: existingUser.id }
      })
    } else {
      return { twoFactor: true }
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: "Logged in successfully!" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error
  }
}

export async function registerUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = SignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, email, password } = validatedFields.data

  // Rate Limiting: 3 registrations per hour per IP
  const { success: rateLimitOk } = await rateLimit(`signup:${email}`, 3, 3600)
  if (!rateLimitOk) return { error: "Too many registration attempts. Please wait." }

  const session = await auth()
  const isAnonymousSession = session?.user?.isAnonymous // Note: Ensure session user has isAnonymous

  try {
    // Check if email already exists on a fully registered account
    const existingRegistration = await prisma.user.findUnique({
      where: { email },
    })

    if (existingRegistration && !existingRegistration.isAnonymous) {
      return {
        error: "User with this email already exists",
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    if (isAnonymousSession && session?.user?.id) {
        // CONVERSION LOGIC: Update the existing anonymous user
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                username,
                email,
                passwordHash,
                isAnonymous: false,
                emailVerified: null, // Require verification
            }
        })
    } else {
        // NORMAL REGISTRATION: Create a new user
        // Check if username already exists (only for new registrations)
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        })

        if (existingUsername) {
            return { error: "Username is already taken" }
        }

        await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                shadowName: `shadow_${Math.random().toString(36).substring(2, 7)}`,
                isAnonymous: false,
            },
        })
    }

    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token)

    return { success: "Protocol initialized. Verification email sent!" }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function loginAnonymous(): Promise<ActionState> {
  const anonymousId = Math.random().toString(36).substring(2, 12);
  const guestUsername = `guest_${Math.random().toString(36).substring(2, 8)}`;

  try {
    const user = await prisma.user.create({
      data: {
        username: guestUsername,
        isAnonymous: true,
        anonymousId: anonymousId,
        shadowName: `shadow_${Math.random().toString(36).substring(2, 7)}`,
      }
    });

    await signIn("credentials", {
      anonymousId: user.anonymousId as string,
      type: "anonymous",
      redirect: false,
    });

    return { success: "Logged in as guest" };
  } catch (error) {
    console.error("Anonymous login error:", error);
    return { error: "Failed to start guest session" };
  }
}

export async function resetPassword(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email") as string
  if (!email) return { error: "Email is required" }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "User not found" }

  const token = await generatePasswordResetToken(email)
  await sendPasswordResetEmail(token.email, token.token)

  return { success: "Password reset email sent!" }
}

export async function confirmEmail(token: string): Promise<ActionState> {
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!existingToken) return { error: "Token does not exist!" }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) return { error: "Token has expired!" }

  const existingUser = await prisma.user.findFirst({
    where: { email: existingToken.identifier },
  })

  if (!existingUser) return { error: "Email does not exist!" }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.identifier,
    },
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: existingToken.identifier,
        token: existingToken.token,
      }
    },
  })

  return { success: "Email verified!" }
}

export async function newPassword(password: string, token?: string | null): Promise<ActionState> {
  if (!token) return { error: "Missing token!" }

  const existingToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!existingToken) return { error: "Invalid token!" }

  const hasExpired = new Date(existingToken.expires) < new Date()
  if (hasExpired) return { error: "Token has expired!" }

  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email },
  })

  if (!existingUser) return { error: "Email does not exist!" }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { passwordHash: hashedPassword },
  })

  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  })

  return { success: "Password updated!" }
}
export async function updateSettings(values: z.infer<typeof SettingsSchema>): Promise<ActionState> {
  const validatedFields = SettingsSchema.safeParse(values)
  if (!validatedFields.success) return { error: "Invalid fields" }

  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!dbUser) return { error: "User not found" }

  const updateData: Partial<typeof dbUser> = {}

  if (values.username && values.username !== dbUser.username) {
    // Check if username unique
    const existingName = await prisma.user.findUnique({ where: { username: values.username } })
    if (existingName) return { error: "Username already taken" }
    
    // Log history
    await prisma.usernameHistory.create({
      data: {
        userId: dbUser.id,
        username: dbUser.username
      }
    })
    updateData.username = values.username
  }

  if (values.email && values.email !== dbUser.email) {
    const existingUser = await prisma.user.findUnique({ where: { email: values.email } })
    if (existingUser) return { error: "Email already in use" }
    updateData.email = values.email
    updateData.emailVerified = null // Require re-verification
  }

  if (values.password && values.newPassword && dbUser.passwordHash) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.passwordHash)
    if (!passwordsMatch) return { error: "Incorrect current password" }
    updateData.passwordHash = await bcrypt.hash(values.newPassword, 12)
  }

  if (typeof values.isTwoFactorEnabled !== 'undefined') {
    updateData.isTwoFactorEnabled = values.isTwoFactorEnabled
  }

  if (values.bio !== undefined) updateData.bio = values.bio
  if (values.image !== undefined) updateData.image = values.image
  
  if (values.securityQuestion && values.securityAnswer) {
    updateData.securityQuestion = values.securityQuestion
    updateData.securityAnswer = await bcrypt.hash(values.securityAnswer, 10)
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  })

  return { success: "Settings updated!" }
}

export async function deleteAccount(): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.user.delete({
    where: { id: session.user.id },
  })

  await signOut({ redirectTo: "/" })
  return { success: "Account deleted." }
}
export async function getTwoFactorSecret() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const secret = generateSecret()
  const otpauth = generateURI({
    label: session.user.email!,
    issuer: "TruTH",
    secret
  })
  const qrCode = await QRCode.toDataURL(otpauth)

  return { secret, qrCode }
}

export async function enableTwoFactor(secret: string, token: string): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const { valid: isValid } = await verify({ token, secret })
  if (!isValid) return { error: "Invalid verification code" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: secret,
      isTwoFactorEnabled: true,
    },
  })

  return { success: "Two-factor authentication enabled" }
}

export async function disableTwoFactor(): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorSecret: null,
      isTwoFactorEnabled: false,
    },
  })

  return { success: "Two-factor authentication disabled" }
}

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: false, // Security: don't leak email
        image: true,
        bio: true,
        isAnonymous: true,
        shadowName: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          }
        }
      }
    })

    return user
  } catch {
    return null
  }
}

export async function getSecurityQuestion(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { securityQuestion: true }
  })
  
  if (!user || !user.securityQuestion) return { error: "No security protocol found for this identity." }
  return { success: true, question: user.securityQuestion }
}

export async function verifySecurityAnswer(email: string, answer: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user || !user.securityAnswer) return { error: "Identity protocol failure." }
  
  const isValid = await bcrypt.compare(answer, user.securityAnswer)
  if (!isValid) return { error: "Invalid protocol decryption key." }
  
  // Create a password reset token
  const token = await generatePasswordResetToken(email)
  return { success: true, token: token.token }
}
