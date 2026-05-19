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
      <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
        <Button
          type="button"
          variant={feed === "all" ? "default" : "ghost"}
          className={cn("h-9", feed !== "all" && "hover:bg-background")}
          onClick={() => setFeed("all")}
        >
          전체
        </Button>
        <Button
          type="button"
          variant={feed === "following" ? "default" : "ghost"}
          className={cn("h-9", feed !== "following" && "hover:bg-background")}
          onClick={() => requireLogin(() => setFeed("following"))}
        >
          팔로잉
        </Button>
      </div>

      <PostFeed feed={feed} />
    </section>
  );
}
