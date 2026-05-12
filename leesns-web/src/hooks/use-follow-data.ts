"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchFollowers, fetchFollowings } from "@/service/follow";
import { useQuery } from "@tanstack/react-query";

export function useFollowingsData(userId?: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.follow.followings(userId ?? ""),
    queryFn: () => fetchFollowings(userId!),
    enabled: enabled && !!userId,
  });
}

export function useFollowersData(userId?: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.follow.followers(userId ?? ""),
    queryFn: () => fetchFollowers(userId!),
    enabled: enabled && !!userId,
  });
}
