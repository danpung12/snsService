"use client";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useUserId } from "@/store/auth";
import { Moon, SunIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import DmWidget from "../chat/dm-widget";
import NotificationButton from "./header/notification-button";
import ProfileButton from "./header/profile-button";

const subscribeToHydration = () => () => {};

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userId = useUserId();
  const { resolvedTheme, setTheme } = useTheme();
  const isChatPage = pathname.startsWith("/chat/");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/success");
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const isDarkMode = isHydrated && resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          "bg-background/95 sticky top-0 z-50 h-16 border-b border-border/80 shadow-[0_1px_8px_#20365303] backdrop-blur-xl",
          isChatPage && "hidden md:block",
        )}
      >
        <div
          className={cn(
            "m-auto flex h-full w-full justify-between px-4",
            isChatPage ? "max-w-[1440px]" : "max-w-175",
          )}
        >
          <Link href={"/"} className="flex items-center gap-2">
            <Image src={logo} alt="로고" className="h-6 w-auto" />
            <div className="text-lg font-bold tracking-tight">LeeSNS</div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              aria-label={
                isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"
              }
            >
              {isDarkMode ? (
                <Moon className="size-5" />
              ) : (
                <SunIcon className="size-5" />
              )}
            </button>
            {!isAuthPage && (
              <>
                {userId && <NotificationButton />}
                <ProfileButton />
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "w-full flex-1",
          isChatPage
            ? "mx-auto max-w-none px-0 py-0 md:px-6 md:py-4"
            : "m-auto max-w-175 px-4 py-6",
        )}
      >
        {children}
      </main>

      {!isChatPage && (
        <>
          <footer className="text-muted-foreground/80 border-t border-border/70 py-10 text-center text-sm">
            @aass6863
          </footer>
          <DmWidget />
        </>
      )}
    </div>
  );
}
