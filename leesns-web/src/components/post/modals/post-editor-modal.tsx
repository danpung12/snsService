"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  usePostEditorModal,
  useClosePostEditorModal,
} from "@/store/post-editor-modal";
import { ImageIcon } from "lucide-react";
import { useCreatePost } from "@/hooks/use-create-post";
import { useUpdatePost } from "@/hooks/use-update-post";

function PostEditorForm({
  initialContent,
  isEditMode,
  postId,
  close,
}: {
  initialContent: string;
  isEditMode: boolean;
  postId?: number;
  close: () => void;
}) {
  const [content, setContent] = useState(initialContent);

  const { mutate: createPost, isPending: isCreatePending } = useCreatePost({
    onSuccess: () => {
      setContent("");
      close();
      toast.success("게시글을 작성했습니다.");
    },
    onError: () => toast.error("게시글 작성에 실패했습니다."),
  });

  const { mutate: updatePost, isPending: isUpdatePending } = useUpdatePost({
    onSuccess: () => {
      setContent("");
      close();
      toast.success("게시글을 수정했습니다.");
    },
    onError: () => toast.error("게시글 수정에 실패했습니다."),
  });

  const handleSave = () => {
    if (!content.trim()) return;
    if (isEditMode && postId) {
      updatePost({ id: postId, content });
    } else {
      createPost({ content });
    }
  };

  return (
    <>
      <div className="mt-2 flex flex-col gap-4">
        <Textarea
          autoFocus
          onFocus={(e) =>
            e.target.setSelectionRange(e.target.value.length, e.target.value.length)
          }
          placeholder="오늘 어떤 일이 있었나요?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant={"outline"} className="cursor-pointer">
          <ImageIcon className="mr-2 h-4 w-4" />
          이미지 추가
        </Button>

        <Button
          className="cursor-pointer px-8"
          onClick={handleSave}
          disabled={isCreatePending || isUpdatePending}
        >
          {isCreatePending || isUpdatePending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </>
  );
}

export default function PostEditorModal() {
  const { isOpen, type, content: storeContent, postId } = usePostEditorModal();
  const close = useClosePostEditorModal();

  const isEditMode = type === "EDIT";
  const initialContent = isEditMode ? (storeContent ?? "") : "";
  const formKey = isEditMode ? `edit-${postId}-${storeContent}` : "create";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "게시글 수정" : "게시글 작성"}
          </DialogTitle>
        </DialogHeader>

        <PostEditorForm
          key={formKey}
          initialContent={initialContent}
          isEditMode={isEditMode}
          postId={postId}
          close={close}
        />
      </DialogContent>
    </Dialog>
  );
}
