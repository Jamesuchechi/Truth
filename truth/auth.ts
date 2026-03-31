import NextAuth from "next-auth"
import "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import { z } from "zod"
import type { DefaultSession, User } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"

declare module "next-auth" {
  interface User {
    username?: string | null
    isVerified?: boolean
    isTwoFactorEnabled?: boolean
  }
  interface Session {
    user: {
      id: string
      username?: string | null
      isVerified?: boolean
      isTwoFactorEnabled?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string | null
    isVerified?: boolean
    isTwoFactorEnabled?: boolean
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({ where: { email } })
          
          if (!user || !user.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (passwordsMatch) {
            // Check for email verification
            if (!user.emailVerified) return null
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
        const u = user as User
        token.id = u.id
        token.username = u.username
        token.isVerified = !!(user as AdapterUser).emailVerified
        token.isTwoFactorEnabled = !!u.isTwoFactorEnabled
      }
      if (trigger === "update" && session) {
        token.username = session.username
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.isVerified = token.isVerified as boolean
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification check for now
      if (account?.provider !== "credentials") return true

      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      })

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false

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
  pages: {
    signIn: "/login",
  },
})
