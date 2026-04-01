import type { Prisma } from "@prisma/client"

export const commentInclude = {
  author: {
    select: {
      id: true,
      username: true,
      image: true,
      shadowName: true,
    }
  }
} satisfies Prisma.CommentInclude

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: typeof commentInclude
}>
