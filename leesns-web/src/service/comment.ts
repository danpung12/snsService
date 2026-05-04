import api from "@/lib/api";
import type { Comment, CursorPaginatedComments } from "@/types";

export async function fetchComments({
  postId,
  cursor = 0,
  take = 5,
}: {
  postId: number;
  cursor?: number;
  take?: number;
}) {
  const response = await api.get<CursorPaginatedComments>(
    `/posts/${postId}/comments`,
    {
      params: { cursor, take },
    },
  );
  return response.data;
}

export async function createComment({
  postId,
  content,
}: {
  postId: number;
  content: string;
}) {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, {
    content,
  });
  return response.data;
}

export async function updateComment({
  postId,
  id,
  content,
}: {
  postId: number;
  id: number;
  content: string;
}) {
  const response = await api.patch<Comment>(`/posts/${postId}/comments/${id}`, {
    content,
  });
  return response.data;
}

export async function deleteComment({
  postId,
  id,
}: {
  postId: number;
  id: number;
}) {
  const response = await api.delete(`/posts/${postId}/comments/${id}`);
  return response.data;
}
