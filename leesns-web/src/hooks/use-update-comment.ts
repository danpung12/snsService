"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { updateComment } from "@/service/comment";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateComment(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,
    onSuccess: (_comment, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.comment.post(variables.postId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
