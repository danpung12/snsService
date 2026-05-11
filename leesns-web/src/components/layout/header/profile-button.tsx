"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import { useProfileData } from "@/hooks/use-profile-data";
import { toBackendImageUrl } from "@/lib/image-url";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSetLogout, useUserId } from "@/store/auth";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover as PopoverPrimitive } from "radix-ui";

export default function ProfileButton() {
  const userId = useUserId();
  const setLogout = useSetLogout();
  const router = useRouter();
  const { data: profile } = useProfileData(userId);

  const signOut = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("nickname");
    setLogout();
    router.push("/login");
  };

  if (!userId) return null;

  const avatarUrl = profile?.avatarUrl || profile?.avatar_url;

  return (
    <Popover>
      <PopoverTrigger>
        <img
          src={avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src}
          alt="프로필 이미지"
          className="h-6 w-6 cursor-pointer rounded-full object-cover"
        />
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
