"use client";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { Moon, SunIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import DmWidget from "../chat/dm-widget";
import NotificationButton from "./header/notification-button";
import ProfileButton from "./header/profile-button";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isChatPage = pathname.startsWith("/chat/");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/success");
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={cn(
          "bg-background/95 sticky top-0 z-50 h-15 border-b backdrop-blur",
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
            <Image src={logo} alt="로고" className="h-5 w-auto" />
            <div className="font-bold">공통 헤더</div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              aria-label={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
            >
              {isDarkMode ? (
                <Moon className="size-6" />
              ) : (
                <SunIcon className="size-6" />
              )}
            </button>
            {!isAuthPage && (
              <>
                <NotificationButton />
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
          <footer className="text-muted-foreground border-t py-10 text-center">
            @aass6863
          </footer>
          <DmWidget />
        </>
      )}
    </div>
  );
}
