"use client";

import CommentItem from "@/components/comment/comment-item";
import { useCommentsData } from "@/hooks/use-comments-data";
import type { Comment, NestedComment } from "@/types";
import { useEffect, useRef } from "react";

function toNestedComments(comments: Comment[]): NestedComment[] {
  return comments.map((comment) => ({ ...comment, children: [] }));
}

function CommentListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 border-b pb-5">
          <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
            <div className="bg-muted h-3 w-12 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CommentList({ postId }: { postId: number }) {
  const {
    data,
    error: fetchCommentsError,
    isPending: isFetchCommentsPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommentsData(postId);
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
      { rootMargin: "160px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (fetchCommentsError) {
    return (
      <div className="text-muted-foreground rounded-lg border py-8 text-center text-sm">
        댓글을 불러오지 못했습니다.
      </div>
    );
  }

  if (isFetchCommentsPending) {
    return <CommentListSkeleton />;
  }

  const comments = Array.from(
    new Map(
      data.pages
        .flatMap((page) => page.data)
        .map((comment) => [comment.id, comment]),
    ).values(),
  );
  const nestedComments = toNestedComments(comments);

  if (nestedComments.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border py-8 text-center text-sm">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {nestedComments.map((comment) => (
        <CommentItem key={comment.id} {...comment} />
      ))}
      {isFetchingNextPage && <CommentListSkeleton />}
      <div ref={loaderRef} className="h-1" />
    </div>
  );
}
