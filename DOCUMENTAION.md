# TruTH — Enhanced Product Documentation

## 🎯 Vision Statement
**TruTH**: A personalized anonymous social platform where every user experiences a uniquely curated reality, fostering authentic expression through emotional connection rather than social validation.

---

## 📋 Table of Contents
1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Personalization Engine](#personalization-engine)
7. [Safety & Moderation](#safety--moderation)
8. [UI/UX Design Principles](#uiux-design-principles)
9. [Development Roadmap](#development-roadmap)
10. [Scaling Strategy](#scaling-strategy)

---

## 1. Product Overview

### What is TruTH?
TruTH is a psychological social network where anonymity meets personalization. Unlike traditional platforms where everyone sees the same viral content, TruTH creates a unique reality for each user based on their emotional engagement patterns.

### Key Differentiators
- **Personalized Anonymous Feed**: No two users see the same content mix
- **Emotional Reactions**: Replace vanity metrics with meaningful connection
- **Shadow Identity**: Build reputation while staying anonymous
- **Limited Visibility**: Create FOMO through ephemeral exclusivity
- **Tone-Aware Messaging**: Messages tagged by emotional intent

### Target Audience
- Gen Z & Millennials (16-30 years old)
- People seeking authentic expression without judgment
- Users tired of performative social media
- Communities wanting honest, raw conversations

---

## 2. Core Features

### 2.1 Anonymous Inbox 💌

**User Experience:**
Every user gets a personalized link:
```
truth.app/username
truth.app/@username (alternative style)
```

**Message Types:**
- 📝 **Text Message**: Simple anonymous message
- 💭 **Confession**: Deep, vulnerable sharing
- ❓ **Question**: Ask anything anonymously
- 🎁 **Compliment**: Positive anonymous notes

**Tone Detection System:**
Messages are automatically/manually tagged:
- 🟢 **Honest** — Genuine, supportive
- 🔴 **Harsh** — Critical, tough love
- 🟡 **Funny** — Humorous, lighthearted
- 🔵 **Deep** — Philosophical, thought-provoking
- ⚪ **Neutral** — Informational, casual

**Unique Features:**
- **Reply Options:**
  - Reply privately (if sender reveals identity later)
  - Reply publicly (converts to post)
  - Ignore/Delete
- **Message Threading**: Group related anonymous messages
- **Save Favorites**: Keep meaningful messages in a private collection
- **Export**: Download your anonymous messages archive

**Settings:**
- Enable/disable inbox completely
- Filter by tone
- Require questions only
- Block certain phrases
- Set cooldown period (prevent spam from same sender)

---

### 2.2 Personalized Anonymous Feed 🌍

**The Core Innovation:**
TruTH's feed is like a fingerprint — unique to every user. Two people could open the app at the same time and see completely different content.

**Feed Composition Algorithm:**

```
Feed Score = (Engagement Weight × 0.4) + 
             (Channel Affinity × 0.3) + 
             (Recency × 0.15) + 
             (Reaction Pattern × 0.15)
```

**Tracked Signals:**
1. **View Duration**: How long you stayed on a post
2. **Scroll Velocity**: Did you pause or keep scrolling?
3. **Reaction Type**: Which emotions you express
4. **Channel Subscription**: Your selected "truth zones"
5. **Time of Day**: When you're most active
6. **Post Completion**: Did you read till the end?
7. **Return Visits**: Did you come back to a post?

**Feed Types:**
- **For You**: Personalized main feed
- **Fresh**: Latest posts from your channels
- **Trending**: What's resonating in your communities
- **Deep Dive**: Long-form, thought-provoking content
- **Quick Hits**: Short, snackable truths

**Post Display:**
- Infinite scroll
- Card-based design
- No author information (fully anonymous)
- Optional shadow identity badge
- Channel tag
- Post age (relative time)
- Reaction counts (aggregated)

---

### 2.3 Channels (Truth Zones) 🧩

**Default Channels:**
1. 💔 **Heartbreak** — Love, loss, relationships
2. 🧠 **Mind Maze** — Mental health, anxiety, growth
3. 🎓 **Campus Confessions** — Student life, academic struggles
4. 💸 **Money Talks** — Financial stress, career, ambitions
5. 🔥 **Raw Secrets** — Things you can't tell anyone
6. 😂 **Light Chaos** — Funny stories, awkward moments
7. 🌙 **Late Night Thoughts** — 3 AM philosophical dumps
8. 👨‍👩‍👧‍👦 **Family Dynamics** — Parent issues, sibling drama
9. 💼 **Work Vents** — Job frustrations, office politics
10. 🎭 **Plot Twist** — Life's unexpected turns

**Channel Features:**
- Subscribe/unsubscribe anytime
- See channel-specific trending posts
- Post directly to a channel
- Suggested channels based on engagement
- Community channel creation (Phase 3)

**Channel Moderation:**
- Each channel has AI-tuned filters
- Community reporting
- Moderator-reviewed flagged content

---

### 2.4 Posts 📝

**Post Types:**

1. **Standard Post**
   - Up to 2000 characters
   - Visible to everyone in channel/feed
   - Permanent (unless deleted by creator)

2. **Limited Visibility Post** (⚡ Exclusive Feature)
   - Seen by only X random users (20-500)
   - Disappears after view limit reached
   - Creates urgency and FOMO
   - Users notified: "You're one of 50 people seeing this"

3. **Story Post** (Phase 2)
   - 24-hour expiration
   - Short-form content
   - Higher visibility in feed

4. **Thread Post** (Phase 2)
   - Multi-part storytelling
   - Linked anonymous posts
   - Build narrative over time

**Post Creation Flow:**
1. Write content
2. Select channel (optional)
3. Choose visibility:
   - Public (everyone)
   - Limited (set view count)
   - Followers only (if shadow identity enabled)
4. Add shadow identity or stay fully anonymous
5. Optional: Set expiration time
6. Post

**Post Interactions:**
- React (don't "like")
- Comment anonymously
- Share to your followers (if shadow identity)
- Report
- Save privately
- Copy link (public posts only)

---

### 2.5 Reaction System ❤️

**Why Not Likes?**
Traditional likes create:
- Vanity metrics
- Comparison anxiety
- Performative behavior

**TruTH Reactions:**
Instead, users choose emotional responses:

1. 🫂 **I Relate** — "Me too"
2. 🌊 **That's Deep** — Profound, meaningful
3. 💙 **You're Not Alone** — Supportive, comforting
4. 🤯 **This Is Wild** — Shocking, unbelievable
5. 🔥 **Real Talk** — Authentic, raw truth
6. 🙏 **Thank You** — Grateful for sharing
7. 😢 **That Hurts** — Empathetic sadness
8. 💪 **Stay Strong** — Encouraging

**Reaction Analytics (Private):**
Users can see:
- Total reactions received
- Reaction type breakdown
- Which posts resonated most
- Emotional patterns over time

**No Public Reaction Counts:**
- To reduce validation-seeking
- Focus on personal connection
- Only poster sees detailed breakdown

---

### 2.6 Shadow Identity 🎭

**Concept:**
A persistent anonymous persona that builds reputation while maintaining anonymity.

**How It Works:**
1. User creates shadow name (e.g., "LostSoul27", "QuietThunder")
2. Shadow identity follows them across posts
3. Others can follow your shadow identity
4. Build trust and narrative continuity
5. Still completely anonymous

**Shadow Identity Features:**
- Unique username
- Optional bio (anonymous)
- Follower count (private option)
- Post history
- Reaction patterns
- "Verified shadow" badge (active for 30+ days)

**Privacy Controls:**
- Enable/disable shadow identity anytime
- Post with or without shadow identity
- Hide shadow identity from specific posts
- Delete shadow identity (restart fresh)

**Benefits:**
- Storytelling continuity
- Build anonymous community
- Establish trust without revealing identity
- Create meaningful connections

---

### 2.7 Limited Visibility Posts ⚡

**The Hook:**
Imagine seeing a post with:
> "You're 1 of 50 people who will ever see this"

**Psychology:**
- **Scarcity**: Limited availability drives engagement
- **Exclusivity**: Feel special, chosen
- **Urgency**: Read now or miss forever
- **Anti-FOMO**: Creates FOMO for future content

**Implementation:**

```typescript
interface LimitedPost {
  id: string
  content: string
  maxViews: number // 20, 50, 100, 500
  currentViews: number
  viewedBy: string[] // track who's seen it
  expiresAfterViews: boolean
}
```

**User Experience:**
- Creator sets view limit (20/50/100/500)
- Random users from feed see it
- Counter shows remaining views
- Post disappears when limit reached
- No way to access again

**Notification:**
```
🔥 New Limited Post
"Someone just shared something only 100 people will see.
You're one of them."
```

---

### 2.8 Comments & Conversations 💬

**Anonymous Comments:**
- Reply to any post anonymously
- Threaded conversations
- Comment reactions
- Nested up to 3 levels

**Comment Features:**
- Sort by: Recent, Top Reactions, Controversial
- Collapse threads
- Report/block
- OP indicator (original poster)

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Framework:** Next.js 14+ (App Router)
- **Why Next.js?**
  - Full-stack React framework
  - Built-in API routes (serverless functions)
  - Server-side rendering (SEO for public profiles)
  - Edge runtime support (fast global delivery)
  - File-based routing
  - Server components for optimization

**Frontend:**
- **React 18+**: UI components
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **React Query**: Server state management
- **Framer Motion**: Smooth animations
- **Radix UI**: Accessible component primitives

**Backend (Next.js API Routes):**
- **Next.js Route Handlers**: RESTful API endpoints
- **Server Actions**: Direct server mutations
- **Middleware**: Authentication, rate limiting
- **Edge Functions**: Global low-latency APIs

**Database:**
- **PostgreSQL**: Primary relational database
- **Prisma ORM**: Type-safe database client
- **Redis**: Caching, session management, rate limiting

**Authentication:**
- **NextAuth.js**: Flexible auth solution
- **JWT**: Secure token-based auth
- **OAuth**: Optional social login
- **Anonymous Sessions**: Cookieless guest access

**File Storage:**
- **Vercel Blob**: Media uploads (images, voice)
- **Cloudinary**: Image optimization (alternative)

**AI/ML:**
- **OpenAI API**: Toxicity detection, tone analysis
- **Hugging Face**: Sentiment analysis
- **Custom Models**: Feed ranking algorithm

**Monitoring & Analytics:**
- **Vercel Analytics**: Performance tracking
- **Sentry**: Error monitoring
- **PostHog**: Product analytics (privacy-focused)
- **Custom Events**: User behavior tracking

**Deployment:**
- **Vercel**: Hosting, CI/CD, edge functions
- **Neon/Supabase**: Managed PostgreSQL
- **Upstash**: Serverless Redis

---

### 3.2 Project Structure

```
truth/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (main)/                   # Main app routes
│   │   ├── feed/
│   │   ├── inbox/
│   │   ├── post/
│   │   ├── channels/
│   │   └── layout.tsx
│   ├── [username]/               # Public profile
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   ├── posts/
│   │   ├── messages/
│   │   ├── reactions/
│   │   ├── feed/
│   │   └── auth/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── feed/                     # Feed-specific components
│   ├── inbox/                    # Inbox components
│   ├── post/                     # Post components
│   └── shared/                   # Shared components
├── lib/
│   ├── db/                       # Database utilities
│   │   └── prisma.ts
│   ├── ai/                       # AI/ML utilities
│   │   ├── toxicity.ts
│   │   └── tone-detection.ts
│   ├── feed/                     # Feed algorithm
│   │   └── ranking.ts
│   ├── auth/                     # Auth utilities
│   └── utils/                    # Helper functions
├── store/                        # Zustand stores
│   ├── user-store.ts
│   ├── feed-store.ts
│   └── inbox-store.ts
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/
├── public/
├── types/                        # TypeScript types
├── hooks/                        # Custom React hooks
└── middleware.ts                 # Next.js middleware
```

---

## 4. Database Schema

### 4.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER MODELS ====================

model User {
  id                String    @id @default(cuid())
  email             String?   @unique
  username          String    @unique
  passwordHash      String?
  
  // Anonymous Identity
  isAnonymous       Boolean   @default(false)
  anonymousId       String?   @unique
  
  // Shadow Identity
  shadowName        String?   @unique
  shadowBio         String?
  shadowCreatedAt   DateTime?
  shadowVerified    Boolean   @default(false)
  
  // Profile
  joinedAt          DateTime  @default(now())
  lastActive        DateTime  @default(now())
  
  // Settings
  inboxEnabled      Boolean   @default(true)
  allowAnonymousMsg Boolean   @default(true)
  
  // Relations
  posts             Post[]
  receivedMessages  Message[] @relation("MessageReceiver")
  reactions         Reaction[]
  comments          Comment[]
  feedTracking      FeedTracking[]
  channelSubs       ChannelSubscription[]
  savedPosts        SavedPost[]
  followers         Follow[]  @relation("Following")
  following         Follow[]  @relation("Follower")
  blocks            Block[]   @relation("Blocker")
  blocked           Block[]   @relation("Blocked")
  reports           Report[]
  
  @@index([username])
  @@index([shadowName])
  @@index([anonymousId])
}

// Shadow identity followers
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  follower    User     @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  following   User     @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Block {
  id        String   @id @default(cuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())
  
  blocker   User     @relation("Blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked   User     @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
}

// ==================== CONTENT MODELS ====================

model Post {
  id              String    @id @default(cuid())
  content         String
  authorId        String
  
  // Shadow Identity
  useShadowId     Boolean   @default(false)
  
  // Channel
  channelId       String?
  
  // Visibility
  visibilityType  VisibilityType @default(PUBLIC)
  viewsLimit      Int?
  currentViews    Int       @default(0)
  expiresAt       DateTime?
  
  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
  
  // Engagement
  reactionCount   Int       @default(0)
  commentCount    Int       @default(0)
  
  // Relations
  author          User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  channel         Channel?  @relation(fields: [channelId], references: [id])
  reactions       Reaction[]
  comments        Comment[]
  feedTracking    FeedTracking[]
  savedBy         SavedPost[]
  reports         Report[]
  
  @@index([authorId])
  @@index([channelId])
  @@index([createdAt])
  @@index([visibilityType])
}

enum VisibilityType {
  PUBLIC
  LIMITED
  FOLLOWERS_ONLY
  STORY // 24hr expiration
}

model Comment {
  id          String   @id @default(cuid())
  content     String
  postId      String
  authorId    String
  parentId    String?  // For nested comments
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  // Relations
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parent      Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies     Comment[] @relation("CommentReplies")
  
  @@index([postId])
  @@index([authorId])
  @@index([parentId])
}

model Channel {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  color       String?
  
  isDefault   Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  
  // Relations
  posts       Post[]
  subscribers ChannelSubscription[]
  
  @@index([slug])
}

model ChannelSubscription {
  id        String   @id @default(cuid())
  userId    String
  channelId String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  
  @@unique([userId, channelId])
  @@index([userId])
  @@index([channelId])
}

// ==================== MESSAGING ====================

model Message {
  id          String      @id @default(cuid())
  receiverId  String
  content     String
  
  // Message Type
  type        MessageType @default(TEXT)
  
  // Tone Detection
  tone        ToneType?
  
  // Sender info (optional, can be revealed later)
  senderEmail String?
  senderName  String?
  
  createdAt   DateTime    @default(now())
  readAt      DateTime?
  
  // Public reply
  repliedWithPostId String?
  
  // Relations
  receiver    User        @relation("MessageReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  @@index([receiverId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  CONFESSION
  QUESTION
  COMPLIMENT
}

enum ToneType {
  HONEST
  HARSH
  FUNNY
  DEEP
  NEUTRAL
}

// ==================== REACTIONS ====================

model Reaction {
  id          String       @id @default(cuid())
  postId      String
  userId      String
  type        ReactionType
  
  createdAt   DateTime     @default(now())
  
  post        Post         @relation(fields: [postId], references: [id], onDelete: Cascade)
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([postId, userId]) // One reaction per user per post
  @@index([postId])
  @@index([userId])
}

enum ReactionType {
  RELATE
  DEEP
  NOT_ALONE
  WILD
  REAL_TALK
  THANK_YOU
  THAT_HURTS
  STAY_STRONG
}

// ==================== FEED PERSONALIZATION ====================

model FeedTracking {
  id              String   @id @default(cuid())
  userId          String
  postId          String
  
  // Engagement metrics
  viewed          Boolean  @default(false)
  viewDuration    Int?     // milliseconds
  scrolledPast    Boolean  @default(false)
  clickedPost     Boolean  @default(false)
  readComplete    Boolean  @default(false)
  
  // Interaction
  reacted         Boolean  @default(false)
  commented       Boolean  @default(false)
  saved           Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
}

model SavedPost {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@index([userId])
}

// ==================== MODERATION ====================

model Report {
  id          String       @id @default(cuid())
  reporterId  String
  postId      String?
  reason      ReportReason
  description String?
  
  status      ReportStatus @default(PENDING)
  reviewedAt  DateTime?
  
  createdAt   DateTime     @default(now())
  
  reporter    User         @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  post        Post?        @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([reporterId])
  @@index([postId])
  @@index([status])
}

enum ReportReason {
  HARASSMENT
  HATE_SPEECH
  VIOLENCE
  SPAM
  INAPPROPRIATE
  SELF_HARM
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}

// ==================== ANALYTICS ====================

model UserActivity {
  id              String   @id @default(cuid())
  userId          String
  
  // Daily stats
  postsCreated    Int      @default(0)
  messagesSent    Int      @default(0)
  reactionsGiven  Int      @default(0)
  timeSpent       Int      @default(0) // minutes
  
  date            DateTime @default(now())
  
  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}
```

---

## 5. API Design

### 5.1 API Routes Structure

```typescript
// app/api/auth/[...nextauth]/route.ts
// Authentication endpoints

// app/api/posts/route.ts
GET    /api/posts           // Get personalized feed
POST   /api/posts           // Create post

// app/api/posts/[id]/route.ts
GET    /api/posts/:id       // Get single post
PUT    /api/posts/:id       // Update post
DELETE /api/posts/:id       // Delete post

// app/api/posts/[id]/reactions/route.ts
POST   /api/posts/:id/reactions     // Add reaction
DELETE /api/posts/:id/reactions     // Remove reaction

// app/api/posts/[id]/comments/route.ts
GET    /api/posts/:id/comments      // Get comments
POST   /api/posts/:id/comments      // Add comment

// app/api/messages/route.ts
GET    /api/messages        // Get inbox messages
POST   /api/messages        // Send message

// app/api/feed/route.ts
GET    /api/feed            // Get personalized feed
GET    /api/feed/fresh      // Get latest posts
GET    /api/feed/trending   // Get trending posts

// app/api/channels/route.ts
GET    /api/channels        // Get all channels
POST   /api/channels        // Subscribe to channel

// app/api/channels/[id]/route.ts
GET    /api/channels/:id    // Get channel posts
DELETE /api/channels/:id    // Unsubscribe

// app/api/users/[username]/route.ts
GET    /api/users/:username // Get public profile

// app/api/shadow/route.ts
POST   /api/shadow          // Create shadow identity
PUT    /api/shadow          // Update shadow identity
DELETE /api/shadow          // Delete shadow identity
```

### 5.2 Example API Implementation

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/prisma'
import { authOptions } from '@/lib/auth/options'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = parseInt(searchParams.get('limit') || '20')

  // Get personalized feed using ranking algorithm
  const posts = await getPersonalizedFeed(session.user.id, cursor, limit)

  return NextResponse.json({
    posts,
    nextCursor: posts.length === limit ? posts[posts.length - 1].id : null
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content, channelId, visibilityType, viewsLimit, useShadowId } = body

  // Validate content
  if (!content || content.length > 2000) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  // Check for toxicity
  const isToxic = await checkToxicity(content)
  if (isToxic) {
    return NextResponse.json({ error: 'Content violates guidelines' }, { status: 400 })
  }

  // Create post
  const post = await prisma.post.create({
    data: {
      content,
      authorId: session.user.id,
      channelId,
      visibilityType: visibilityType || 'PUBLIC',
      viewsLimit: visibilityType === 'LIMITED' ? viewsLimit : null,
      useShadowId: useShadowId || false
    },
    include: {
      author: {
        select: {
          shadowName: true,
          shadowVerified: true
        }
      },
      channel: true
    }
  })

  return NextResponse.json({ post }, { status: 201 })
}
```

---

## 6. Personalization Engine

### 6.1 Feed Ranking Algorithm

```typescript
// lib/feed/ranking.ts

interface FeedSignals {
  userId: string
  postId: string
  viewDuration?: number
  reacted: boolean
  commented: boolean
  saved: boolean
  channelAffinity: number
  recency: number
  creatorReputation: number
}

export async function calculateFeedScore(signals: FeedSignals): Promise<number> {
  // Engagement Weight (0-1)
  const engagementScore = calculateEngagementScore({
    viewDuration: signals.viewDuration,
    reacted: signals.reacted,
    commented: signals.commented,
    saved: signals.saved
  })

  // Channel Affinity (0-1)
  const channelScore = signals.channelAffinity

  // Recency Score (0-1)
  const recencyScore = signals.recency

  // Creator Reputation (0-1)
  const creatorScore = signals.creatorReputation

  // Weighted combination
  const feedScore = 
    (engagementScore * 0.4) +
    (channelScore * 0.3) +
    (recencyScore * 0.15) +
    (creatorScore * 0.15)

  return feedScore
}

function calculateEngagementScore(engagement: {
  viewDuration?: number
  reacted: boolean
  commented: boolean
  saved: boolean
}): number {
  let score = 0

  // View duration (max 60 seconds = 1.0)
  if (engagement.viewDuration) {
    score += Math.min(engagement.viewDuration / 60000, 1) * 0.3
  }

  // Reactions
  if (engagement.reacted) score += 0.3

  // Comments (highest signal)
  if (engagement.commented) score += 0.4

  // Saved
  if (engagement.saved) score += 0.2

  return Math.min(score, 1)
}

export async function getPersonalizedFeed(
  userId: string,
  cursor: string | null,
  limit: number
) {
  // Get user's channel subscriptions
  const userChannels = await prisma.channelSubscription.findMany({
    where: { userId },
    select: { channelId: true }
  })

  const channelIds = userChannels.map(c => c.channelId)

  // Get user's engagement history
  const engagementHistory = await prisma.feedTracking.findMany({
    where: { userId },
    select: {
      postId: true,
      viewDuration: true,
      reacted: true,
      commented: true,
      saved: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Last 100 interactions
  })

  // Calculate channel affinity scores
  const channelAffinity = await calculateChannelAffinity(userId, channelIds)

  // Fetch candidate posts
  const posts = await prisma.post.findMany({
    where: {
      channelId: { in: channelIds },
      deletedAt: null,
      OR: [
        { visibilityType: 'PUBLIC' },
        { 
          visibilityType: 'LIMITED',
          currentViews: { lt: prisma.raw('views_limit') }
        }
      ]
    },
    include: {
      author: {
        select: {
          shadowName: true,
          shadowVerified: true
        }
      },
      channel: true,
      reactions: {
        where: { userId },
        select: { type: true }
      },
      _count: {
        select: {
          reactions: true,
          comments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3, // Get more posts to rank
    ...(cursor && { cursor: { id: cursor }, skip: 1 })
  })

  // Rank posts
  const rankedPosts = await Promise.all(
    posts.map(async (post) => {
      const recency = calculateRecencyScore(post.createdAt)
      const channelScore = channelAffinity[post.channelId || ''] || 0.5
      const creatorScore = await getCreatorReputation(post.authorId)

      const score = await calculateFeedScore({
        userId,
        postId: post.id,
        viewDuration: undefined,
        reacted: post.reactions.length > 0,
        commented: false,
        saved: false,
        channelAffinity: channelScore,
        recency,
        creatorReputation: creatorScore
      })

      return { ...post, feedScore: score }
    })
  )

  // Sort by score and return top N
  return rankedPosts
    .sort((a, b) => b.feedScore - a.feedScore)
    .slice(0, limit)
}

function calculateRecencyScore(createdAt: Date): number {
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  
  // Exponential decay
  // Fresh posts (0-6h): 1.0
  // 12h old: 0.5
  // 24h old: 0.25
  // 48h old: 0.1
  return Math.exp(-ageInHours / 12)
}

async function calculateChannelAffinity(
  userId: string,
  channelIds: string[]
): Promise<Record<string, number>> {
  const affinity: Record<string, number> = {}

  for (const channelId of channelIds) {
    const interactions = await prisma.feedTracking.findMany({
      where: {
        userId,
        post: { channelId }
      },
      select: {
        viewDuration: true,
        reacted: true,
        commented: true,
        saved: true
      }
    })

    const totalScore = interactions.reduce((sum, int) => {
      let score = 0
      if (int.viewDuration && int.viewDuration > 10000) score += 0.3
      if (int.reacted) score += 0.3
      if (int.commented) score += 0.4
      if (int.saved) score += 0.2
      return sum + score
    }, 0)

    affinity[channelId] = Math.min(totalScore / interactions.length || 0.5, 1)
  }

  return affinity
}

async function getCreatorReputation(authorId: string): Promise<number> {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      posts: {
        include: {
          _count: {
            select: {
              reactions: true,
              comments: true
            }
          }
        }
      }
    }
  })

  if (!author) return 0.5

  const totalPosts = author.posts.length
  if (totalPosts === 0) return 0.5

  const avgReactions = author.posts.reduce((sum, p) => sum + p._count.reactions, 0) / totalPosts
  const avgComments = author.posts.reduce((sum, p) => sum + p._count.comments, 0) / totalPosts

  // Normalize to 0-1 scale
  const reactionScore = Math.min(avgReactions / 10, 1) * 0.6
  const commentScore = Math.min(avgComments / 5, 1) * 0.4

  return reactionScore + commentScore
}
```

### 6.2 Feed Tracking Implementation

```typescript
// app/api/feed/track/route.ts

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postId, action, duration } = await request.json()

  await prisma.feedTracking.upsert({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId
      }
    },
    create: {
      userId: session.user.id,
      postId,
      viewed: action === 'view',
      viewDuration: duration,
      clickedPost: action === 'click',
      reacted: action === 'react',
      commented: action === 'comment',
      saved: action === 'save'
    },
    update: {
      ...(action === 'view' && { viewed: true, viewDuration: duration }),
      ...(action === 'click' && { clickedPost: true }),
      ...(action === 'react' && { reacted: true }),
      ...(action === 'comment' && { commented: true }),
      ...(action === 'save' && { saved: true })
    }
  })

  return NextResponse.json({ success: true })
}
```

---

## 7. Safety & Moderation

### 7.1 Content Moderation Strategy

**Multi-Layer Approach:**

1. **Pre-Posting Filter**
   - AI toxicity detection (OpenAI Moderation API)
   - Keyword blacklist
   - Pattern detection (spam, repetitive content)

2. **Post-Posting Monitoring**
   - User reports
   - Automated flagging
   - Reaction anomaly detection

3. **Human Review**
   - Flagged content queue
   - Community moderators
   - Escalation system

### 7.2 Toxicity Detection

```typescript
// lib/ai/toxicity.ts

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function checkToxicity(content: string): Promise<boolean> {
  try {
    const response = await openai.moderations.create({
      input: content
    })

    const result = response.results[0]

    // Flag if any category exceeds threshold
    const isToxic = 
      result.categories.harassment ||
      result.categories.hate ||
      result.categories.self_harm ||
      result.categories.sexual_minors ||
      result.categories.violence

    return isToxic
  } catch (error) {
    console.error('Toxicity check failed:', error)
    // Fail open - don't block if API fails
    return false
  }
}

export async function detectTone(content: string): Promise<ToneType> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze the tone of this message. Respond with ONLY one word: HONEST, HARSH, FUNNY, DEEP, or NEUTRAL.`
        },
        {
          role: 'user',
          content
        }
      ],
      max_tokens: 10
    })

    const tone = response.choices[0].message.content?.trim().toUpperCase()
    
    if (['HONEST', 'HARSH', 'FUNNY', 'DEEP', 'NEUTRAL'].includes(tone || '')) {
      return tone as ToneType
    }

    return 'NEUTRAL'
  } catch (error) {
    console.error('Tone detection failed:', error)
    return 'NEUTRAL'
  }
}
```

### 7.3 Rate Limiting

```typescript
// lib/rate-limit.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number // seconds
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }

  const remaining = Math.max(0, limit - current)

  return {
    success: current <= limit,
    remaining
  }
}

