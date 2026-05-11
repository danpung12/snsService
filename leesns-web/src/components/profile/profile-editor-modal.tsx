"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProfileData } from "@/hooks/use-profile-data";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { toBackendImageUrl } from "@/lib/image-url";
import { useUserId } from "@/store/auth";
import { useProfileEditorModal } from "@/store/profile-editor-modal";
import { CameraIcon } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

type AvatarImage = {
  file: File;
  previewUrl: string;
};

function getAvatarUrl(profile?: {
  avatarUrl?: string | null;
  avatar_url?: string | null;
}) {
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url;
  return avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src;
}

export default function ProfileEditorModal() {
  const userId = useUserId();
  const { isOpen, close } = useProfileEditorModal();
  const { data: profile, error, isPending } = useProfileData(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<AvatarImage | null>(null);

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile({
    onSuccess: () => {
      close();
      toast.success("프로필이 수정되었습니다.", {
        position: "top-center",
      });
    },
    onError: () => {
      toast.error("프로필 수정에 실패했습니다.", {
        position: "top-center",
      });
    },
  });

  useEffect(() => {
    return () => {
      if (avatarImage) {
        URL.revokeObjectURL(avatarImage.previewUrl);
      }
    };
  }, [avatarImage]);

  const handleOpenChange = (open: boolean) => {
    if (open) return;

    close();
    setNickname(null);

    if (avatarImage) {
      URL.revokeObjectURL(avatarImage.previewUrl);
      setAvatarImage(null);
    }
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarImage) {
      URL.revokeObjectURL(avatarImage.previewUrl);
    }

    setAvatarImage({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const handleUpdateClick = () => {
    const trimmedNickname = (nickname ?? profile?.nickname ?? "").trim();
    if (!trimmedNickname) {
      toast.error("닉네임을 입력해주세요.", {
        position: "top-center",
      });
      return;
    }

    updateProfile({
      nickname: trimmedNickname,
      avatarImageFile: avatarImage?.file,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-6">
        <DialogTitle>프로필 수정</DialogTitle>

        {error && (
          <div className="text-muted-foreground rounded-md border p-6 text-center text-sm">
            프로필 정보를 불러오지 못했습니다.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-5">
            <div className="bg-muted h-24 w-24 animate-pulse rounded-full" />
            <div className="bg-muted h-9 w-full animate-pulse rounded-md" />
          </div>
        )}

        {!error && !isPending && profile && (
          <>
            <div className="flex flex-col items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUpdating}
                onChange={handleSelectImage}
              />
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-28 w-28 overflow-hidden rounded-full border bg-muted shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="프로필 이미지 변경"
              >
                <img
                  src={avatarImage?.previewUrl || getAvatarUrl(profile)}
                  alt="프로필 이미지"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <CameraIcon className="h-5 w-5 text-white" />
                </div>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground cursor-pointer text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                프로필 이미지 변경
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-muted-foreground text-sm">닉네임</div>
              <Input
                disabled={isUpdating}
                value={nickname ?? profile.nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </div>

            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleUpdateClick}
              className="mt-1 cursor-pointer"
            >
              수정하기
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
