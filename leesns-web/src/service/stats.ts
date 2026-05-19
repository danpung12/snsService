import api from "@/lib/api";
import type { PostViewStat } from "@/types";

export async function getPostLast7DaysViewStats(postId: number) {
  const response = await api.get<PostViewStat[]>(
    `/stats/posts/${postId}/views/last-7-days`,
  );

  return response.data;
}
