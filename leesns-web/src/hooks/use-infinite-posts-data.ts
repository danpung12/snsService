"use client";

import { fetchFollowingPosts, fetchPosts } from "@/service/post";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Post } from "@/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

export const POSTS_PAGE_SIZE = 5;

export type PostIdsPage = {
  postIds: number[];
  nextCursor: number | null;
  hasNextPage: boolean;
};

export function useInfinitePostsData({
  authorId,
  feed = "all",
}: {
  authorId?: string;
  feed?: "all" | "following";
} = {}) {
  const queryClient = useQueryClient();
  const queryKey =
    feed === "following"
      ? QUERY_KEYS.post.followingList
      : authorId
        ? QUERY_KEYS.post.userList(authorId)
        : QUERY_KEYS.post.list;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const page =
        feed === "following"
          ? await fetchFollowingPosts({
              cursor: pageParam,
              take: POSTS_PAGE_SIZE,
            })
          : await fetchPosts({
              cursor: pageParam,
              take: POSTS_PAGE_SIZE,
              authorId,
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
