TruTH — Documentation
🎯 Vision Statement
TruTH: A personalized anonymous social platform where every user experiences a uniquely curated reality, fostering authentic expression through emotional connection rather than social validation.

📋 Table of Contents

Product Overview
Core Features
Technical Architecture
Database Schema
API Design
Personalization Engine
Safety & Moderation
UI/UX Design Principles
Development Roadmap
Scaling Strategy


1. Product Overview
What is TruTH?
TruTH is a psychological social network where anonymity meets personalization. Unlike traditional platforms where everyone sees the same viral content, TruTH creates a unique reality for each user based on their emotional engagement patterns.
Key Differentiators

Personalized Anonymous Feed: No two users see the same content mix
Emotional Reactions: Replace vanity metrics with meaningful connection
Shadow Identity: Build reputation while staying anonymous
Limited Visibility: Create FOMO through ephemeral exclusivity
Tone-Aware Messaging: Messages tagged by emotional intent

Target Audience

Gen Z & Millennials (16-30 years old)
People seeking authentic expression without judgment
Users tired of performative social media
Communities wanting honest, raw conversations


2. Core Features
2.1 Anonymous Inbox 💌
User Experience:
Every user gets a personalized link:
truth.app/username
truth.app/@username (alternative style)
Message Types:

📝 Text Message: Simple anonymous message
💭 Confession: Deep, vulnerable sharing
❓ Question: Ask anything anonymously
🎁 Compliment: Positive anonymous notes

Tone Detection System:
Messages are automatically/manually tagged:

🟢 Honest — Genuine, supportive
🔴 Harsh — Critical, tough love
🟡 Funny — Humorous, lighthearted
🔵 Deep — Philosophical, thought-provoking
⚪ Neutral — Informational, casual

Unique Features:

Reply Options:

Reply privately (if sender reveals identity later)
Reply publicly (converts to post)
Ignore/Delete


Message Threading: Group related anonymous messages
Save Favorites: Keep meaningful messages in a private collection
Export: Download your anonymous messages archive

Settings:

Enable/disable inbox completely
Filter by tone
Require questions only
Block certain phrases
Set cooldown period (prevent spam from same sender)


2.2 Personalized Anonymous Feed 🌍
The Core Innovation:
TruTH's feed is like a fingerprint — unique to every user. Two people could open the app at the same time and see completely different content.
Feed Composition Algorithm:
Feed Score = (Engagement Weight × 0.4) + 
             (Channel Affinity × 0.3) + 
             (Recency × 0.15) + 
             (Reaction Pattern × 0.15)
Tracked Signals:

View Duration: How long you stayed on a post
Scroll Velocity: Did you pause or keep scrolling?
Reaction Type: Which emotions you express
Channel Subscription: Your selected "truth zones"
Time of Day: When you're most active
Post Completion: Did you read till the end?
Return Visits: Did you come back to a post?

Feed Types:

For You: Personalized main feed
Fresh: Latest posts from your channels
Trending: What's resonating in your communities
Deep Dive: Long-form, thought-provoking content
Quick Hits: Short, snackable truths

Post Display:

Infinite scroll
Card-based design
No author information (fully anonymous)
Optional shadow identity badge
Channel tag
Post age (relative time)
Reaction counts (aggregated)


2.3 Channels (Truth Zones) 🧩
Default Channels:

💔 Heartbreak — Love, loss, relationships
🧠 Mind Maze — Mental health, anxiety, growth
🎓 Campus Confessions — Student life, academic struggles
💸 Money Talks — Financial stress, career, ambitions
🔥 Raw Secrets — Things you can't tell anyone
😂 Light Chaos — Funny stories, awkward moments
🌙 Late Night Thoughts — 3 AM philosophical dumps
👨‍👩‍👧‍👦 Family Dynamics — Parent issues, sibling drama
💼 Work Vents — Job frustrations, office politics
🎭 Plot Twist — Life's unexpected turns

Channel Features:

Subscribe/unsubscribe anytime
See channel-specific trending posts
Post directly to a channel
Suggested channels based on engagement
Community channel creation (Phase 3)

Channel Moderation:

Each channel has AI-tuned filters
Community reporting
Moderator-reviewed flagged content


2.4 Posts 📝
Post Types:

Standard Post

Up to 2000 characters
Visible to everyone in channel/feed
Permanent (unless deleted by creator)


Limited Visibility Post (⚡ Exclusive Feature)

Seen by only X random users (20-500)
Disappears after view limit reached
Creates urgency and FOMO
Users notified: "You're one of 50 people seeing this"


Story Post (Phase 2)

24-hour expiration
Short-form content
Higher visibility in feed


Thread Post (Phase 2)

Multi-part storytelling
Linked anonymous posts
Build narrative over time