// Usage in API route
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || request.ip || 'anonymous'

  // 10 posts per hour
  const { success, remaining } = await rateLimit(`posts:${userId}`, 10, 3600)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', remaining },
      { status: 429 }
    )
  }

  // Continue with post creation...
}
```

---

## 8. UI/UX Design Principles

### 8.1 Design Philosophy

**Core Principles:**
1. **Minimalism**: Less is more
2. **Dark Mode First**: Designed for dark environments
3. **Emotion-Driven**: UI reflects emotional states
4. **Fast & Lightweight**: Instant interactions
5. **Anonymous-First**: No avatars, no profile pics

### 8.2 Color System

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        // Dark Mode Palette
        truth: {
          bg: '#0A0A0A',         // Main background
          surface: '#141414',    // Cards, surfaces
          border: '#2A2A2A',     // Borders
          text: '#E0E0E0',       // Primary text
          muted: '#888888',      // Secondary text
          accent: '#6366F1',     // Accent color (indigo)
          error: '#EF4444',      // Errors
          success: '#10B981',    // Success
        },
        
        // Reaction Colors
        reactions: {
          relate: '#8B5CF6',     // Purple
          deep: '#3B82F6',       // Blue
          notAlone: '#EC4899',   // Pink
          wild: '#F59E0B',       // Amber
          realTalk: '#EF4444',   // Red
          thankYou: '#10B981',   // Green
          hurts: '#6366F1',      // Indigo
          strong: '#F97316',     // Orange
        },
        
        // Tone Colors
        tones: {
          honest: '#10B981',     // Green
          harsh: '#EF4444',      // Red
          funny: '#F59E0B',      // Amber
          deep: '#6366F1',       // Indigo
          neutral: '#888888',    // Gray
        }
      }
    }
  }
}
```

