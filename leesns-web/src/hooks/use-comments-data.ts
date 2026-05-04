"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchComments } from "@/service/comment";
import { useInfiniteQuery } from "@tanstack/react-query";

export const COMMENTS_PAGE_SIZE = 5;

export function useCommentsData(postId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.comment.post(postId),
    queryFn: ({ pageParam }) =>
      fetchComments({
        postId,
        cursor: pageParam,
        take: COMMENTS_PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNextComment) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
    enabled,
  });
}
