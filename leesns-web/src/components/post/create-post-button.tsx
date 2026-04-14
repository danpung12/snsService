import { PlusCircleIcon } from "lucide-react";
import { usePostModalOpen, usePostModalState } from "@/store/use-post-modal";

export default function CreatePostButton() {
  const open = usePostModalOpen();

  return (
    <>
      <div>
        <div
          onClick={open}
          className="bg-muted cursor-pointer py-4 px-6 rounded-xl text-muted-foreground flex justify-between"
        >
          <div>나누고 싶은 이야기가 있나요?</div>
          <PlusCircleIcon className="h-5 w-5" />
        </div>
      </div>
    </>
  );
}
