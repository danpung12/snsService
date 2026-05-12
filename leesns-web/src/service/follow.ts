import api from "@/lib/api";
import type { FollowRelation, FollowResponse } from "@/types";

export async function followUser(userId: string) {
  const response = await api.post<FollowResponse>(`/follows/${userId}`);
  return response.data;
}

export async function unfollowUser(userId: string) {
  const response = await api.delete<FollowResponse>(`/follows/${userId}`);
  return response.data;
}

export async function fetchFollowings(userId: string) {
  const response = await api.get<FollowRelation[]>(`/follows/${userId}/followings`);
  return response.data;
}

export async function fetchFollowers(userId: string) {
  const response = await api.get<FollowRelation[]>(`/follows/${userId}/followers`);
  return response.data;
}
