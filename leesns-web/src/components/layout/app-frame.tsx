"use client";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { SunIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DmWidget from "../chat/dm-widget";
import ProfileButton from "./header/profile-button";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat/");

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
          <div className="flex items-center gap-5">
            <div className="hover:bg-muted cursor-pointer rounded-full p-2">
              <SunIcon />
            </div>
            <ProfileButton />
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
