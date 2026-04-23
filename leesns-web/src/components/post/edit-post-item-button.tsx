"use client";

import { Button } from "@/components/ui/button";
import { useOpenEditPostModal } from "@/store/post-editor-modal";
import { Post } from "@/types";

export default function EditPostItemButton(props: Post) {
  const openEditPostModal = useOpenEditPostModal();

  const handleButtonClick = () => {
    openEditPostModal({
      postId: props.id,
      content: props.content,
      imageUrls: props.image_urls || null,
    });
  };

  return (
    <Button
      onClick={handleButtonClick}
      className="cursor-pointer"
      variant={"ghost"}
    >
      수정
    </Button>
  );
}
