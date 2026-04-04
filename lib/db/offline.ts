import Dexie, { type EntityTable } from "dexie";
import type { PostWithRelations } from "@/lib/types/post";

interface OfflinePost extends PostWithRelations {
  cachedAt: number;
}

interface PostActionData {
  content: string;
  useShadow?: boolean;
  visibility?: string;
  channelId?: string;
  parentId?: string;
  media?: { url: string; type: string }[];
}

interface ReactionActionData {
  targetId: string;
  type: string;
  targetType: "POST" | "COMMENT";
}

interface CommentActionData {
  content: string;
  postId: string;
  parentId?: string;
}

type PendingAction =
  | { id: string; type: "POST"; data: PostActionData; createdAt: number }
  | {
      id: string;
      type: "REACTION";
      data: ReactionActionData;
      createdAt: number;
    }
  | { id: string; type: "COMMENT"; data: CommentActionData; createdAt: number };

const db = new Dexie("TruthOfflineDB") as Dexie & {
  posts: EntityTable<OfflinePost, "id">;
  pendingActions: EntityTable<PendingAction, "id">;
};

// Define Schema
db.version(1).stores({
  posts: "id, authorId, channelId, createdAt, cachedAt",
  pendingActions: "id, type, createdAt",
});

export { db };
export type { OfflinePost, PendingAction };
