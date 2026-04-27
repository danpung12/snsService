import type { PostIdsPage } from "@/hooks/use-infinite-posts-data";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createPost } from "@/service/post";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreatePostCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error | unknown) => void;
}

export function useCreatePost(callbacks?: CreatePostCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (createdPost) => {
      queryClient.setQueryData(QUERY_KEYS.post.byId(createdPost.id), createdPost);
      queryClient.setQueryData<InfiniteData<PostIdsPage, number>>(
        QUERY_KEYS.post.list,
        (oldData) => {
          if (!oldData) return oldData;

          const firstPage = oldData.pages[0];
          if (!firstPage || firstPage.postIds.includes(createdPost.id)) {
            return oldData;
          }

          return {
            ...oldData,
            pages: [
              {
                ...firstPage,
                postIds: [createdPost.id, ...firstPage.postIds],
              },
              ...oldData.pages.slice(1),
            ],
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
