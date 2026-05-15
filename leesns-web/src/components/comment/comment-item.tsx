"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import CommentEditor from "@/components/comment/comment-editor";
import { useDeleteComment } from "@/hooks/use-delete-comment";
import {
  hasFailedImageUrl,
  rememberFailedImageUrl,
} from "@/lib/image-fallback-cache";
import { toBackendImageUrl } from "@/lib/image-url";
import { formatTimeAgo } from "@/lib/time";
import { useUserId } from "@/store/auth";
import type { NestedComment } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function getCommentAvatarSrc(avatarUrl?: string | null) {
  return avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src;
}

export default function CommentItem(props: NestedComment) {
  const userId = useUserId();
  const [isEditing, setIsEditing] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const { mutate: deleteComment } = useDeleteComment({
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.", {
        position: "top-center",
      });
    },
  });

  const handleDeleteClick = () => {
    if (!window.confirm("삭제한 댓글은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?")) {
      return;
    }

    deleteComment({ postId: props.postId, id: props.id });
  };

  const isMine = userId === props.authorId || userId === props.author?.id;
  const isRootComment = props.parentComment === undefined;
  const avatarUrl = props.author?.avatarUrl || props.author?.avatar_url;
  const resolvedAvatarUrl = getCommentAvatarSrc(avatarUrl);
  const avatarSrc =
    failedAvatarUrl === resolvedAvatarUrl ||
    hasFailedImageUrl(resolvedAvatarUrl)
      ? defaultAvatar.src
      : resolvedAvatarUrl;
  const authorName = props.author?.nickname ?? "알 수 없는 사용자";

  return (
    <div
      className={`flex flex-col gap-8 pb-5 ${
        isRootComment ? "border-b" : "ml-6"
      }`}
    >
      <div className="flex items-start gap-4">
        <Link href={props.author?.id ? `/profile/${props.author.id}` : "#"}>
          <div className="flex h-full flex-col">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={avatarSrc}
              alt={`${authorName} 프로필 이미지`}
              onError={(event) => {
                rememberFailedImageUrl(resolvedAvatarUrl);
                event.currentTarget.src = defaultAvatar.src;
                setFailedAvatarUrl(resolvedAvatarUrl);
              }}
            />
          </div>
        </Link>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="font-bold">{authorName}</div>

            {isMine && (
              <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setIsEditing((current) => !current)}
                  className="cursor-pointer hover:underline"
                >
                  수정
                </button>
                <div className="h-[13px] w-[2px] bg-border" />
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="cursor-pointer hover:underline"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <CommentEditor
              type="EDIT"
              postId={props.postId}
              commentId={props.id}
              initialContent={props.content}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <div>{props.content}</div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div>{formatTimeAgo(props.created_at)}</div>
          </div>
        </div>
      </div>

      {props.children.map((comment) => (
        <CommentItem key={comment.id} {...comment} />
      ))}
    </div>
  );
}
