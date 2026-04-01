"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

/**
 * Promote current user to ADMIN status using a secret key
 * NOTE: James (user) can use this to gain admin status initially.
 */
export async function promoteToAdmin(secret: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const ADMIN_SECRET = process.env.ADMIN_PROMOTION_SECRET
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return { error: "Invalid protocol override secret" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ADMIN" }
  })

  return { success: "Elevation successful. Protocol updated to ADMIN." }
}
