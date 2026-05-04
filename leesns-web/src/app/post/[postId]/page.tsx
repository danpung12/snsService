"use client";

import CommentEditor from "@/components/comment/comment-editor";
import CommentList from "@/components/comment/comment-list";
import PostItem from "@/components/post/post-item";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = Number(params.postId);

  if (!Number.isFinite(postId)) {
    router.replace("/");
    return null;
  }

  return (
    <div className="flex flex-col gap-8 pt-3 md:pt-6">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground w-fit px-0 hover:bg-transparent hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        뒤로
      </Button>

      <PostItem postId={postId} type={"DETAIL"} />

      <section className="flex flex-col gap-5 border-t pt-7">
        <div className="text-xl font-bold">댓글</div>
        <CommentEditor type="CREATE" postId={postId} />
        <CommentList postId={postId} />
      </section>
    </div>
  );
}
