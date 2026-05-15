"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import defaultPostImage from "@/assets/default-post-image.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePostByIdData } from "@/hooks/use-post-by-id-data";
import { toBackendImageUrl } from "@/lib/image-url";
import { formatTimeAgo } from "@/lib/time";
import { useUserId } from "@/store/auth";
import type { Post } from "@/types";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DeletePostItemButton from "./delete-post-item-button";
import EditPostItemButton from "./edit-post-item-button";
import LikePostButton from "./like-post-button";

function getPostImageUrls(post: Post) {
  const imageUrls = [
    ...(post.images?.map((image) => image.url) ?? []),
    post.image,
    ...(post.image_urls ?? []),
  ]
    .filter((url): url is string => Boolean(url))
    .map(toBackendImageUrl);

  return Array.from(new Set(imageUrls));
}

function SafeAvatar({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src ? toBackendImageUrl(src) : defaultAvatar.src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.src = defaultAvatar.src;
      }}
    />
  );
}

function SafePostImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || defaultPostImage.src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.src = defaultPostImage.src;
      }}
    />
  );
}

export default function PostItem({
  postId,
  type,
}: {
  postId: number;
  type: "FEED" | "DETAIL";
}) {
  const userId = useUserId();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
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
    avatarUrl: null,
    avatar_url: null,
  };
  const isMine = post.authorId === userId || author.id === userId;
  const imageUrls = getPostImageUrls(post);
  const avatarUrl = author.avatarUrl || author.avatar_url;

  return (
    <article
      className={`flex flex-col gap-6 ${
        type === "FEED" ? "min-h-54 border-b py-7" : "min-h-62 pb-10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href={author.id ? `/profile/${author.id}` : "#"}>
            <SafeAvatar
              src={avatarUrl}
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

        {imageUrls.length > 0 && (
          <>
            <Carousel>
              <CarouselContent>
                {imageUrls.map((url, index) => (
                  <CarouselItem className="basis-4/5 md:basis-3/5" key={url}>
                    <button
                      type="button"
                      className="w-full overflow-hidden rounded-lg border bg-muted"
                      onClick={() => setPreviewImageUrl(url)}
                    >
                      <SafePostImage
                        src={url}
                        className="max-h-[350px] w-full cursor-zoom-in object-cover"
                        alt={`게시글 첨부 이미지 ${index + 1}`}
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <Dialog
              open={Boolean(previewImageUrl)}
              onOpenChange={(open) => {
                if (!open) setPreviewImageUrl(null);
              }}
            >
              <DialogContent className="max-h-[92vh] max-w-5xl border-0 bg-transparent p-0 shadow-none">
                <DialogTitle className="sr-only">게시글 이미지</DialogTitle>
                <SafePostImage
                  src={previewImageUrl}
                  alt="게시글 이미지 크게 보기"
                  className="max-h-[88vh] w-full rounded-lg object-contain"
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <LikePostButton
          id={post.id}
          likeCount={post.likeCount ?? 0}
          isLiked={Boolean(post.isLiked)}
        />

        {type === "FEED" && (
          <Link href={`/post/${post.id}`}>
            <div className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>댓글 {post.commentCount ?? 0}</span>
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
