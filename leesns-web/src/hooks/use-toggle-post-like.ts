"use client";

import { QUERY_KEYS } from "@/lib/query-keys";
import { togglePostLike } from "@/service/post";
import type { Post, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTogglePostLike(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async (postId) => {
      const queryKey = QUERY_KEYS.post.byId(postId);

      await queryClient.cancelQueries({ queryKey });

      const prevPost = queryClient.getQueryData<Post>(queryKey);

      queryClient.setQueryData<Post>(queryKey, (post) => {
        if (!post) return post;

        const isLiked = Boolean(post.isLiked);

        return {
          ...post,
          isLiked: !isLiked,
          likeCount: (post.likeCount ?? 0) + (isLiked ? -1 : 1),
        };
      });

      callbacks?.onMutate?.();

      return { prevPost };
    },
    onSuccess: (result, postId) => {
      queryClient.setQueryData<Post>(QUERY_KEYS.post.byId(postId), (post) => {
        if (!post) return post;

        return {
          ...post,
          likeCount: result.likeCount,
          isLiked: result.isLiked,
        };
      });

      callbacks?.onSuccess?.();
    },
    onError: (error, postId, context) => {
      if (context?.prevPost) {
        queryClient.setQueryData(QUERY_KEYS.post.byId(postId), context.prevPost);
      }

      callbacks?.onError?.(error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
}
