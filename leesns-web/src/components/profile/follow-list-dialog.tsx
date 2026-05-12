"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toBackendImageUrl } from "@/lib/image-url";
import type { FollowRelation, User } from "@/types";
import Link from "next/link";

function getUserFromFollow(follow: FollowRelation, type: "followers" | "followings") {
  return type === "followers" ? follow.follower : follow.followed;
}

export default function FollowListDialog({
  title,
  type,
  follows,
  isPending,
}: {
  title: string;
  type: "followers" | "followings";
  follows: FollowRelation[];
  isPending: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="h-auto flex-col gap-1 px-4 py-2">
          <span className="text-base font-bold">{follows.length}</span>
          <span className="text-muted-foreground text-xs">{title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[360px] flex-col overflow-y-auto">
          {isPending && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              목록을 불러오는 중...
            </div>
          )}

          {!isPending && follows.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              아직 {title} 목록이 없습니다.
            </div>
          )}

          {!isPending &&
            follows.map((follow) => {
              const user = getUserFromFollow(follow, type) as User | undefined;
              if (!user) return null;

              const avatarUrl = user.avatarUrl || user.avatar_url;

              return (
                <Link
                  key={follow.id}
                  href={`/profile/${user.id}`}
                  className="hover:bg-muted flex items-center gap-3 rounded-md px-2 py-3"
                >
                  <img
                    src={avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src}
                    alt={`${user.nickname} 프로필 이미지`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-medium">{user.nickname}</span>
                </Link>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
