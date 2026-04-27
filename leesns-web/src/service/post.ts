import api from "@/lib/api";
import type { CursorPaginatedPosts, Post } from "@/types";

interface CreatePostPayload {
  content: string;
}

export async function fetchPosts({
  cursor = 0,
  take = 5,
}: {
  cursor?: number;
  take?: number;
}) {
  const response = await api.get<CursorPaginatedPosts>("/posts", {
    params: { cursor, take },
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
