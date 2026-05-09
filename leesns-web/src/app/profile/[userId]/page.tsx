"use client";

import ProfileInfo from "@/components/profile/profile-info";
import PostFeed from "@/components/post/post-feed";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userIdParam = params.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      router.replace("/");
    }
  }, [router, userId]);

  if (!userId) return null;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-10 px-4 py-10 md:py-14">
      <ProfileInfo userId={userId} />
      <div className="border-b" />
      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-bold">
          작성한 게시글
        </h2>
        <PostFeed authorId={userId} />
      </section>
    </main>
  );
}
