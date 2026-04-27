"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchPostById } from "@/service/post";
import { useQuery } from "@tanstack/react-query";

export function usePostByIdData(postId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.post.byId(postId),
    queryFn: () => fetchPostById(postId),
    enabled: false,
    staleTime: Infinity,
  });
}
