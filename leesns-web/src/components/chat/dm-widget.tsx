"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import defaultAvatar from "@/assets/default-avatar.png";
import defaultPostImage from "@/assets/default-post-image.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/hooks/use-notifications";
import { createChatSocket } from "@/lib/chat-socket";
import { toBackendImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import { uploadImageWithPresignedUrl } from "@/service/image";
import { useUserId } from "@/store/auth";
import type {
  ChatMessage,
  ChatRoom,
  CursorPaginatedChatMessages,
  Notification,
  User,
} from "@/types";
import { ArrowLeft, ImageIcon, Maximize2, MessageCircle, Send, SendHorizonal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { Socket } from "socket.io-client";

const MESSAGE_PAGE_SIZE = 20;
const MESSAGE_TIME_DIVIDER_INTERVAL_MS = 60 * 60 * 1000;

function getRoomPeer(room: ChatRoom | undefined, currentUserId: string) {
  return room?.users?.find((user) => String(user.id) !== currentUserId);
}

function getRoomPeerId(room: ChatRoom | undefined, currentUserId: string) {
  const peer = getRoomPeer(room, currentUserId);
  if (peer?.id) return String(peer.id);

  return room?.dmKey
    ?.split(":")
    .find((userId) => userId && userId !== currentUserId);
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
    content: message.content ?? "",
    createdAt: message.createdAt ?? new Date().toISOString(),
  };
}

function getMessageKey(message: ChatMessage) {
  return (
    message.id ??
    `${message.roomId}-${message.senderId}-${message.createdAt}-${message.content ?? ""}-${message.imageUrl ?? ""}`
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

function isMatchingOptimisticMessage(
  currentMessage: ChatMessage,
  serverMessage: ChatMessage,
) {
  return (
    currentMessage.id?.startsWith("optimistic-") &&
    currentMessage.roomId === serverMessage.roomId &&
    currentMessage.senderId === serverMessage.senderId &&
    currentMessage.content === serverMessage.content &&
    currentMessage.imageUrl === serverMessage.imageUrl
  );
}

function SafeMessageImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[4/3] w-56 max-w-full overflow-hidden rounded-2xl bg-muted">
      <img
        src={toBackendImageUrl(src)}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = defaultPostImage.src;
        }}
      />
    </div>
  );
}

function getUnreadMessageNotifications(notifications: Notification[]) {
  return notifications.filter(
    (notification) => notification.type === "MESSAGE" && !notification.isRead,
  );
}

function getRoomUnreadNotifications(
  notifications: Notification[],
  roomId: string,
) {
  return notifications.filter(
    (notification) =>
      notification.type === "MESSAGE" &&
      !notification.isRead &&
      notification.chatRoomId === roomId,
  );
}

