import api from "@/lib/api";
import type { User } from "@/types";

export async function fetchUserProfile(userId: string) {
  const response = await api.get<User>(`/users/${userId}`);

  if (!response.data?.id) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }

  return response.data;
}
