"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateComment } from "@/hooks/use-create-comment";
import { useUpdateComment } from "@/hooks/use-update-comment";
import { useRequireLogin } from "@/hooks/use-require-login";
import { useUserId } from "@/store/auth";
import { MessageCircle } from "lucide-react";
import { saveLoginReturnTo } from "@/lib/auth-navigation";
import { usePathname, useRouter } from "next/navigation";

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
  const requireLogin = useRequireLogin();
  const userId = useUserId();
  const pathname = usePathname();
  const router = useRouter();
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

    requireLogin(() => {
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
    });
  };

  const isPending = isCreateCommentPending || isUpdateCommentPending;
  const isDisabled = isPending || content.trim() === "";
  const goToLogin = () => {
    const query = window.location.search.slice(1);
    const returnTo = query ? `${pathname}?${query}` : pathname;

    saveLoginReturnTo(returnTo);
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  if (props.type === "CREATE" && !userId) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="bg-background flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium">
              댓글을 작성하시려면 로그인이 필요합니다.
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              로그인하면 댓글을 남기고 대화에 참여할 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={goToLogin}>
            로그인하고 댓글 작성
          </Button>
        </div>
      </div>
    );
  }

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
