import type { ReputationTier, ReactionType } from "@prisma/client"

export const REPUTATION_THRESHOLDS: Record<ReputationTier, number> = {
  VOID: -1,
  DRIFTER: 0,
  SPECTRE: 500,
  ORACLE: 2000,
  GUARDIAN: 5000,
  ARCHITECT: 15000
}

export const REPUTATION_WEIGHTS = {
  POST_CREATED: 10,
  COMMENT_CREATED: 5,
  REACTION_BASE: 2,
  REACTION_BOOSTED: 3, // For "Deep", "Real Talk", etc.
  ENDORSEMENT: 50,
  ACTIONED_REPORT: -100,
  DISMISSED_REPORT_PENALTY: -20, // For reporter if false report
}

export function getTierForScore(score: number): ReputationTier {
  if (score < 0) return "VOID"
  if (score >= REPUTATION_THRESHOLDS.ARCHITECT) return "ARCHITECT"
  if (score >= REPUTATION_THRESHOLDS.GUARDIAN) return "GUARDIAN"
  if (score >= REPUTATION_THRESHOLDS.ORACLE) return "ORACLE"
  if (score >= REPUTATION_THRESHOLDS.SPECTRE) return "SPECTRE"
  return "DRIFTER"
}

export function calculateReputationScore(stats: {
  posts: number
  comments: number
  reactionsReceived: { type: ReactionType }[]
  endorsements: number
  actionedReports: number
  accountAgeWeeks: number
}): number {
  let score = 0
  
  // Base Activity
  score += stats.posts * REPUTATION_WEIGHTS.POST_CREATED
  score += stats.comments * REPUTATION_WEIGHTS.COMMENT_CREATED
  
  // Engagement Quality
  stats.reactionsReceived.forEach(reaction => {
    if (reaction.type === "DEEP" || reaction.type === "REAL_TALK") {
      score += REPUTATION_WEIGHTS.REACTION_BOOSTED
    } else {
      score += REPUTATION_WEIGHTS.REACTION_BASE
    }
  })
  
  // Community Trust
  score += stats.endorsements * REPUTATION_WEIGHTS.ENDORSEMENT
  
  // Penalties
  score += stats.actionedReports * REPUTATION_WEIGHTS.ACTIONED_REPORT
  
  // Time Decay (2% per week of inactivity - simplified here as a baseline multiplier)
  // For a more robust decay, we'd need 'lastActiveAt'
  const decayFactor = Math.pow(0.98, stats.accountAgeWeeks)
  score = Math.floor(score * decayFactor)
  
  return score
}
