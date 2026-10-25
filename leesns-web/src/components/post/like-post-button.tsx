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
      aria-pressed={isLiked}
      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-[13px] shadow-[var(--shadow-control)] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isLiked ? "border-[var(--like)]/25 bg-[var(--like-soft)] text-[var(--like)]" : "border-border bg-card text-muted-foreground hover:border-[var(--like)]/30 hover:bg-[var(--like-soft)] hover:text-[var(--like)]"}`}
    >
      <HeartIcon
        className={`h-4 w-4 ${isLiked ? "fill-current text-current" : ""}`}
      />
      <span>{likeCount}</span>
    </button>
  );
}
