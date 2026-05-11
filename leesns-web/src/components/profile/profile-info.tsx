"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import EditProfileButton from "@/components/profile/edit-profile-button";
import { useProfileData } from "@/hooks/use-profile-data";
import { toBackendImageUrl } from "@/lib/image-url";
import { useUserId } from "@/store/auth";

export default function ProfileInfo({ userId }: { userId: string }) {
  const currentUserId = useUserId();
  const { data: profile, error, isPending } = useProfileData(userId);

  if (error) {
    return (
      <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
        사용자 정보를 불러오지 못했습니다.
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-6">
        <div className="bg-muted h-30 w-30 animate-pulse rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted h-6 w-24 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-16 animate-pulse rounded-md" />
        </div>
      </div>
    );
  }

  const isMine = currentUserId === String(profile.id);
  const avatarUrl = profile.avatarUrl || profile.avatar_url;

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <img
        src={avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src}
        alt={`${profile.nickname}의 프로필 이미지`}
        className="h-30 w-30 rounded-full object-cover"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="text-xl font-bold">{profile.nickname}</div>
        {isMine && <EditProfileButton />}
      </div>
    </div>
  );
}