export default function DmWidget() {
  const router = useRouter();
  const currentUserId = useUserId();
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadIdRef = useRef(0);
  const shouldScrollToBottomRef = useRef(true);
  const activeRoomIdRef = useRef<string | null>(null);
  const cachedRoomIdsRef = useRef<Set<string>>(new Set());
  const roomsRef = useRef<ChatRoom[]>([]);
  const optimisticMessageIdRef = useRef(0);

  const { notifications, markAsRead } = useNotifications();
  const notificationsRef = useRef<Notification[]>([]);
  const markAsReadRef = useRef(markAsRead);
  const unreadMessageNotifications = useMemo(
    () => getUnreadMessageNotifications(notifications),
    [notifications],
  );
  const unreadMessageRoomIds = useMemo(
    () =>
      new Set(
        unreadMessageNotifications
          .map((notification) => notification.chatRoomId)
          .filter(Boolean),
      ),
    [unreadMessageNotifications],
  );
  const unreadMessageCount = unreadMessageNotifications.length;
  const unreadBadgeText =
    unreadMessageCount > 99 ? "99+" : String(unreadMessageCount);

  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
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

  const hasActiveConversation = Boolean(activeRoomId && activeRoom);

  const activeHeaderTime =
    activeRoom?.lastMessageAt ??
    activeRoom?.messages?.[0]?.createdAt ??
    activeRoom?.createdAt;
  const activeReceiverId = getRoomPeerId(activeRoom ?? undefined, currentUserId);
  const canSendMessage = Boolean(
    (content.trim() || selectedImageUrl) &&
      activeReceiverId &&
      isSocketConnected &&
      !isUploadingImage,
  );

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  useEffect(() => {
    notificationsRef.current = notifications;
    markAsReadRef.current = markAsRead;
  }, [markAsRead, notifications]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  const markRoomNotificationsAsRead = useCallback(
    (roomId: string) => {
      const roomNotifications = getRoomUnreadNotifications(
        notificationsRef.current,
        roomId,
      );

      if (roomNotifications.length === 0) return;

      void Promise.all(
        roomNotifications.map((notification) =>
          markAsReadRef.current(notification),
        ),
      ).catch((error) => {
        console.error("Failed to mark message notifications as read", error);
      });
    },
    [],
  );

  const joinChatRooms = useCallback((targetRooms: ChatRoom[]) => {
    const socket = socketRef.current;
    if (!socket) return;

    targetRooms.forEach((room) => {
      const userIds = room.users?.map((user) => String(user.id)) ?? [];

      if (userIds.length >= 2) {
        socket.emit("createChat", { userIds });
      }
    });
  }, []);

  const refreshRooms = useCallback(() => {
    if (!socketRef.current || !currentUserId) return;

    socketRef.current.emit(
      "getMyChatRooms",
      { userId: currentUserId },
      (result: ChatRoom[]) => {
        const nextRooms = result ?? [];
        setRooms(nextRooms);
        joinChatRooms(nextRooms);
      },
    );
  }, [currentUserId, joinChatRooms]);

  const emitEnterViewingRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !currentUserId) return;

      socketRef.current.emit("enterViewingRoom", {
        userId: currentUserId,
        roomId,
      });
    },
    [currentUserId],
  );

  const emitLeaveViewingRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current || !currentUserId) return;

      socketRef.current.emit("leaveViewingRoom", {
        userId: currentUserId,
        roomId,
      });
    },
    [currentUserId],
  );

  const loadMessages = (
    roomId: string,
    cursor?: string | null,
    options?: { silent?: boolean },
  ) => {
    if (!socketRef.current) return;

    shouldScrollToBottomRef.current = !cursor;
    if (!options?.silent) {
      setIsLoadingMessages(true);
    }

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
            : mergeMessages(
                prev.filter((message) => message.roomId !== roomId),
                fetchedMessages,
                "append",
              ),
        );

        cachedRoomIdsRef.current.add(roomId);
        setNextCursor(response?.nextCursor ?? null);
        setHasNextPage(Boolean(response?.hasNextPage));
        setIsLoadingMessages(false);
      },
    );
  };

  useEffect(() => {
    if (!activeRoomId) return;

    setMessages((prev) =>
      prev.map((message) => ({
        ...message,
        roomId: message.roomId ?? message.chatRoomId ?? activeRoomId,
      })),
    );
  }, [activeRoomId]);

  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    const socket = createChatSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsSocketConnected(true);
      refreshRooms();

      if (activeRoomIdRef.current) {
        socket.emit("enterViewingRoom", {
          userId: currentUserId,
          roomId: activeRoomIdRef.current,
        });
      }
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      setIsSocketConnected(false);
      console.error("Chat socket connection error", error);
    });

    socket.on("exception", (error) => {
      console.error("Chat socket exception", error);
    });

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
            lastMessage: normalizedMessage.content || (normalizedMessage.imageUrl ? "사진" : ""),
            lastMessageAt: normalizedMessage.createdAt,
          });
        }

        return updated;
      });

      if (normalizedMessage.roomId === activeRoomIdRef.current) {
        shouldScrollToBottomRef.current = true;
        setMessages((prev) =>
          mergeMessages(
            prev.filter(
              (message) =>
                !isMatchingOptimisticMessage(message, normalizedMessage),
            ),
            [normalizedMessage],
            "append",
          ),
        );
      }

      if (!roomsRef.current.some((room) => room.id === normalizedMessage.roomId)) {
        refreshRooms();
      }
    });

    return () => {
      if (activeRoomIdRef.current) {
        socket.emit("leaveViewingRoom", {
          userId: currentUserId,
          roomId: activeRoomIdRef.current,
        });
      }

      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [currentUserId, isOpen, refreshRooms]);

  useEffect(() => {
    if (!isOpen || !activeRoomId || !currentUserId || !socketRef.current) {
      return;
    }

    emitEnterViewingRoom(activeRoomId);

    return () => {
      emitLeaveViewingRoom(activeRoomId);
    };
  }, [
    activeRoomId,
    currentUserId,
    emitEnterViewingRoom,
    emitLeaveViewingRoom,
    isOpen,
  ]);

  useEffect(() => {
    if (!isOpen || !activeRoomId) return;

    loadMessages(activeRoomId, undefined, {
      silent: cachedRoomIdsRef.current.has(activeRoomId),
    });
    markRoomNotificationsAsRead(activeRoomId);
  }, [activeRoomId, isOpen, markRoomNotificationsAsRead]);

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
      setContent("");
      setSelectedImageUrl(null);
      setSelectedImagePreviewUrl(null);
      setNextCursor(null);
      setHasNextPage(false);
    }
  }, [isOpen]);

  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    clearSelectedImage();
    markRoomNotificationsAsRead(roomId);
  };

  const clearSelectedImage = () => {
    imageUploadIdRef.current += 1;
    setSelectedImageUrl(null);
    setSelectedImagePreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadId = ++imageUploadIdRef.current;
    const previewUrl = URL.createObjectURL(file);
    setSelectedImagePreviewUrl(previewUrl);
    setSelectedImageUrl(null);

    try {
      setIsUploadingImage(true);
      const uploadedImageUrl = await uploadImageWithPresignedUrl(file);
      if (imageUploadIdRef.current === uploadId) {
        setSelectedImageUrl(uploadedImageUrl);
      }
    } catch {
      if (imageUploadIdRef.current === uploadId) {
        setSelectedImageUrl(null);
        setSelectedImagePreviewUrl(null);
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    } finally {
      if (imageUploadIdRef.current === uploadId) {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSend = () => {
    const socket = socketRef.current;
    const trimmedContent = content.trim();

    if (
      !socket?.connected ||
      !activeRoomId ||
      !activeReceiverId ||
      (!trimmedContent && !selectedImageUrl) ||
      isUploadingImage ||
      !currentUserId
    ) {
      return;
    }

    const optimisticMessage: ChatMessage = {
      id: `optimistic-${++optimisticMessageIdRef.current}`,
      roomId: activeRoomId,
      chatRoomId: activeRoomId,
      senderId: currentUserId,
      content: trimmedContent,
      imageUrl: selectedImageUrl,
      createdAt: new Date().toISOString(),
    };

    shouldScrollToBottomRef.current = true;
    setMessages((prev) => mergeMessages(prev, [optimisticMessage], "append"));

    socket.emit("sendMessage", {
      roomId: activeRoomId,
      content: trimmedContent,
      imageUrl: selectedImageUrl,
      senderId: currentUserId,
      receiverId: activeReceiverId,
    });

    setContent("");
    clearSelectedImage();
  };

  const closeDetail = () => {
    setActiveRoomId(null);
    setNextCursor(null);
    setHasNextPage(false);
    setContent("");
    clearSelectedImage();
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
          className="relative flex h-16 w-16 items-center justify-center rounded-full border bg-background shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 hover:bg-muted md:h-20 md:w-20"
          aria-label="DM 열기"
        >
          <Send className="h-7 w-7 -rotate-12" />
          {unreadMessageCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-6 rounded-full bg-red-500 px-1.5 text-center text-xs font-bold leading-6 text-white">
              {unreadBadgeText}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-3xl border bg-background shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
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
                    className="rounded-full p-2 hover:bg-muted"
                    aria-label="채팅창 열기"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 hover:bg-muted"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {sortedRooms.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                    아직 대화가 없습니다.
                  </div>
                ) : (
                  sortedRooms.map((room) => {
                    const peer = getRoomPeer(room, currentUserId);
                    const lastMessage = room.lastMessage;
                    const avatarUrl = getUserAvatarUrl(peer);
                    const hasUnreadMessage = unreadMessageRoomIds.has(room.id);

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => openRoom(room.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
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
                            <div
                              className={cn(
                                "truncate",
                                hasUnreadMessage ? "font-bold" : "font-semibold",
                              )}
                            >
                              {peer?.nickname ?? "알 수 없는 사용자"}
                            </div>

                            <div className="shrink-0 text-xs text-muted-foreground">
                              {formatRoomTime(
                                room.lastMessageAt ?? room.createdAt,
                              )}
                            </div>
                          </div>

                          <div className="mt-0.5 flex items-center gap-2">
                            <div
                              className={cn(
                                "min-w-0 flex-1 truncate text-sm",
                                hasUnreadMessage
                                  ? "font-bold text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {lastMessage ?? "첫 대화를 시작해보세요."}
                            </div>
                            {hasUnreadMessage && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                            )}
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
                  className="rounded-full p-2 hover:bg-muted"
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
                      getUserAvatarUrl(activePeer)
                        ? toBackendImageUrl(getUserAvatarUrl(activePeer) as string)
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

                    <div className="text-xs text-muted-foreground">
                      {formatRoomTime(activeHeaderTime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={openActiveRoomFullChat}
                    className="rounded-full p-2 hover:bg-muted"
                    aria-label="채팅창 열기"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 hover:bg-muted"
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
                  <div className="flex h-full items-center justify-center py-10 text-sm text-muted-foreground">
                    메시지를 불러오는 중입니다.
                  </div>
                ) : activeRoomMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center py-10 text-sm text-muted-foreground">
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
                    const isImageOnlyMessage =
                      Boolean(message.imageUrl) && !message.content;

                    return (
                      <Fragment key={message.id ?? `${message.createdAt}-${index}`}>
                        {showTimeDivider && (
                          <div className="py-6 text-center text-xs font-normal text-muted-foreground/80">
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
                              <div className="text-[11px] text-muted-foreground">
                                {formatMessageTime(message.createdAt)}
                              </div>

                              <div
                                className={cn(
                                  "flex max-w-[72%] flex-col overflow-hidden text-sm leading-6 text-primary-foreground",
                                  isImageOnlyMessage
                                    ? "rounded-2xl rounded-br-md bg-transparent p-0"
                                    : "gap-2 rounded-2xl rounded-br-md bg-primary px-3 py-2",
                                )}
                              >
                                {message.imageUrl && (
                                  <SafeMessageImage
                                    src={message.imageUrl}
                                    alt="채팅 이미지"
                                  />
                                )}
                                {message.content && (
                                  <div className="break-words whitespace-pre-wrap">
                                    {message.content}
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className={cn(
                                  "flex max-w-[72%] flex-col overflow-hidden text-sm leading-6 text-foreground",
                                  isImageOnlyMessage
                                    ? "rounded-2xl rounded-bl-md bg-transparent p-0"
                                    : "gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2",
                                )}
                              >
                                {message.imageUrl && (
                                  <SafeMessageImage
                                    src={message.imageUrl}
                                    alt="채팅 이미지"
                                  />
                                )}
                                {message.content && (
                                  <div className="break-words whitespace-pre-wrap">
                                    {message.content}
                                  </div>
                                )}
                              </div>

                              <div className="text-[11px] text-muted-foreground">
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
                {(selectedImagePreviewUrl || selectedImageUrl) && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border bg-muted/40 p-2">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-background">
                      <img
                        src={selectedImagePreviewUrl ?? selectedImageUrl ?? ""}
                        alt="Attached image preview"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = defaultPostImage.src;
                        }}
                      />
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="absolute right-1 top-1 rounded-full bg-black/55 p-0.5 text-white"
                        aria-label="Remove attached image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="min-w-0 text-xs text-muted-foreground">
                      {isUploadingImage ? "Uploading image..." : "Image attached"}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-full border px-3 py-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectImage}
                  />

                  <Input
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Message..."
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
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                    aria-label="Attach image"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSendMessage}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:bg-muted disabled:text-muted-foreground"
                    aria-label="Send message"
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
