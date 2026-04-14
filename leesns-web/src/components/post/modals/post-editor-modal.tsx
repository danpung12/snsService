"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePostModalClose, usePostModalState } from "@/store/use-post-modal";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function PostEditorModal() {
  const isOpen = usePostModalState();
  const close = usePostModalClose();

  const [content, setContent] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogTitle>포스트 작성</DialogTitle>

        <Textarea onChange={(e) => setContent(e.target.value)} />
        <Button variant={"outline"} className="cursor-pointer">
          <ImageIcon />
          이미지 추가
        </Button>
        <Button className="cursor-pointer">저장</Button>
      </DialogContent>
    </Dialog>
  );
}
