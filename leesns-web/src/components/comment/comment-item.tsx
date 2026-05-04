"use client";

import Link from "next/link";
import defaultAvatar from "@/assets/default-avatar.png";
import type { NestedComment } from "@/types";
import { formatTimeAgo } from "@/lib/time";
import { useUserId } from "@/store/auth";
import { useState } from "react";
import CommentEditor from "@/components/comment/comment-editor";
import { useDeleteComment } from "@/hooks/use-delete-comment";
import { toast } from "sonner";

export default function CommentItem(props: NestedComment) {
  const userId = useUserId();

  const { mutate: deleteComment } = useDeleteComment({
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다.", {
        position: "top-center",
      });
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const toggleIsEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteClick = () => {
    if (!window.confirm("삭제한 댓글은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?")) {
      return;
    }

    deleteComment({ postId: props.postId, id: props.id });
  };

  const isMine = userId === props.authorId || userId === props.author?.id;
  const isRootComment = props.parentComment === undefined;

  return (
    <div
      className={`flex flex-col gap-8 pb-5 ${isRootComment ? "border-b" : "ml-6"}`}
    >
      <div className="flex items-start gap-4">
        <Link href={"#"}>
          <div className="flex h-full flex-col">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={defaultAvatar.src}
              alt={`${props.author?.nickname ?? "사용자"} 프로필 이미지`}
            />
          </div>
        </Link>
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="font-bold">
              {props.author?.nickname ?? "알 수 없는 사용자"}
            </div>
            {isMine && (
              <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm">
                <div
                  onClick={toggleIsEditing}
                  className="cursor-pointer hover:underline"
                >
                  수정
                </div>
                <div className="bg-border h-[13px] w-[2px]"></div>
                <div
                  onClick={handleDeleteClick}
                  className="cursor-pointer hover:underline"
                >
                  삭제
                </div>
              </div>
            )}
          </div>
          {isEditing ? (
            <CommentEditor
              type={"EDIT"}
              postId={props.postId}
              commentId={props.id}
              initialContent={props.content}
              onClose={toggleIsEditing}
            />
          ) : (
            <div>{props.content}</div>
          )}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
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