Post Creation Flow:

Write content
Select channel (optional)
Choose visibility:

Public (everyone)
Limited (set view count)
Followers only (if shadow identity enabled)


Add shadow identity or stay fully anonymous
Optional: Set expiration time
Post

Post Interactions:

React (don't "like")
Comment anonymously
Share to your followers (if shadow identity)
Report
Save privately
Copy link (public posts only)


2.5 Reaction System ❤️
Why Not Likes?
Traditional likes create:

Vanity metrics
Comparison anxiety
Performative behavior

TruTH Reactions:
Instead, users choose emotional responses:

🫂 I Relate — "Me too"
🌊 That's Deep — Profound, meaningful
💙 You're Not Alone — Supportive, comforting
🤯 This Is Wild — Shocking, unbelievable
🔥 Real Talk — Authentic, raw truth
🙏 Thank You — Grateful for sharing
😢 That Hurts — Empathetic sadness
💪 Stay Strong — Encouraging

Reaction Analytics (Private):
Users can see:

Total reactions received
Reaction type breakdown
Which posts resonated most
Emotional patterns over time

No Public Reaction Counts:

To reduce validation-seeking
Focus on personal connection
Only poster sees detailed breakdown


2.6 Shadow Identity 🎭
Concept:
A persistent anonymous persona that builds reputation while maintaining anonymity.
How It Works:

User creates shadow name (e.g., "LostSoul27", "QuietThunder")
Shadow identity follows them across posts
Others can follow your shadow identity
Build trust and narrative continuity
Still completely anonymous

Shadow Identity Features:

Unique username
Optional bio (anonymous)
Follower count (private option)
Post history
Reaction patterns
"Verified shadow" badge (active for 30+ days)

Privacy Controls:

Enable/disable shadow identity anytime
Post with or without shadow identity
Hide shadow identity from specific posts
Delete shadow identity (restart fresh)

Benefits:

Storytelling continuity
Build anonymous community
Establish trust without revealing identity
Create meaningful connections


2.7 Limited Visibility Posts ⚡
The Hook:
Imagine seeing a post with:

"You're 1 of 50 people who will ever see this"

Psychology:

Scarcity: Limited availability drives engagement
Exclusivity: Feel special, chosen
Urgency: Read now or miss forever
Anti-FOMO: Creates FOMO for future content

Implementation:
typescriptinterface LimitedPost {
  id: string
  content: string
  maxViews: number // 20, 50, 100, 500
  currentViews: number
  viewedBy: string[] // track who's seen it
  expiresAfterViews: boolean
}
User Experience:

Creator sets view limit (20/50/100/500)
Random users from feed see it
Counter shows remaining views
Post disappears when limit reached
No way to access again

Notification:
🔥 New Limited Post
"Someone just shared something only 100 people will see.
You're one of them."

2.8 Comments & Conversations 💬
Anonymous Comments:

Reply to any post anonymously
Threaded conversations
Comment reactions
Nested up to 3 levels

Comment Features:

Sort by: Recent, Top Reactions, Controversial
Collapse threads
Report/block
OP indicator (original poster)


3. Technical Architecture
3.1 Tech Stack
Framework: Next.js 14+ (App Router)

Why Next.js?

Full-stack React framework
Built-in API routes (serverless functions)
Server-side rendering (SEO for public profiles)
Edge runtime support (fast global delivery)
File-based routing
Server components for optimization



Frontend:

React 18+: UI components
TypeScript: Type safety
TailwindCSS: Utility-first styling
Zustand: Lightweight state management
React Query: Server state management
Framer Motion: Smooth animations
Radix UI: Accessible component primitives

Backend (Next.js API Routes):

Next.js Route Handlers: RESTful API endpoints
Server Actions: Direct server mutations
Middleware: Authentication, rate limiting
Edge Functions: Global low-latency APIs

Database:

PostgreSQL: Primary relational database
Prisma ORM: Type-safe database client
Redis: Caching, session management, rate limiting

Authentication:

NextAuth.js: Flexible auth solution
JWT: Secure token-based auth
OAuth: Optional social login
Anonymous Sessions: Cookieless guest access

File Storage:

Vercel Blob: Media uploads (images, voice)
Cloudinary: Image optimization (alternative)

AI/ML:

OpenAI API: Toxicity detection, tone analysis
Hugging Face: Sentiment analysis
Custom Models: Feed ranking algorithm

Monitoring & Analytics:

Vercel Analytics: Performance tracking
Sentry: Error monitoring
PostHog: Product analytics (privacy-focused)
Custom Events: User behavior tracking

Deployment:

Vercel: Hosting, CI/CD, edge functions
Neon/Supabase: Managed PostgreSQL
Upstash: Serverless Redis