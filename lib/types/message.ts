// lib/types/message.ts
import type { MessageType, ToneType } from "@prisma/client"

export interface Reply {
  id: string
  receiverId: string
  content: string
  type: MessageType
  tone: ToneType | null
  senderId: string | null
  createdAt: Date
  readAt: Date | null
  deletedAt: Date | null
  isArchived: boolean
  isFavorite: boolean
  revealSender: boolean
  senderFingerprint: string | null
  parentId: string | null
  audioUrl: string | null
  transcription: string | null
  sender?: {
    username: string
    image: string | null
    shadowName: string | null
  } | null
}

export interface Message {
  id: string
  receiverId: string
  content: string
  type: MessageType
  tone: ToneType | null
  senderId: string | null
  createdAt: Date
  readAt: Date | null
  deletedAt: Date | null
  isArchived: boolean
  isFavorite: boolean
  revealSender: boolean
  senderFingerprint: string | null
  repliedWithPostId: string | null
  parentId: string | null
  audioUrl: string | null
  transcription: string | null
  sender?: {
    username: string
    image: string | null
    shadowName: string | null
  } | null
  replies?: Reply[]
}
