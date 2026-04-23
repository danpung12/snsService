import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import type { UseMutationCallback } from "@/types";
import { updatePost } from "@/service/post";

export function useUpdatePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      updatePost({ id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.refresh();

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
