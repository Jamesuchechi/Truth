import type { Prisma } from "@prisma/client"

export const commentInclude = {
  author: {
    select: {
      id: true,
      username: true,
      image: true,
      shadowName: true,
      isAnonymous: true,
      shadowVerified: true,
      reputationScore: true,
      reputationTier: true,
      endorsements: true,
    }
  },
  reactions: {
    select: {
      type: true,
      userId: true,
    }
  },
  _count: {
    select: {
      reactions: true,
    }
  }
} satisfies Prisma.CommentInclude

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: typeof commentInclude
}>
