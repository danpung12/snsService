"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchPostById } from "@/service/post";
import { useQuery } from "@tanstack/react-query";

export function usePostByIdData(postId: number, type: "FEED" | "DETAIL") {
  return useQuery({
    queryKey: QUERY_KEYS.post.byId(postId),
    queryFn: () => fetchPostById(postId),
    enabled: type === "DETAIL",
    refetchOnMount: type === "DETAIL" ? "always" : false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
