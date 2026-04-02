// lib/actions/teamActions.ts
"use server"

import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { TeamRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * Register a new Shadow Team (Collective Identity).
 */
export async function createShadowTeam(data: { name: string, bio?: string, image?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

  const team = await prisma.shadowTeam.create({
    data: {
      name: data.name,
      slug,
      bio: data.bio,
      image: data.image,
      members: {
        create: {
          userId: session.user.id,
          role: TeamRole.OWNER
        }
      }
    }
  })

  revalidatePath("/shadow-teams")
  return team
}

/**
 * Join or add a member to a shadow team.
 */
export async function addTeamMember(teamId: string, userId: string, role: TeamRole = TeamRole.MEMBER) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify requesting user is owner/admin
    const requester = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: session.user.id } }
    })

    if (!requester || (requester.role !== TeamRole.OWNER && requester.role !== TeamRole.ADMIN)) {
        throw new Error("Insufficient permissions to invite to team.")
    }

    return await prisma.teamMember.create({
        data: {
            teamId,
            userId,
            role
        }
    })
}

/**
 * Fetch all teams the current user is a part of.
 */
export async function getMyShadowTeams() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.shadowTeam.findMany({
        where: {
            members: {
                some: { userId: session.user.id }
            }
        },
        include: {
            _count: {
                select: { members: true, posts: true }
            }
        }
    })
}

/**
 * Create a post authored by a team.
 */
export async function postAsTeam(teamId: string, content: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify membership
    const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: session.user.id } }
    })

    if (!member) throw new Error("Not a member of this collective.")

    const post = await prisma.post.create({
        data: {
            content,
            authoredByTeamId: teamId,
            authorId: session.user.id, // Still track the original creator for audit
            useShadowId: true // Team posts are always shadow-tier
        }
    })

    revalidatePath("/feed")
    return post
}
