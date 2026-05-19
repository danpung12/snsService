"use client";

import { useTogglePostLike } from "@/hooks/use-toggle-post-like";
import { useRequireLogin } from "@/hooks/use-require-login";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

export default function LikePostButton({
  id,
  likeCount,
  isLiked,
}: {
  id: number;
  likeCount: number;
  isLiked: boolean;
}) {
  const requireLogin = useRequireLogin();
  const { mutate: togglePostLike, isPending } = useTogglePostLike({
    onError: () => {
      toast.error("좋아요 요청에 실패했습니다.", {
        position: "top-center",
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => requireLogin(() => togglePostLike(id))}
      disabled={isPending}
      className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      <HeartIcon
        className={`h-4 w-4 ${isLiked ? "fill-foreground text-foreground" : ""}`}
      />
      <span>{likeCount}</span>
    </button>
  );
}
