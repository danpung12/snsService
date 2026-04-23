import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import type { UseMutationCallback } from "@/types";
import { deletePost } from "@/service/post";

export function useDeletePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      // 삭제 성공 시 목록 새로고침
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.refresh();

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
