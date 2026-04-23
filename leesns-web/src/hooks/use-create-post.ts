import { createPost } from "@/service/post";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // 👈 추가

interface CreatePostCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error | any) => void;
}

export function useCreatePost(callbacks?: CreatePostCallbacks) {
  const queryClient = useQueryClient();
  const router = useRouter(); // 👈 라우터 인스턴스 생성

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      //  클라이언트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      //  서버 컴포넌트를 강제로 다시 호출하여 데이터를 새로 받아오게 함
      router.refresh();

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
