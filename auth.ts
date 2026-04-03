import NextAuth from "next-auth"
import "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { z } from "zod"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    username?: string | null
    isVerified?: boolean
    isTwoFactorEnabled?: boolean
    isAnonymous?: boolean
    role?: string
    emailVerified?: Date | null
    bio?: string | null
    image?: string | null
    securityQuestion?: string | null
    inboxEnabled?: boolean
    allowAnonymousMsg?: boolean
    questionsOnlyMode?: boolean
    allowedTones?: string[] // ToneType[] as strings
    blockedPhrases?: string[]
    messageCooldown?: number
    shadowName?: string | null
    defaultShadowMode?: boolean
    showShadowOnProfile?: boolean
    hasCompletedOnboarding?: boolean
  }
  interface Session {
    user: {
      id: string
      username?: string | null
      isVerified?: boolean
      isTwoFactorEnabled?: boolean
      isAnonymous?: boolean
      role?: string
      bio?: string | null
      image?: string | null
      securityQuestion?: string | null
      inboxEnabled?: boolean
      allowAnonymousMsg?: boolean
      questionsOnlyMode?: boolean
      allowedTones?: string[]
      blockedPhrases?: string[]
      messageCooldown?: number
      shadowName?: string | null
      defaultShadowMode?: boolean
      showShadowOnProfile?: boolean
      hasCompletedOnboarding?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string | null
    isVerified?: boolean
    isTwoFactorEnabled?: boolean
    isAnonymous?: boolean
    role?: string
    bio?: string | null
    image?: string | null
    securityQuestion?: string | null
    inboxEnabled?: boolean
    allowAnonymousMsg?: boolean
    questionsOnlyMode?: boolean
    allowedTones?: string[]
    blockedPhrases?: string[]
    messageCooldown?: number
    shadowName?: string | null
    defaultShadowMode?: boolean
    showShadowOnProfile?: boolean
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        anonymousId: { label: "Anonymous ID", type: "text" },
        type: { label: "Type", type: "text" }
      },
      async authorize(credentials) {
        if (credentials?.type === "anonymous" && credentials?.anonymousId) {
          const user = await prisma.user.findUnique({ 
            where: { anonymousId: credentials.anonymousId as string } 
          })
          if (user && user.isAnonymous) return user
          return null
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({ where: { email } })
          
          if (!user || !user.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            return user
          }
        }

        return null
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.isVerified = !!user.emailVerified
        token.isTwoFactorEnabled = !!user.isTwoFactorEnabled
        token.isAnonymous = user.isAnonymous
        token.role = user.role
        token.bio = user.bio
        token.image = user.image
        token.securityQuestion = user.securityQuestion
        token.inboxEnabled = user.inboxEnabled
        token.allowAnonymousMsg = user.allowAnonymousMsg
        token.questionsOnlyMode = user.questionsOnlyMode
        token.allowedTones = user.allowedTones
        token.blockedPhrases = user.blockedPhrases
        token.messageCooldown = user.messageCooldown
        token.shadowName = user.shadowName
        token.defaultShadowMode = user.defaultShadowMode
        token.showShadowOnProfile = user.showShadowOnProfile
        token.hasCompletedOnboarding = user.hasCompletedOnboarding
      }
      if (trigger === "update" && session) {
        token.username = session.username
        token.bio = session.bio
        token.image = session.image
        token.inboxEnabled = session.inboxEnabled
        token.allowAnonymousMsg = session.allowAnonymousMsg
        token.questionsOnlyMode = session.questionsOnlyMode
        token.allowedTones = session.allowedTones
        token.blockedPhrases = session.blockedPhrases
        token.messageCooldown = session.messageCooldown
        token.shadowName = session.shadowName
        token.defaultShadowMode = session.defaultShadowMode
        token.showShadowOnProfile = session.showShadowOnProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.isVerified = token.isVerified as boolean
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.isAnonymous = token.isAnonymous as boolean
        session.user.role = token.role as string
        session.user.bio = token.bio as string
        session.user.image = token.image as string
        session.user.securityQuestion = token.securityQuestion as string
        session.user.inboxEnabled = token.inboxEnabled as boolean
        session.user.allowAnonymousMsg = token.allowAnonymousMsg as boolean
        session.user.questionsOnlyMode = token.questionsOnlyMode as boolean
        session.user.allowedTones = token.allowedTones as string[]
        session.user.blockedPhrases = token.blockedPhrases as string[]
        session.user.messageCooldown = token.messageCooldown as number
        session.user.shadowName = token.shadowName as string
        session.user.defaultShadowMode = token.defaultShadowMode as boolean
        session.user.showShadowOnProfile = token.showShadowOnProfile as boolean
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding as boolean
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification check for now
      if (account?.provider !== "credentials") {
        const currentSession = await auth()
        
        // CONVERSION LOGIC FOR SOCIAL LOGINS
        if (currentSession?.user?.isAnonymous && currentSession?.user?.id) {
          const incomingEmail = user.email
          if (!incomingEmail) return true

          // Check if this email is already used by a fully registered account
          const existingUser = await prisma.user.findUnique({
            where: { email: incomingEmail }
          })

          if (existingUser && !existingUser.isAnonymous) {
            // Cannot merge because another account already uses this email
            // Just sign in to that existing account instead of converting guest
            return true
          }

          // Update the guest user record with OAuth data
          // This allows the adapter to find this record by email and link the account
          await prisma.user.update({
            where: { id: currentSession.user.id },
            data: {
              email: incomingEmail,
              emailVerified: new Date(),
              isAnonymous: false,
              image: user.image || undefined,
            }
          })
        }
        return true
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      })
      if (!existingUser) return false

      // Skip verification check for anonymous users
      if (existingUser?.isAnonymous) return true

      // Skip verification check for now to allow login after sign up
      // if (!existingUser?.emailVerified) return false

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await prisma.twoFactorConfirmation.findUnique({
          where: { userId: existingUser.id }
        })

        if (!twoFactorConfirmation) return false

        // Delete two factor confirmation for next sign in
        await prisma.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        })
      }

      return true
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
      const isPublicRoute = ["/", "/[username]"].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/api/user/check-username")
      const isAuthRoute = ["/login", "/signup"].includes(nextUrl.pathname)

      if (isApiAuthRoute) return true

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/feed", nextUrl))
        }
        return true
      }

      if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/login", nextUrl))
      }

      return true
    }
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    },
    async createUser({ user }) {
      // For social logins, ensure they have a username
      if (!user.username) {
        const baseUsername = user.email?.split("@")[0] || `user_${Math.random().toString(36).substring(2, 7)}`
        // Ensure uniqueness
        let finalUsername = baseUsername
        let count = 1
        while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
          finalUsername = `${baseUsername}${count++}`
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            username: finalUsername,
            shadowName: `shadow_${Math.random().toString(36).substring(2, 7)}`
          }
        })
      }
    }
  },
  pages: {
    signIn: "/login",
  },
})
