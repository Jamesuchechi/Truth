import type { Prisma } from "@prisma/client"

export const suggestedShadowSelect = {
  id: true,
  username: true,
  shadowName: true,
  shadowBio: true,
  shadowVerified: true,
  reputationTier: true,
  _count: {
    select: {
      followers: true
    }
  }
} satisfies Prisma.UserSelect

export type SuggestedShadow = Prisma.UserGetPayload<{
  select: typeof suggestedShadowSelect
}>

export const followUserSelect = {
  id: true,
  username: true,
  shadowName: true,
  image: true,
  reputationTier: true
} satisfies Prisma.UserSelect

export type FollowUser = Prisma.UserGetPayload<{
  select: typeof followUserSelect
}>