### 8.3 Component Examples

**Post Card:**
```tsx
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
          ⚡ You're one of {post.viewsLimit} people seeing this
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(REACTIONS).map(([key, reaction]) => (
          <ReactionButton
            key={key}
            reaction={reaction}
            postId={post.id}
            active={post.userReaction === key}
            count={post.reactionCounts[key] || 0}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 9. Development Roadmap

### Phase 1: MVP (Weeks 1-4)

**Week 1: Foundation**
- [ ] Next.js project setup
- [ ] Database schema & Prisma setup
- [ ] Authentication (NextAuth.js)
- [ ] Basic routing structure

**Week 2: Core Features**
- [ ] Post creation & viewing
- [ ] Basic feed (chronological)
- [ ] Anonymous messaging system
- [ ] User inbox

**Week 3: Engagement**
- [ ] Reaction system
- [ ] Comments
- [ ] Channels creation
- [ ] Channel subscription

**Week 4: Polish & Deploy**
- [ ] UI polish
- [ ] Rate limiting
- [ ] Basic moderation
- [ ] Deploy to Vercel
- [ ] Beta launch

### Phase 2: Personalization (Weeks 5-8)

**Week 5-6: Feed Algorithm**
- [ ] Feed tracking system
- [ ] Engagement scoring
- [ ] Channel affinity calculation
- [ ] Personalized feed ranking

**Week 7: Advanced Features**
- [ ] Shadow identity system
- [ ] Limited visibility posts
- [ ] Story posts (24h expiration)
- [ ] Following shadow identities

**Week 8: Optimization**
- [ ] Performance optimization
- [ ] Caching layer (Redis)
- [ ] Analytics integration
- [ ] A/B testing setup

### Phase 3: Scale & Enhance (Weeks 9-12)

**Week 9-10: AI Integration**
- [ ] Advanced toxicity detection
- [ ] Tone analysis
- [ ] Content recommendations
- [ ] Spam prevention

**Week 11: Community Features**
- [ ] Community-created channels
- [ ] Private circles
- [ ] Daily prompts
- [ ] Trending algorithm

**Week 12: Launch Prep**
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Marketing site
- [ ] Public launch

---

## 10. Scaling Strategy

### 10.1 Performance Optimization

**Caching Strategy:**
```typescript
// lib/cache/redis.ts

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

