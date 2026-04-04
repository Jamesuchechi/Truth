"use client";

import { FixedSizeList as List } from "react-window";
import { PostCard } from "./PostCard";
import type { PostWithRelations } from "@/lib/types/post";
import { useWindowSize } from "@/hooks/useWindowSize"; // We might need to create this

interface VirtualFeedProps {
  posts: PostWithRelations[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export default function VirtualFeed({
  posts,
  onLoadMore,
  hasMore,
  isLoading,
}: VirtualFeedProps) {
  const { width, height } = useWindowSize();

  // Row renderer for react-window
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const post = posts[index];
    if (!post) return null;

    return (
      <div style={style} className="px-4 py-2">
        <PostCard post={post} priority={index < 3} />
      </div>
    );
  };

  const itemHeight = 450;

  return (
    <List
      height={height || 800}
      itemCount={posts.length}
      itemSize={itemHeight}
      width={width || "100%"}
      onItemsRendered={({ visibleStopIndex }) => {
        if (hasMore && !isLoading && visibleStopIndex >= posts.length - 5) {
          onLoadMore?.();
        }
      }}
    >
      {Row}
    </List>
  );
}
