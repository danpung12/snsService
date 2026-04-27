"use client";

import PostItem from "@/components/post/post-item";
import { useInfinitePostsData } from "@/hooks/use-infinite-posts-data";
import { useEffect, useRef } from "react";

export default function PostFeed() {
  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePostsData();
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error) {
    return (
      <div className="text-muted-foreground rounded-lg border p-6 text-center text-sm">
        게시글을 불러오지 못했습니다.
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="text-muted-foreground py-10 text-center text-sm">
        게시글을 불러오는 중...
      </div>
    );
  }

  const isEmpty = data.pages.every((page) => page.postIds.length === 0);

  if (isEmpty) {
    return (
      <div className="text-muted-foreground rounded-lg border p-6 text-center text-sm">
        아직 게시글이 없습니다.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      {data.pages.map((page) =>
        page.postIds.map((postId) => <PostItem key={postId} postId={postId} />),
      )}

      {isFetchingNextPage && (
        <div className="text-muted-foreground py-4 text-center text-sm">
          더 불러오는 중...
        </div>
      )}

      <div ref={loaderRef} className="h-1" />
    </section>
  );
}
