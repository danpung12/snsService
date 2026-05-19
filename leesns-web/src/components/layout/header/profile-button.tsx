"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLogout } from "@/hooks/use-auth";
import { useProfileData } from "@/hooks/use-profile-data";
import { toBackendImageUrl } from "@/lib/image-url";
import { useUserId } from "@/store/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Popover as PopoverPrimitive } from "radix-ui";
import { saveLoginReturnTo } from "@/lib/auth-navigation";

export default function ProfileButton() {
  const userId = useUserId();
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useProfileData(userId);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (!userId) {
    return (
      <button
        type="button"
        className="hover:bg-muted inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
        onClick={() => {
          const query = window.location.search.slice(1);
          const returnTo = query ? `${pathname}?${query}` : pathname;

          saveLoginReturnTo(returnTo);
          router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      >
        로그인
      </button>
    );
  }

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
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            type="button"
            className="hover:bg-muted cursor-pointer px-4 py-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "로그아웃 중" : "로그아웃"}
          </button>
        </PopoverPrimitive.Close>
      </PopoverContent>
    </Popover>
  );
}
