"use client";

import { PlusCircleIcon } from "lucide-react";
import { useOpenCreatePostModal } from "@/store/post-editor-modal";
import { useRequireLogin } from "@/hooks/use-require-login";

export default function CreatePostButton() {
  const open = useOpenCreatePostModal();
  const requireLogin = useRequireLogin();

  return (
    <>
      <div>
        <div
          onClick={() => requireLogin(open)}
          className="bg-card shadow-[inset_0_0_0_1px_var(--border),var(--shadow-control)] transition-colors hover:bg-accent/60 cursor-pointer py-4 px-6 rounded-2xl text-muted-foreground flex justify-between items-center"
        >
          <div className="text-[15px] font-medium text-foreground/80">게시글 작성</div>
          <PlusCircleIcon className="h-5 w-5 text-[var(--brand)]" />
        </div>
      </div>
    </>
  );
}
