"use client";

import { Button } from "@/components/ui/button";
import PostFeed from "@/components/post/post-feed";
import { useRequireLogin } from "@/hooks/use-require-login";
import { cn } from "@/lib/utils";
import { useState } from "react";

type FeedType = "all" | "following";

export default function PostFeedTabs() {
  const [feed, setFeed] = useState<FeedType>("all");
  const requireLogin = useRequireLogin();

  return (
    <section className="flex flex-col gap-5">
      <div className="bg-secondary/80 grid grid-cols-2 gap-1 rounded-xl p-1 shadow-[inset_0_0_0_1px_var(--border)]">
        <Button
          type="button"
          variant={feed === "all" ? "default" : "ghost"}
          className={cn("h-10 rounded-lg", feed !== "all" && "hover:bg-background")}
          onClick={() => setFeed("all")}
        >
          전체
        </Button>
        <Button
          type="button"
          variant={feed === "following" ? "default" : "ghost"}
          className={cn("h-10 rounded-lg", feed !== "following" && "hover:bg-background")}
          onClick={() => requireLogin(() => setFeed("following"))}
        >
          팔로잉
        </Button>
      </div>

      <PostFeed feed={feed} />
    </section>
  );
}
