"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { getPostLast7DaysViewStats } from "@/service/stats";
import { useQuery } from "@tanstack/react-query";

export function usePostLast7DaysViewStats(postId: number, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.stats.postViewsLast7Days(postId),
    queryFn: () => getPostLast7DaysViewStats(postId),
    enabled,
  });
}
