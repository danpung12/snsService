"use client";

import { Button } from "@/components/ui/button";
import { createChatSocket } from "@/lib/chat-socket";
import type { ChatRoom } from "@/types";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function MessageButton({
  currentUserId,
  targetUserId,
  targetNickname,
}: {
  currentUserId: string;
  targetUserId: string;
  targetNickname: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = () => {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsPending(true);

    const socket = createChatSocket();

    socket.emit(
      "createChat",
      { userIds: [currentUserId, targetUserId] },
      (room: ChatRoom) => {
        socket.disconnect();
        setIsPending(false);

        if (!room?.id) {
          toast.error("채팅방을 만들지 못했습니다.");
          return;
        }

        const searchParams = new URLSearchParams({
          targetUserId,
          targetNickname,
        });

        router.push(`/chat/${room.id}?${searchParams.toString()}`);
      },
    );

    socket.on("connect_error", () => {
      socket.disconnect();
      setIsPending(false);
      toast.error("채팅 서버에 연결하지 못했습니다.");
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={handleClick}
    >
      <MessageCircle className="h-4 w-4" />
      {isPending ? "연결 중..." : "메시지 보내기"}
    </Button>
  );
}
