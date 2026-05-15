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
  Maximize2,
  MessageCircle,
  SendHorizonal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

const MESSAGE_PAGE_SIZE = 20;
const MESSAGE_TIME_DIVIDER_INTERVAL_MS = 60 * 60 * 1000;

function getRoomPeer(room: ChatRoom | undefined, currentUserId: string) {
  return room?.users?.find((user) => String(user.id) !== currentUserId);
}

function getUserAvatarUrl(user?: User) {
  return user?.avatarUrl || user?.avatar_url || null;
}

function formatRoomTime(time?: string | Date) {
  if (!time) return "";
  const date = new Date(time);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatMessageTime(time?: string | Date) {
  if (!time) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(time));
}

function shouldShowMessageTimeDivider(
  message: ChatMessage,
  previousMessage?: ChatMessage,
) {
  if (!message.createdAt) return false;
  if (!previousMessage?.createdAt) return true;

  const currentTime = new Date(message.createdAt).getTime();
  const previousTime = new Date(previousMessage.createdAt).getTime();

  if (!Number.isFinite(currentTime) || !Number.isFinite(previousTime)) {
    return false;
  }

  return currentTime - previousTime >= MESSAGE_TIME_DIVIDER_INTERVAL_MS;
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

export default function DmWidget() {
  const router = useRouter();
  const currentUserId = useUserId();
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToBottomRef = useRef(true);

  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((left, right) => {
      const leftTime = new Date(
        left.lastMessageAt ??
          left.messages?.[0]?.createdAt ??
          left.createdAt ??
          0,
      ).getTime();

      const rightTime = new Date(
        right.lastMessageAt ??
          right.messages?.[0]?.createdAt ??
          right.createdAt ??
          0,
      ).getTime();

      return rightTime - leftTime;
    });
  }, [rooms]);

  const activeRoom = useMemo(
    () => sortedRooms.find((room) => room.id === activeRoomId) ?? null,
    [activeRoomId, sortedRooms],
  );

  const activePeer = getRoomPeer(activeRoom ?? undefined, currentUserId);

  const activeRoomMessages = useMemo(
    () => messages.filter((message) => message.roomId === activeRoomId),
    [activeRoomId, messages],
  );
  const activeRoomLastMessageKey =
    activeRoomMessages.length > 0
      ? getMessageKey(activeRoomMessages[activeRoomMessages.length - 1])
      : "";

  useEffect(() => {
    if (!activeRoomId) return;

    setMessages((prev) =>
      prev.map((message) => ({
        ...message,
        roomId: message.roomId ?? message.chatRoomId ?? activeRoomId,
      })),
    );
  }, [activeRoomId]);

  const hasActiveConversation = Boolean(activeRoomId && activeRoom);

  const activeHeaderTime =
    activeRoom?.lastMessageAt ??
    activeRoom?.messages?.[0]?.createdAt ??
    activeRoom?.createdAt;

  const refreshRooms = () => {
    if (!socketRef.current || !currentUserId) return;

    socketRef.current.emit(
      "getMyChatRooms",
      { userId: currentUserId },
      (result: ChatRoom[]) => {
        setRooms(result ?? []);
      },
    );
  };

  const loadMessages = (roomId: string, cursor?: string | null) => {
    if (!socketRef.current) return;

    shouldScrollToBottomRef.current = !cursor;
    setIsLoadingMessages(true);

    socketRef.current.emit(
      "getMessages",
      {
        chatRoomId: roomId,
        cursor: cursor ?? undefined,
        take: MESSAGE_PAGE_SIZE,
      },
      (response: CursorPaginatedChatMessages) => {
        const fetchedMessages = (response?.data ?? []).map(normalizeMessage);

        setMessages((prev) =>
          cursor
            ? mergeMessages(prev, fetchedMessages, "prepend")
            : fetchedMessages,
        );

        setNextCursor(response?.nextCursor ?? null);
        setHasNextPage(Boolean(response?.hasNextPage));
        setIsLoadingMessages(false);
      },
    );
  };

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    const socket = createChatSocket();
    socketRef.current = socket;

    socket.on("connect", refreshRooms);

    socket.on("receiveMessage", (message: ChatMessage) => {
      const normalizedMessage = normalizeMessage(message);

      setRooms((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (room) => room.id === normalizedMessage.roomId,
        );

        if (index >= 0) {
          const room = updated[index];

          updated.splice(index, 1);
          updated.unshift({
            ...room,
            lastMessage: normalizedMessage.content,
            lastMessageAt: normalizedMessage.createdAt,
          });
        }

        return updated;
      });

      if (normalizedMessage.roomId === activeRoomId) {
        shouldScrollToBottomRef.current = true;
        setMessages((prev) =>
          mergeMessages(prev, [normalizedMessage], "append"),
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeRoomId, currentUserId, isOpen]);

  useEffect(() => {
    if (!isOpen || !activeRoomId) return;

    loadMessages(activeRoomId);
  }, [activeRoomId, isOpen]);

  useEffect(() => {
    if (!hasActiveConversation || activeRoomMessages.length === 0) return;

    if (!shouldScrollToBottomRef.current) {
      shouldScrollToBottomRef.current = true;
      return;
    }

    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [
    activeRoomLastMessageKey,
    activeRoomMessages.length,
    hasActiveConversation,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setActiveRoomId(null);
      setMessages([]);
      setContent("");
      setNextCursor(null);
      setHasNextPage(false);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (
      !socketRef.current ||
      !activeRoomId ||
      !content.trim() ||
      !currentUserId
    )
      return;

    const optimisticMessage: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      roomId: activeRoomId,
      chatRoomId: activeRoomId,
      senderId: currentUserId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    shouldScrollToBottomRef.current = true;
    setMessages((prev) => mergeMessages(prev, [optimisticMessage], "append"));

    socketRef.current.emit("sendMessage", {
      roomId: activeRoomId,
      content: content.trim(),
      senderId: currentUserId,
    });

    setContent("");
  };

  const closeDetail = () => {
    setActiveRoomId(null);
    setMessages([]);
    setNextCursor(null);
    setHasNextPage(false);
    setContent("");
  };

  const openActiveRoomFullChat = () => {
    if (!activeRoomId) return;

    router.push(`/chat/${activeRoomId}`);
  };

  const openLatestRoomFullChat = () => {
    const latestRoomId = sortedRooms[0]?.id;
    if (!latestRoomId) return;

    router.push(`/chat/${latestRoomId}`);
  };

  if (!currentUserId) return null;

  return (
    <div className="fixed bottom-5 right-5 z-60 md:bottom-14 md:right-20">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-background shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:bg-muted flex h-16 w-16 items-center justify-center rounded-full border transition-transform hover:scale-105 md:h-22 md:w-22"
          aria-label="DM 열기"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            "bg-background shadow-[0_18px_60px_rgba(0,0,0,0.22)] flex flex-col overflow-hidden rounded-3xl border",
            hasActiveConversation
              ? "h-[min(560px,calc(100dvh-40px))] w-[360px] md:h-[min(640px,calc(100dvh-112px))] md:w-[420px]"
              : "h-[min(350px,calc(100dvh-40px))] w-[300px] md:h-[min(380px,calc(100dvh-112px))] md:w-[320px]",
          )}
        >
          {!hasActiveConversation ? (
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold">메시지</div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={openLatestRoomFullChat}
                    className="hover:bg-muted rounded-full p-2"
                    aria-label="창 키우기"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-muted rounded-full p-2"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {sortedRooms.length === 0 ? (
                  <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-sm">
                    아직 대화가 없습니다.
                  </div>
                ) : (
                  sortedRooms.map((room) => {
                    const peer = getRoomPeer(room, currentUserId);
                    const lastMessage = room.lastMessage;
                    const avatarUrl = getUserAvatarUrl(peer);

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setActiveRoomId(room.id);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted",
                        )}
                      >
                        <img
                          src={
                            avatarUrl
                              ? toBackendImageUrl(avatarUrl)
                              : defaultAvatar.src
                          }
                          alt={`${peer?.nickname ?? "사용자"} 프로필 이미지`}
                          className="h-12 w-12 rounded-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = defaultAvatar.src;
                          }}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate font-semibold">
                              {peer?.nickname ?? "알 수 없는 사용자"}
                            </div>

                            <div className="text-muted-foreground shrink-0 text-xs">
                              {formatRoomTime(
                                room.lastMessageAt ?? room.createdAt,
                              )}
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
            </>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center justify-between border-b px-3 py-3">
                <button
                  type="button"
                  onClick={closeDetail}
                  className="hover:bg-muted rounded-full p-2"
                  aria-label="목록으로 돌아가기"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-start gap-2",
                    activePeer?.id && "cursor-pointer hover:opacity-80",
                  )}
                  onClick={() => {
                    if (!activePeer?.id) return;
                    router.push(`/profile/${activePeer.id}`);
                  }}
                >
                  <img
                    src={
                      activePeer?.avatarUrl || activePeer?.avatar_url
                        ? toBackendImageUrl(
                            getUserAvatarUrl(activePeer) as string,
                          )
                        : defaultAvatar.src
                    }
                    alt={`${activePeer?.nickname ?? "사용자"} 프로필 이미지`}
                    className="h-9 w-9 rounded-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = defaultAvatar.src;
                    }}
                  />

                  <div className="min-w-0 text-left">
                    <div className="truncate text-sm font-semibold">
                      {activePeer?.nickname ?? "알 수 없는 사용자"}
                    </div>

                    <div className="text-muted-foreground text-xs">
                      {formatRoomTime(activeHeaderTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={openActiveRoomFullChat}
                    className="hover:bg-muted rounded-full p-2"
                    aria-label="창 키우기"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-muted rounded-full p-2"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                ref={messageListRef}
                className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4"
              >
                {hasNextPage && (
                  <div className="flex justify-center pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoadingMessages}
                      onClick={() => {
                        if (!activeRoomId) return;
                        loadMessages(activeRoomId, nextCursor);
                      }}
                    >
                      {isLoadingMessages
                        ? "불러오는 중..."
                        : "이전 메시지 더 보기"}
                    </Button>
                  </div>
                )}

                {isLoadingMessages && activeRoomMessages.length === 0 ? (
                  <div className="text-muted-foreground flex h-full items-center justify-center py-10 text-sm">
                    메시지를 불러오는 중입니다.
                  </div>
                ) : activeRoomMessages.length === 0 ? (
                  <div className="text-muted-foreground flex h-full items-center justify-center py-10 text-sm">
                    아직 메시지가 없습니다.
                  </div>
                ) : (
                  activeRoomMessages.map((message, index) => {
                    const isMine = message.senderId === currentUserId;
                    const previousMessage = activeRoomMessages[index - 1];
                    const nextMessage = activeRoomMessages[index + 1];
                    const nextMessageStartsNewTimeGroup = nextMessage
                      ? shouldShowMessageTimeDivider(nextMessage, message)
                      : false;
                    const shouldShowAvatar =
                      !isMine &&
                      (!nextMessage ||
                        nextMessage.senderId !== message.senderId ||
                        nextMessageStartsNewTimeGroup);
                    const showTimeDivider = shouldShowMessageTimeDivider(
                      message,
                      previousMessage,
                    );
                    const senderAvatarUrl = getUserAvatarUrl(
                      message.sender ?? activePeer ?? undefined,
                    );
                    const senderProfileId =
                      message.sender?.id ?? activePeer?.id ?? null;

                    return (
                      <Fragment key={message.id ?? `${message.createdAt}-${index}`}>
                        {showTimeDivider && (
                          <div className="text-muted-foreground/80 py-6 text-center text-xs font-normal">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        )}
                      <div
                        className={cn(
                          "flex items-end gap-2",
                          isMine ? "justify-end" : "justify-start",
                        )}
                      >
                        {!isMine && (
                          <div className="h-7 w-7 shrink-0 self-end">
                            {shouldShowAvatar && (
                              <img
                                src={
                                  senderAvatarUrl
                                    ? toBackendImageUrl(senderAvatarUrl)
                                    : defaultAvatar.src
                                }
                                alt={`${
                                  message.sender?.nickname ??
                                  activePeer?.nickname ??
                                  "사용자"
                                } 프로필 이미지`}
                                className="h-7 w-7 cursor-pointer rounded-full object-cover hover:opacity-80"
                                onClick={() => {
                                  if (!senderProfileId) return;
                                  router.push(`/profile/${senderProfileId}`);
                                }}
                                onError={(event) => {
                                  event.currentTarget.src = defaultAvatar.src;
                                }}
                              />
                            )}
                          </div>
                        )}

                        {isMine ? (
                          <>
                            <div className="text-muted-foreground text-[11px]">
                              {formatMessageTime(message.createdAt)}
                            </div>

                            <div
                              className={cn(
                                "max-w-[72%] rounded-2xl px-3 py-2 text-sm leading-6",
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
                                "max-w-[72%] rounded-2xl px-3 py-2 text-sm leading-6",
                                "rounded-bl-md bg-muted text-foreground",
                              )}
                            >
                              {message.content}
                            </div>

                            <div className="text-muted-foreground text-[11px]">
                              {formatMessageTime(message.createdAt)}
                            </div>
                          </>
                        )}
                      </div>
                      </Fragment>
                    );
                  })
                )}
              </div>

              <div className="shrink-0 border-t p-3">
                <div className="flex items-center gap-2 rounded-full border px-3 py-2">
                  <Input
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="메시지 입력..."
                    className="h-10 border-0 bg-transparent px-1 focus-visible:ring-0"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!content.trim()}
                    className="bg-primary text-primary-foreground disabled:bg-muted inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:text-muted-foreground"
                    aria-label="메시지 보내기"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
