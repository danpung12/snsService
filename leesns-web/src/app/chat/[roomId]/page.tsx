"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createChatSocket } from "@/lib/chat-socket";
import { toBackendImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import { useUserId } from "@/store/auth";
import type {
  ChatMessage,
  ChatRoom,
  CursorPaginatedChatMessages,
  User,
} from "@/types";
import {
  ArrowLeft,
  Expand,
  Info,
  MessageCircle,
  Search,
  SendHorizonal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";

const MESSAGE_PAGE_SIZE = 20;

function getRoomPeer(room: ChatRoom | undefined, currentUserId: string) {
  return room?.users?.find((user) => String(user.id) !== currentUserId);
}

function getUserAvatarUrl(user?: User) {
  return user?.avatarUrl || user?.avatar_url || null;
}

function formatMessageTime(time?: string | Date) {
  if (!time) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(time));
}

function formatRoomTime(time?: string | Date) {
  if (!time) return "";

  const date = new Date(time);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) return formatMessageTime(date);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function normalizeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    roomId: message.roomId ?? message.chatRoomId ?? "",
    createdAt: message.createdAt ?? new Date().toISOString(),
  };
}

function getMessageKey(message: ChatMessage) {
  return (
    message.id ??
    `${message.roomId}-${message.senderId}-${message.createdAt}-${message.content}`
  );
}

