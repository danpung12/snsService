"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import defaultAvatar from "@/assets/default-avatar.png";
import { Popover as PopoverPrimitive } from "radix-ui";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSetLogout, useUserId } from "@/store/auth";

export default function ProfileButton() {
  const userId = useUserId();
  const setLogout = useSetLogout();
  const router = useRouter();

  const signOut = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("nickname");
    setLogout();
    router.push("/login");
  };

  if (!userId) return null;
  return (
    <Popover>
      <PopoverTrigger>
        <img
          src={defaultAvatar.src}
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
