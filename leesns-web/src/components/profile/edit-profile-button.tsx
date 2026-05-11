"use client";

import { Button } from "@/components/ui/button";
import { useOpenProfileEditorModal } from "@/store/profile-editor-modal";

export default function EditProfileButton() {
  const openProfileEditorModal = useOpenProfileEditorModal();

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={openProfileEditorModal}
      className="cursor-pointer"
    >
      프로필 수정
    </Button>
  );
}
