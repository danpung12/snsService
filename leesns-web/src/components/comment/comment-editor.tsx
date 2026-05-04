"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateComment } from "@/hooks/use-create-comment";
import { useUpdateComment } from "@/hooks/use-update-comment";

type CreateMode = {
  type: "CREATE";
  postId: number;
};

type EditMode = {
  type: "EDIT";
  postId: number;
  commentId: number;
  initialContent: string;
  onClose: () => void;
};

type Props = CreateMode | EditMode;

export default function CommentEditor(props: Props) {
  const { mutate: createComment, isPending: isCreateCommentPending } =
    useCreateComment({
      onSuccess: () => {
        setContent("");
      },
      onError: () => {
        toast.error("댓글 작성에 실패했습니다.", {
          position: "top-center",
        });
      },
    });

  const { mutate: updateComment, isPending: isUpdateCommentPending } =
    useUpdateComment({
      onSuccess: () => {
        if (props.type === "EDIT") {
          props.onClose();
        }
      },
      onError: () => {
        toast.error("댓글 수정에 실패했습니다.", {
          position: "top-center",
        });
      },
    });

  const [content, setContent] = useState(
    props.type === "EDIT" ? props.initialContent : "",
  );

  const handleSubmitClick = () => {
    if (content.trim() === "") return;

    if (props.type === "CREATE") {
      createComment({
        postId: props.postId,
        content,
      });
    } else {
      updateComment({
        postId: props.postId,
        id: props.commentId,
        content,
      });
    }
  };

  const isPending = isCreateCommentPending || isUpdateCommentPending;
  const isDisabled = isPending || content.trim() === "";

  return (
    <div
      className={
        props.type === "CREATE"
          ? "flex flex-col gap-3 rounded-lg border p-4"
          : "flex flex-col gap-2"
      }
    >
      <Textarea
        disabled={isPending}
        value={content}
        placeholder="댓글을 입력하세요."
        className={
          props.type === "CREATE" ? "min-h-24 resize-none" : "resize-none"
        }
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        {props.type === "EDIT" && (
          <Button
            disabled={isPending}
            variant={"outline"}
            onClick={() => props.onClose()}
          >
            취소
          </Button>
        )}
        <Button disabled={isDisabled} onClick={handleSubmitClick}>
          {props.type === "EDIT" ? "수정 완료" : "작성"}
        </Button>
      </div>
    </div>
  );
}
