"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProfileData } from "@/hooks/use-profile-data";
import { toBackendImageUrl } from "@/lib/image-url";
import { useSetLogout, useUserId } from "@/store/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover as PopoverPrimitive } from "radix-ui";

export default function ProfileButton() {
  const userId = useUserId();
  const setLogout = useSetLogout();
  const router = useRouter();
  const { data: profile } = useProfileData(userId);

  const signOut = () => {
    setLogout();
    router.push("/login");
  };

  if (!userId) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          aria-label="프로필 메뉴"
        >
          <img
            src={
              profile?.avatarUrl
                ? toBackendImageUrl(profile.avatarUrl)
                : defaultAvatar.src
            }
            alt="프로필 이미지"
            className="h-7 w-7 rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.src = defaultAvatar.src;
            }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex w-40 flex-col p-0">
        <PopoverPrimitive.Close asChild>
          <Link href={`/profile/${userId}`}>
            <div className="hover:bg-muted cursor-pointer px-4 py-3 text-sm">
              프로필
            </div>
          </Link>
        </PopoverPrimitive.Close>
        <PopoverPrimitive.Close asChild>
          <div
            onClick={signOut}
            className="hover:bg-muted cursor-pointer px-4 py-3 text-sm"
          >
            로그아웃
          </div>
        </PopoverPrimitive.Close>
      </PopoverContent>
    </Popover>
  );
}
