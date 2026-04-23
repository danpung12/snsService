"use client";

import { useState, useEffect } from "react";
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

export default function PostEditorModal() {
  const { isOpen, type, content: storeContent, postId } = usePostEditorModal();
  const close = useClosePostEditorModal();

  const isEditMode = type === "EDIT";
  const [content, setContent] = useState(storeContent ?? "");

  useEffect(() => {
    if (isOpen && storeContent != null) {
      setContent(storeContent);
    }
  }, [isOpen, storeContent]);

  const { mutate: createPost, isPending: isCreatePending } = useCreatePost({
    onSuccess: () => {
      setContent("");
      close();
      toast.success("게시글이 작성되었습니다.");
    },
    onError: () => toast.error("포스트 생성에 실패했습니다."),
  });

  const { mutate: updatePost, isPending: isUpdatePending } = useUpdatePost({
    onSuccess: () => {
      setContent("");
      close();
      toast.success("게시글이 수정되었습니다.");
    },
    onError: () => toast.error("포스트 수정에 실패했습니다."),
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "포스트 수정" : "포스트 작성"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
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

        <div className="flex justify-between items-center mt-4">
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
      </DialogContent>
    </Dialog>
  );
}
