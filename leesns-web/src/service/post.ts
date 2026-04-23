import api from "@/lib/api";

interface CreatePostPayload {
  content: string;
}

export async function createPost(payload: CreatePostPayload) {
  const response = await api.post("/posts", payload);
  return response.data;
}

//  게시글 수정 API
export async function updatePost(payload: { id: number; content: string }) {
  const { id, content } = payload;

  const response = await api.patch(`/posts/${id}`, { content });

  return response.data;
}

// 게시글 삭제 API
export async function deletePost(id: number) {
  const response = await api.delete(`/posts/${id}`);

  return response.data;
}
