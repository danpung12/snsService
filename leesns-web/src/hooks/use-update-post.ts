import { QUERY_KEYS } from "@/lib/query-keys";
import { updatePost, type UpdatePostPayload } from "@/service/post";
import type { Post, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePostPayload) => updatePost(payload),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData<Post>(
        QUERY_KEYS.post.byId(updatedPost.id),
        (cachedPost) => ({
          ...cachedPost,
          ...updatedPost,
          author: updatedPost.author ?? cachedPost?.author,
          authorId: updatedPost.authorId ?? cachedPost?.authorId,
        }),
      );

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
