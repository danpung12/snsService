"use client";

import { Button } from "@/components/ui/button";
import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-user";
import { useRequireLogin } from "@/hooks/use-require-login";
import { toast } from "sonner";

export default function FollowButton({
  userId,
  isFollowing,
}: {
  userId: string;
  isFollowing: boolean;
}) {
  const requireLogin = useRequireLogin();
  const { mutate: follow, isPending: isFollowingPending } = useFollowUser({
    onSuccess: () => toast.success("팔로우했습니다."),
    onError: () => toast.error("팔로우에 실패했습니다."),
  });
  const { mutate: unfollow, isPending: isUnfollowingPending } = useUnfollowUser(
    {
      onSuccess: () => toast.success("언팔로우했습니다."),
      onError: () => toast.error("언팔로우에 실패했습니다."),
    },
  );
  const isPending = isFollowingPending || isUnfollowingPending;

  return (
    <Button
      type="button"
      variant={isFollowing ? "outline" : "default"}
      disabled={isPending}
      onClick={() => {
        requireLogin(() => {
          if (isFollowing) {
            unfollow(userId);
            return;
          }

          follow(userId);
        });
      }}
    >
      {isPending ? "처리 중..." : isFollowing ? "팔로잉" : "팔로우"}
    </Button>
  );
}
