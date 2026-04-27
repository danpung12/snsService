"use client";

import { fetchPosts } from "@/service/post";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Post } from "@/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

export const POSTS_PAGE_SIZE = 5;

export type PostIdsPage = {
  postIds: number[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

export function useInfinitePostsData() {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.post.list,
    queryFn: async ({ pageParam }) => {
      const page = await fetchPosts({
        cursor: pageParam,
        take: POSTS_PAGE_SIZE,
      });

      page.data.forEach((post: Post) => {
        queryClient.setQueryData(QUERY_KEYS.post.byId(post.id), post);
      });

      return {
        postIds: page.data.map((post) => post.id),
        nextCursor: page.data.at(-1)?.id ?? page.nextCursor,
        hasNextPage: page.hasNextPage,
      } satisfies PostIdsPage;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNextPage) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
    staleTime: Infinity,
  });
}
