// components/feed/PostCard.tsx

export function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-truth-surface border border-truth-border rounded-lg p-6 hover:border-truth-accent/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {post.useShadowId && post.author.shadowName && (
            <span className="text-sm text-truth-accent font-medium">
              {post.author.shadowName}
              {post.author.shadowVerified && (
                <span className="ml-1 text-xs">✓</span>
              )}
            </span>
          )}
          {post.channel && (
            <span className="text-xs text-truth-muted px-2 py-1 bg-truth-bg rounded">
              {post.channel.name}
            </span>
          )}
        </div>
        
        <span className="text-xs text-truth-muted">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Content */}
      <p className="text-truth-text text-base leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Limited Post Badge */}
      {post.visibilityType === 'LIMITED' && (
        <div className="mb-4 px-3 py-2 bg-truth-accent/10 border border-truth-accent/30 rounded text-xs text-truth-accent">
          ⚡ You&apos;re one of {post.viewsLimit} people seeing this
        </div>
      )}

      {/* Reactions - To be implemented in Phase 4 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/*
        {Object.entries(REACTIONS).map(([key, reaction]) => (
          <ReactionButton
            key={key}
            reaction={reaction}
            postId={post.id}
            active={post.userReaction === key}
            count={post.reactionCounts[key] || 0}
          />
        ))}
        */}
      </div>
    </div>
  )
}