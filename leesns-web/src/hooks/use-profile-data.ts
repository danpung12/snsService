"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { fetchUserProfile } from "@/service/user";
import { useQuery } from "@tanstack/react-query";

export function useProfileData(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId ?? ""),
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
  });
}
