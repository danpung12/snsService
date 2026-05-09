"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toBackendImageUrl } from "@/lib/image-url";
import { uploadPostImages } from "@/service/image";
import { toast } from "sonner";
import {
  usePostEditorModal,
  useClosePostEditorModal,
} from "@/store/post-editor-modal";
import { ImageIcon, XIcon } from "lucide-react";
import { useCreatePost } from "@/hooks/use-create-post";
import { useUpdatePost } from "@/hooks/use-update-post";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

function PostEditorForm({
  initialContent,
  initialImageUrls,
  isEditMode,
  postId,
  close,
}: {
  initialContent: string;
  initialImageUrls: string[] | null;
  isEditMode: boolean;
  postId?: number;
  close: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createPost, isPending: isCreatePending } = useCreatePost({
    onSuccess: () => {
      setContent("");
      setSelectedImages([]);
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

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setSelectedImages((prevImages) => {
      const nextImages = [
        ...prevImages,
        ...files.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];

      return nextImages.slice(0, 4);
    });
    event.target.value = "";
  };

  const handleDeleteSelectedImage = (previewUrl: string) => {
    setSelectedImages((prevImages) => {
      const target = prevImages.find((image) => image.previewUrl === previewUrl);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return prevImages.filter((image) => image.previewUrl !== previewUrl);
    });
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    if (isEditMode && postId) {
      updatePost({ id: postId, content });
      return;
    }

    try {
      setIsUploading(true);
      const uploadedFilenames =
        selectedImages.length > 0
          ? await uploadPostImages(selectedImages.map((image) => image.file))
          : undefined;

      createPost({
        content,
        ...(uploadedFilenames ? { images: uploadedFilenames } : {}),
      });
    } catch {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isCreatePending || isUpdatePending || isUploading;
  const canSave = content.trim() !== "" && !isPending;

  return (
    <>
      <div className="mt-2 flex flex-col gap-4">
        <Textarea
          autoFocus
          onFocus={(event) =>
            event.target.setSelectionRange(
              event.target.value.length,
              event.target.value.length,
            )
          }
          placeholder="오늘 어떤 일이 있었나요?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[200px] resize-none"
          disabled={isPending}
        />

        {!isEditMode && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelectImages}
          />
        )}

        {selectedImages.length > 0 ? (
          <Carousel>
            <CarouselContent>
              {selectedImages.map((image) => (
                <CarouselItem className="basis-3/5" key={image.previewUrl}>
                  <div className="relative aspect-[4/3] max-h-48 overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={image.previewUrl}
                      className="h-full w-full object-cover"
                      alt="선택한 게시글 이미지"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSelectedImage(image.previewUrl)}
                      className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white"
                      aria-label="선택한 이미지 삭제"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          isEditMode &&
          initialImageUrls &&
          initialImageUrls.length > 0 && (
            <Carousel>
              <CarouselContent>
                {initialImageUrls.map((url) => (
                  <CarouselItem className="basis-3/5" key={url}>
                    <div className="aspect-[4/3] max-h-48 overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={toBackendImageUrl(url)}
                        className="h-full w-full object-cover"
                        alt="기존 게시글 이미지"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {!isEditMode ? (
          <Button
            type="button"
            variant={"outline"}
            className="cursor-pointer"
            disabled={isPending || selectedImages.length >= 4}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            이미지 추가
          </Button>
        ) : (
          <div />
        )}

        <Button
          className="cursor-pointer px-8"
          onClick={handleSave}
          disabled={!canSave}
        >
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </>
  );
}

export default function PostEditorModal() {
  const {
    isOpen,
    type,
    content: storeContent,
    postId,
    imageUrls,
  } = usePostEditorModal();
  const close = useClosePostEditorModal();

  const isEditMode = type === "EDIT";
  const initialContent = isEditMode ? (storeContent ?? "") : "";
  const initialImageUrls = isEditMode ? (imageUrls ?? null) : null;
  const formKey = isEditMode
    ? `edit-${postId}-${storeContent}-${initialImageUrls?.join(",") ?? ""}`
    : "create";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "게시글 수정" : "게시글 작성"}
          </DialogTitle>
        </DialogHeader>

        <PostEditorForm
          key={formKey}
          initialContent={initialContent}
          initialImageUrls={initialImageUrls}
          isEditMode={isEditMode}
          postId={postId}
          close={close}
        />
      </DialogContent>
    </Dialog>
  );
}
