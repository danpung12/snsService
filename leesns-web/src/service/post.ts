import api from "@/lib/api";
import type { CursorPaginatedPosts, Post } from "@/types";

export interface CreatePostPayload {
  content: string;
  images?: string[];
}

export async function fetchPosts({
  cursor = 0,
  take = 5,
  authorId,
}: {
  cursor?: number;
  take?: number;
  authorId?: string;
}) {
  const response = await api.get<CursorPaginatedPosts>("/posts", {
    params: { cursor, take, authorId },
  });
  return response.data;
}

export async function fetchPostById(postId: number) {
  const response = await api.get<Post>(`/posts/${postId}`);
  return response.data;
}

export async function createPost(payload: CreatePostPayload) {
  const response = await api.post<Post>("/posts", payload);
  return response.data;
}

export async function updatePost(payload: { id: number; content: string }) {
  const { id, content } = payload;

  const response = await api.patch<Post>(`/posts/${id}`, { content });

  return response.data;
}

export async function deletePost(id: number) {
  const response = await api.delete(`/posts/${id}`);

  return response.data;
}
