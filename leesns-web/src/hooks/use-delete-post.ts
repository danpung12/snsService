import type { PostIdsPage } from "@/hooks/use-infinite-posts-data";
import { QUERY_KEYS } from "@/lib/query-keys";
import { deletePost } from "@/service/post";
import type { UseMutationCallback } from "@/types";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_deletedPost, deletedPostId) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.post.byId(deletedPostId),
        exact: true,
      });
      queryClient.setQueryData<InfiniteData<PostIdsPage, number>>(
        QUERY_KEYS.post.list,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              postIds: page.postIds.filter((postId) => postId !== deletedPostId),
            })),
          };
        },
      );

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
