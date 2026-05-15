"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { deleteComment } from "@/service/comment";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteComment(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (_comment, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comment.post(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.post.byId(variables.postId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
