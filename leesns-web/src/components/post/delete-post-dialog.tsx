"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCallback } from "react";
import { useDeletePost } from "@/hooks/use-delete-post";

export function DeletePostDialog({
  postId,
  children,
}: {
  postId: number;
  children: React.ReactNode;
}) {
  const { mutate, isPending } = useDeletePost({
    onSuccess: () => {
      toast.success("게시글이 삭제되었습니다.");
    },
    onError: () => toast.error("삭제에 실패했습니다."),
  });

  const handleDelete = useCallback(() => {
    mutate(postId);
  }, [mutate, postId]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>게시글 삭제</DialogTitle>
          <DialogDescription className="mt-3">
            내 프로필과 타임라인에서 즉시 사라지며, 다시 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="cursor-pointer">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