// Cache feed results
export async function getCachedFeed(userId: string) {
  const cached = await redis.get(`feed:${userId}`)
  
  if (cached) {
    return JSON.parse(cached as string)
  }
  
  return null
}

export async function cacheFeed(userId: string, feed: any[], ttl: number = 300) {
  await redis.set(`feed:${userId}`, JSON.stringify(feed), { ex: ttl })
}

// Cache channel posts
export async function getCachedChannelPosts(channelId: string) {
  return await redis.get(`channel:${channelId}:posts`)
}
```

**Database Optimization:**
- Connection pooling
- Query optimization
- Proper indexing
- Read replicas for heavy read operations

**CDN & Edge:**
- Static assets on CDN
- Edge functions for global low-latency
- Image optimization (Next.js Image)

### 10.2 Monitoring

**Key Metrics:**
- Response time (P50, P95, P99)
- Error rates
- Database query performance
- User engagement metrics
- Feed ranking quality

**Tools:**
- Vercel Analytics
- Sentry (error tracking)
- PostHog (product analytics)
- Custom dashboards

---

## 11. Security Considerations

### 11.1 Authentication Security
- Secure password hashing (bcrypt)
- JWT with short expiration
- CSRF protection
- Rate limiting on auth endpoints

### 11.2 Data Privacy
- Anonymous data storage
- No IP logging for anonymous users
- GDPR compliance
- Data export capability
- Account deletion

### 11.3 Content Security
- XSS prevention (sanitize inputs)
- SQL injection protection (Prisma)
- HTTPS only
- Content Security Policy headers

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)

**Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session time
- Posts per user per day
- Messages sent per user
- Reactions per post

**Retention:**
- Day 1, 7, 30 retention rates
- Churn rate
- Return visit frequency

**Content Quality:**
- Average post length
- Comment rate
- Reaction diversity
- Report rate (should be low)

**Personalization:**
- Feed engagement rate
- Time to first interaction
- Scroll depth
- Return to feed rate

---

## Appendix: Quick Start Commands

```bash
# Clone and setup
git clone <repo>
cd truth
npm install

# Environment setup
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, etc.

# Database
npx prisma generate
npx prisma db push
npx prisma db seed

# Development
npm run dev

# Build
npm run build
npm start
```

---

**End of Enhanced Documentation**

This enhanced documentation provides a complete blueprint for building TruTH with Next.js. It includes detailed technical specifications, database schema, API design, personalization algorithms, and a clear development roadmap.

Ready to build! 🚀