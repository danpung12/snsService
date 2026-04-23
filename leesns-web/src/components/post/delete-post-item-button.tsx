"use client";

import { Button } from "@/components/ui/button";
import { DeletePostDialog } from "./delete-post-dialog";

export default function DeletePostItemButton({
  postId,
}: {
  postId: number;
}) {
  return (
    <DeletePostDialog postId={postId}>
      <Button variant={"ghost"} className="cursor-pointer">
        삭제
      </Button>
    </DeletePostDialog>
  );
}