function mergeMessages(
  currentMessages: ChatMessage[],
  incomingMessages: ChatMessage[],
  placement: "append" | "prepend",
) {
  const orderedMessages =
    placement === "prepend"
      ? [...incomingMessages, ...currentMessages]
      : [...currentMessages, ...incomingMessages];
  const seenMessageKeys = new Set<string>();

  return orderedMessages.filter((message) => {
    const messageKey = getMessageKey(message);

    if (seenMessageKeys.has(messageKey)) return false;

    seenMessageKeys.add(messageKey);
    return true;
  });
}

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = useUserId();
  const roomIdParam = params.roomId;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const targetUserId = searchParams.get("targetUserId");
  const targetNickname = searchParams.get("targetNickname") ?? "상대";
  const socketRef = useRef<Socket | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextMessageCursor, setNextMessageCursor] = useState<string | null>(
    null,
  );
  const [hasNextMessagePage, setHasNextMessagePage] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState(roomId);
  const selectedRoom = chatRooms.find((room) => room.id === selectedRoomId);
  const roomMessages = useMemo(
    () => messages.filter((message) => message.roomId === selectedRoomId),
    [messages, selectedRoomId],
  );
  const selectedPeer = getRoomPeer(selectedRoom, currentUserId);
  const headerUser = selectedPeer ?? {
    id: targetUserId ?? "",
    nickname: targetNickname,
    avatarUrl: null,
    avatar_url: null,
  };
  const headerAvatarUrl = getUserAvatarUrl(headerUser);

  const canSend = useMemo(
    () => Boolean(selectedRoomId && currentUserId && content.trim()),
    [content, currentUserId, selectedRoomId],
  );
  const canLoadMoreMessages = hasNextMessagePage && roomMessages.length > 0;

  const getMessages = useCallback(
    (socket: Socket, cursor?: string | null) => {
      if (!selectedRoomId) return;

      setIsMessagesLoading(true);

      socket.emit(
        "getMessages",
        {
          chatRoomId: selectedRoomId,
          cursor: cursor ?? undefined,
          take: MESSAGE_PAGE_SIZE,
        },
        (response: CursorPaginatedChatMessages) => {
          const fetchedMessages = (response?.data ?? []).map(normalizeMessage);

          setMessages((prevMessages) =>
            cursor
              ? mergeMessages(prevMessages, fetchedMessages, "prepend")
              : fetchedMessages,
          );
          setNextMessageCursor(response?.nextCursor ?? null);
          setHasNextMessagePage(Boolean(response?.hasNextPage));
          setIsMessagesLoading(false);
        },
      );
    },
    [selectedRoomId],
  );

  useEffect(() => {
    if (!currentUserId || !roomId) return;

    const socket = createChatSocket();
    socketRef.current = socket;

    const refreshRooms = () => {
      socket.emit(
        "getMyChatRooms",
        { userId: currentUserId },
        (rooms: ChatRoom[]) => {
          setChatRooms(rooms ?? []);
        },
      );
    };

    socket.on("connect", () => {
      setIsConnected(true);
      refreshRooms();

      if (targetUserId) {
        socket.emit("createChat", {
          userIds: [currentUserId, targetUserId],
        });
      }
    });

    socket.emit(
      "getMessages",
      {
        chatRoomId: selectedRoomId,
        take: MESSAGE_PAGE_SIZE,
      },
      (response: CursorPaginatedChatMessages) => {
        const fetchedMessages = (response?.data ?? []).map(normalizeMessage);
        setMessages(fetchedMessages);
        setNextMessageCursor(response?.nextCursor ?? null);
        setHasNextMessagePage(Boolean(response?.hasNextPage));
        setIsMessagesLoading(false);
      },
    );

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("receiveMessage", (message: ChatMessage) => {
      const normalizedMessage = normalizeMessage(message);

      if (normalizedMessage.roomId === selectedRoomId) {
        setMessages((prevMessages) =>
          mergeMessages(prevMessages, [normalizedMessage], "append"),
        );
      }

      refreshRooms();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, getMessages, selectedRoomId, targetUserId]);

  useEffect(() => {
    if (!socketRef.current || !currentUserId || targetUserId) return;

    const room = chatRooms.find((chatRoom) => chatRoom.id === selectedRoomId);
    const userIds = room?.users?.map((user) => String(user.id));

    if (userIds && userIds.length >= 2) {
      socketRef.current.emit("createChat", { userIds });
    }
  }, [chatRooms, currentUserId, selectedRoomId, targetUserId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!socketRef.current || !selectedRoomId || !canSend) return;

    socketRef.current.emit("sendMessage", {
      roomId: selectedRoomId,
      content: content.trim(),
      senderId: currentUserId,
    });
    setContent("");
  };

  const handleLoadMoreMessages = () => {
    if (!socketRef.current || !nextMessageCursor || isMessagesLoading) return;

    getMessages(socketRef.current, nextMessageCursor);
  };

  if (!selectedRoomId) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
          채팅방 정보를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid h-dvh w-full max-w-[1440px] grid-cols-1 overflow-hidden bg-background md:h-[calc(100vh-92px)] md:min-h-[620px] md:grid-cols-[300px_minmax(0,1fr)] md:rounded-lg md:border">
      <aside className="hidden min-w-0 flex-col border-r md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-bold">메시지</h1>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="border-b p-3">
          <div className="bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>대화 검색</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="text-muted-foreground px-4 py-10 text-center text-sm">
              아직 채팅방이 없습니다.
            </div>
          ) : (
            chatRooms.map((room) => {
              const peer = getRoomPeer(room, currentUserId);
              const lastMessage = room.lastMessage;
              const avatarUrl = getUserAvatarUrl(peer);
              const isActive = room.id === selectedRoomId;

              return (
                <button
                  key={room.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted",
                    isActive && "bg-muted",
                  )}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                  }}
                >
                  <img
                    src={
                      avatarUrl
                        ? toBackendImageUrl(avatarUrl)
                        : defaultAvatar.src
                    }
                    alt={`${peer?.nickname ?? "사용자"} 프로필 이미지`}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold">
                        {peer?.nickname ?? "알 수 없는 사용자"}
                      </div>
                      <div className="text-muted-foreground shrink-0 text-xs">
                        {formatRoomTime(room.lastMessageAt ?? room.createdAt)}
                      </div>
                    </div>
                    <div className="text-muted-foreground truncate text-sm">
                      {lastMessage ?? "새 대화를 시작해보세요."}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        <div className="flex h-14 items-center justify-start border-b px-4 md:h-16 md:px-5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => router.back()}
            aria-label="뒤로가기"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="flex min-w-0 items-center gap-3">
            <img
              src={
                headerAvatarUrl
                  ? toBackendImageUrl(headerAvatarUrl)
                  : defaultAvatar.src
              }
              alt={`${headerUser.nickname} 프로필 이미지`}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="truncate font-bold">{headerUser.nickname}</div>
              <div className="text-muted-foreground text-xs">
                {isConnected ? "연결됨" : "연결 중..."}
              </div>
            </div>
          </div>

          {headerUser.id && (
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="hidden md:inline-flex"
            >
              <Link href={`/profile/${headerUser.id}`}>
                <Info className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
          {canLoadMoreMessages && (
            <div className="flex justify-center pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isMessagesLoading}
                onClick={handleLoadMoreMessages}
              >
                {isMessagesLoading ? "불러오는 중..." : "이전 메시지 더 보기"}
              </Button>
            </div>
          )}
          {roomMessages.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              {isMessagesLoading
                ? "메시지를 불러오는 중입니다."
                : "아직 메시지가 없습니다."}
            </div>
          ) : (
            roomMessages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              const nextMessage = roomMessages[index + 1];
              const shouldShowSenderAvatar =
                !isMine && nextMessage?.senderId !== message.senderId;
              const senderAvatarUrl = getUserAvatarUrl(
                message.sender ?? selectedPeer ?? headerUser,
              );

              return (
                <div
                  key={message.id ?? `${message.createdAt}-${index}`}
                  className={cn(
                    "flex items-end gap-2",
                    isMine ? "justify-end" : "justify-start",
                  )}
                >
                  {!isMine && (
                    <div className="h-8 w-8 shrink-0 self-end">
                      {shouldShowSenderAvatar && (
                        <img
                          src={
                            senderAvatarUrl
                              ? toBackendImageUrl(senderAvatarUrl)
                              : defaultAvatar.src
                          }
                          alt={`${message.sender?.nickname ?? headerUser.nickname} 프로필 이미지`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  {isMine ? (
                    <>
                      <div className="text-muted-foreground text-xs">
                        {formatMessageTime(message.createdAt)}
                      </div>
                      <div
                        className={cn(
                          "max-w-[68%] rounded-2xl px-4 py-2 text-sm leading-6",
                          "rounded-br-md bg-primary text-primary-foreground",
                        )}
                      >
                        {message.content}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={cn(
                          "max-w-[68%] rounded-2xl px-4 py-2 text-sm leading-6",
                          "rounded-bl-md bg-muted text-foreground",
                        )}
                      >
                        {message.content}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        <form className="flex gap-2 border-t p-4" onSubmit={handleSubmit}>
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="메시지를 입력하세요"
            disabled={!currentUserId}
            className="h-11 rounded-full px-4"
          />
          <Button
            type="submit"
            disabled={!canSend}
            className="h-11 rounded-full px-4"
          >
            <SendHorizonal className="h-4 w-4" />
            보내기
          </Button>
        </form>
      </section>
    </main>
  );
}
