import type { Prisma } from "@prisma/client"

export const postInclude = {
  author: {
    select: {
      id: true,
      username: true,
      image: true,
      shadowName: true,
      shadowVerified: true,
      isAnonymous: true,
      reputationScore: true,
      reputationTier: true,
      endorsements: true,
    }
  },
  channel: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
    }
  },
  media: {
    orderBy: {
      order: 'asc' as Prisma.SortOrder
    }
  },
  _count: {
    select: {
      reactions: true,
      comments: true,
      replies: true,
    }
  },
  feedTracking: true,
  reactions: {
    select: {
      type: true,
      createdAt: true,
    }
  }
} satisfies Prisma.PostInclude

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude
}> & { parentId?: string | null }
