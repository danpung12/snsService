"use client";

import { HeartIcon, MessageCircle } from "lucide-react";
import defaultAvatar from "@/assets/default-avatar.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { formatTimeAgo } from "@/lib/time";
import EditPostItemButton from "./edit-post-item-button";
import DeletePostItemButton from "./delete-post-item-button";
import { usePostByIdData } from "@/hooks/use-post-by-id-data";
import Link from "next/link";
import { useUserId } from "@/store/auth";

export default function PostItem({
  postId,
  type,
}: {
  postId: number;
  type: "FEED" | "DETAIL";
}) {
  const userId = useUserId();
  const { data: post, isPending, error } = usePostByIdData(postId, type);

  if (isPending) {
    return (
      <div className="text-muted-foreground py-14 text-center text-sm">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
        게시글을 표시할 수 없습니다.
      </div>
    );
  }

  const author = post.author ?? {
    id: post.authorId,
    nickname: "알 수 없는 사용자",
    avatar_url: null,
  };
  const isMine = post.authorId === userId || author.id === userId;

  return (
    <article
      className={`flex flex-col gap-6 ${
        type === "FEED" ? "min-h-54 border-b py-7" : "min-h-62 pb-10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href={author.id ? `/profile/${author.id}` : "#"}>
            <img
              src={author.avatar_url || defaultAvatar.src}
              alt={`${author.nickname} 프로필 이미지`}
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <div className="font-bold hover:underline">{author.nickname}</div>
            <div className="text-muted-foreground text-sm">
              {formatTimeAgo(post.created_at)}
            </div>
          </div>
        </div>

        {isMine && (
          <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
            <EditPostItemButton {...post} />
            <DeletePostItemButton postId={post.id} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5">
        {type === "FEED" ? (
          <Link href={`/post/${post.id}`} className="flex min-h-14">
            <div className="line-clamp-3 break-words whitespace-pre-wrap leading-7">
              {post.content}
            </div>
          </Link>
        ) : (
          <div className="min-h-20 break-words whitespace-pre-wrap leading-7 md:text-[17px]">
            {post.content}
          </div>
        )}

        {post.image_urls && post.image_urls.length > 0 && (
          <Carousel>
            <CarouselContent>
              {post.image_urls.map((url, index) => (
                <CarouselItem className="basis-3/5" key={index}>
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={url}
                      className="h-full max-h-[350px] w-full object-cover"
                      alt="게시글 첨부 이미지"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <div className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm">
          <HeartIcon className="h-4 w-4" />
          <span>{post.likeCount ?? 0}</span>
        </div>

        {type === "FEED" && (
          <Link href={`/post/${post.id}`}>
            <div className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>댓글 보기</span>
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
