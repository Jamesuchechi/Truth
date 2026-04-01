import { auth } from "@/auth"
import { redirect } from "next/navigation"

/**
 * Server Component / Action helper to verify admin status
 * Redirects to home if not admin or not logged in.
 */
export async function requireAdmin() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/")
  }
  
  return session.user
}

/**
 * Basic role checking utility
 */
export async function currentUserRole() {
  const session = await auth()
  return session?.user?.role || "USER"
}

export async function isAdmin() {
  const role = await currentUserRole()
  return role === "ADMIN"
}
