"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchPostById } from "@/service/post";
import { useQuery } from "@tanstack/react-query";

export function usePostByIdData(postId: number, type: "FEED" | "DETAIL") {
  return useQuery({
    queryKey: QUERY_KEYS.post.byId(postId),
    queryFn: () => fetchPostById(postId),
    enabled: type === "DETAIL",
    staleTime: Infinity,
  });
}
