"use client";

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
import { ImageIcon, MessageCircle, Search, SendHorizonal, X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Fragment,
  MouseEventHandler,
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

function SafeAvatar({
  src,
  alt,
  className,
  onClick,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLImageElement>;
}) {
  return (
    <img
      src={src ? toBackendImageUrl(src) : defaultAvatar.src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={(event) => {
        event.currentTarget.src = defaultAvatar.src;
      }}
    />
  );
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
    <div className="aspect-[4/3] w-80 max-w-full overflow-hidden rounded-2xl bg-muted">
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

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = useUserId();
  const { notifications, markAsRead } = useNotifications();
  const notificationsRef = useRef<Notification[]>([]);
  const markAsReadRef = useRef(markAsRead);
  const roomIdParam = params.roomId;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const selectedRoomIdRef = useRef<string | undefined>(roomId);
  const targetUserId = searchParams.get("targetUserId");
  const targetNickname = searchParams.get("targetNickname") ?? "상대";
  const socketRef = useRef<Socket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadIdRef = useRef(0);
  const shouldScrollToBottomRef = useRef(true);
  const chatRoomsRef = useRef<ChatRoom[]>([]);
  const optimisticMessageIdRef = useRef(0);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextMessageCursor, setNextMessageCursor] = useState<string | null>(
    null,
  );
  const [hasNextMessagePage, setHasNextMessagePage] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [content, setContent] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(roomId);

  const unreadMessageRoomIds = useMemo(
    () =>
      new Set(
        notifications
          .filter(
            (notification) =>
              notification.type === "MESSAGE" && !notification.isRead,
          )
          .map((notification) => notification.chatRoomId)
          .filter(Boolean),
      ),
    [notifications],
  );

  const selectedRoom = chatRooms.find((room) => room.id === selectedRoomId);
  const roomMessages = useMemo(
    () => messages.filter((message) => message.roomId === selectedRoomId),
    [messages, selectedRoomId],
  );
  const roomLastMessageKey =
    roomMessages.length > 0
      ? getMessageKey(roomMessages[roomMessages.length - 1])
      : "";
  const selectedPeer = getRoomPeer(selectedRoom, currentUserId);
  const headerUser = selectedPeer ?? {
    id: targetUserId ?? "",
    nickname: targetNickname,
    avatarUrl: null,
    avatar_url: null,
  };
  const headerAvatarUrl = getUserAvatarUrl(headerUser);
  const selectedReceiverId =
    getRoomPeerId(selectedRoom, currentUserId) ?? targetUserId;

  const canSend = Boolean(
    isConnected &&
      selectedRoomId &&
      currentUserId &&
      selectedReceiverId &&
      (content.trim() || selectedImageUrl) &&
      !isUploadingImage,
  );
  const canLoadMoreMessages = hasNextMessagePage && roomMessages.length > 0;

  useEffect(() => {
    notificationsRef.current = notifications;
    markAsReadRef.current = markAsRead;
  }, [markAsRead, notifications]);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    chatRoomsRef.current = chatRooms;
  }, [chatRooms]);

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  const markRoomNotificationsAsRead = useCallback(
    (targetRoomId: string) => {
      const roomNotifications = getRoomUnreadNotifications(
        notificationsRef.current,
        targetRoomId,
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

  const getMessages = useCallback(
    (socket: Socket, cursor?: string | null) => {
      if (!selectedRoomId) return;

      shouldScrollToBottomRef.current = !cursor;
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

  const emitEnterViewingRoom = useCallback(
    (targetRoomId: string) => {
      if (!socketRef.current || !currentUserId) return;

      socketRef.current.emit("enterViewingRoom", {
        userId: currentUserId,
        roomId: targetRoomId,
      });
    },
    [currentUserId],
  );

  const emitLeaveViewingRoom = useCallback(
    (targetRoomId: string) => {
      if (!socketRef.current || !currentUserId) return;

      socketRef.current.emit("leaveViewingRoom", {
        userId: currentUserId,
        roomId: targetRoomId,
      });
    },
    [currentUserId],
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
          const nextRooms = rooms ?? [];
          setChatRooms(nextRooms);
          joinChatRooms(nextRooms);
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

      if (selectedRoomIdRef.current) {
        socket.emit("enterViewingRoom", {
          userId: currentUserId,
          roomId: selectedRoomIdRef.current,
        });
      }
    });

    const initialRoomId = selectedRoomIdRef.current;
    if (initialRoomId) {
      socket.emit(
        "getMessages",
        {
          chatRoomId: initialRoomId,
          take: MESSAGE_PAGE_SIZE,
        },
        (response: CursorPaginatedChatMessages) => {
          shouldScrollToBottomRef.current = true;
          const fetchedMessages = (response?.data ?? []).map(normalizeMessage);
          setMessages(fetchedMessages);
          setNextMessageCursor(response?.nextCursor ?? null);
          setHasNextMessagePage(Boolean(response?.hasNextPage));
          setIsMessagesLoading(false);
        },
      );
    }

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      console.error("Chat socket connection error", error);
    });

    socket.on("exception", (error) => {
      console.error("Chat socket exception", error);
    });

    socket.on("receiveMessage", (message: ChatMessage) => {
      const normalizedMessage = normalizeMessage(message);

      setChatRooms((prevRooms) => {
        const index = prevRooms.findIndex(
          (room) => room.id === normalizedMessage.roomId,
        );

        if (index < 0) return prevRooms;

        const nextRooms = [...prevRooms];
        const room = nextRooms[index];

        nextRooms.splice(index, 1);
        nextRooms.unshift({
          ...room,
          lastMessage: normalizedMessage.content || (normalizedMessage.imageUrl ? "사진" : ""),
          lastMessageAt: normalizedMessage.createdAt,
        });

        return nextRooms;
      });

      if (normalizedMessage.roomId === selectedRoomIdRef.current) {
        shouldScrollToBottomRef.current = true;
        setMessages((prevMessages) =>
          mergeMessages(
            prevMessages.filter(
              (message) =>
                !isMatchingOptimisticMessage(message, normalizedMessage),
            ),
            [normalizedMessage],
            "append",
          ),
        );
      }

      if (
        !chatRoomsRef.current.some(
          (room) => room.id === normalizedMessage.roomId,
        )
      ) {
        refreshRooms();
      }
    });

    return () => {
      if (selectedRoomIdRef.current) {
        socket.emit("leaveViewingRoom", {
          userId: currentUserId,
          roomId: selectedRoomIdRef.current,
        });
      }

      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [currentUserId, targetUserId, roomId, joinChatRooms]);

  useEffect(() => {
    if (!selectedRoomId || !currentUserId || !socketRef.current) return;

    emitEnterViewingRoom(selectedRoomId);

    return () => {
      emitLeaveViewingRoom(selectedRoomId);
    };
  }, [
    currentUserId,
    emitEnterViewingRoom,
    emitLeaveViewingRoom,
    selectedRoomId,
  ]);

  useEffect(() => {
    if (!socketRef.current || !currentUserId || targetUserId) return;

    const room = chatRooms.find((chatRoom) => chatRoom.id === selectedRoomId);
    const userIds = room?.users?.map((user) => String(user.id));

    if (userIds && userIds.length >= 2) {
      socketRef.current.emit("createChat", { userIds });
    }
  }, [chatRooms, currentUserId, selectedRoomId, targetUserId]);

  useEffect(() => {
    if (!selectedRoomId) return;
    markRoomNotificationsAsRead(selectedRoomId);
  }, [markRoomNotificationsAsRead, selectedRoomId]);

  useEffect(() => {
    if (roomMessages.length === 0) return;

    if (!shouldScrollToBottomRef.current) {
      shouldScrollToBottomRef.current = true;
      return;
    }

    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [roomLastMessageKey, roomMessages.length]);

  const openRoom = (targetRoomId: string) => {
    setSelectedRoomId(targetRoomId);
    clearSelectedImage();
    markRoomNotificationsAsRead(targetRoomId);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const socket = socketRef.current;
    const trimmedContent = content.trim();

    if (!socket?.connected || !selectedRoomId || !selectedReceiverId || !canSend) {
      return;
    }

    const optimisticMessage: ChatMessage = {
      id: `optimistic-${++optimisticMessageIdRef.current}`,
      roomId: selectedRoomId,
      chatRoomId: selectedRoomId,
      senderId: currentUserId,
      content: trimmedContent,
      imageUrl: selectedImageUrl,
      createdAt: new Date().toISOString(),
    };

    shouldScrollToBottomRef.current = true;
    setMessages((prevMessages) =>
      mergeMessages(prevMessages, [optimisticMessage], "append"),
    );

    socket.emit("sendMessage", {
      roomId: selectedRoomId,
      content: trimmedContent,
      imageUrl: selectedImageUrl,
      senderId: currentUserId,
      receiverId: selectedReceiverId,
    });
    setContent("");
    clearSelectedImage();
  };

  const handleLoadMoreMessages = () => {
    if (!socketRef.current || !nextMessageCursor || isMessagesLoading) return;

    getMessages(socketRef.current, nextMessageCursor);
  };

  if (!selectedRoomId) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-10">
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          채팅방 정보를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid h-[calc(100dvh-60px)] w-full max-w-[1440px] grid-cols-1 overflow-hidden bg-background md:h-[calc(100dvh-92px)] md:grid-cols-[300px_minmax(0,1fr)] md:rounded-lg md:border">
      <aside className="hidden min-w-0 flex-col border-r md:flex">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-bold">메시지</h1>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="border-b p-3">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>대화 검색</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              아직 채팅방이 없습니다.
            </div>
          ) : (
            chatRooms.map((room) => {
              const peer = getRoomPeer(room, currentUserId);
              const lastMessage = room.lastMessage;
              const avatarUrl = getUserAvatarUrl(peer);
              const isActive = room.id === selectedRoomId;
              const hasUnreadMessage = unreadMessageRoomIds.has(room.id);

              return (
                <button
                  key={room.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted",
                    isActive && "bg-muted",
                  )}
                  onClick={() => openRoom(room.id)}
                >
                  <SafeAvatar
                    src={avatarUrl}
                    alt={`${peer?.nickname ?? "사용자"} 프로필 이미지`}
                    className="h-12 w-12 rounded-full object-cover"
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
                        {formatRoomTime(room.lastMessageAt ?? room.createdAt)}
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
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-start border-b px-4 md:h-16 md:px-5">
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

          <div
            className={cn(
              "flex min-w-0 items-center gap-3",
              headerUser.id && "cursor-pointer hover:opacity-80",
            )}
            onClick={() => {
              if (!headerUser.id) return;
              router.push(`/profile/${headerUser.id}`);
            }}
          >
            <SafeAvatar
              src={headerAvatarUrl}
              alt={`${headerUser.nickname} 프로필 이미지`}
              className="h-10 w-10 rounded-full object-cover"
            />

            <div className="min-w-0">
              <div className="truncate font-bold">{headerUser.nickname}</div>
              <div className="text-xs text-muted-foreground">
                {isConnected ? "연결됨" : "연결 중..."}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={messageListRef}
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 py-4"
        >
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
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              {isMessagesLoading
                ? "메시지를 불러오는 중입니다."
                : "아직 메시지가 없습니다."}
            </div>
          ) : (
            roomMessages.map((message, index) => {
              const isMine = message.senderId === currentUserId;
              const previousMessage = roomMessages[index - 1];
              const nextMessage = roomMessages[index + 1];
              const nextMessageStartsNewTimeGroup = nextMessage
                ? shouldShowMessageTimeDivider(nextMessage, message)
                : false;
              const shouldShowSenderAvatar =
                !isMine &&
                (!nextMessage ||
                  nextMessage.senderId !== message.senderId ||
                  nextMessageStartsNewTimeGroup);
              const showTimeDivider = shouldShowMessageTimeDivider(
                message,
                previousMessage,
              );
              const senderAvatarUrl = getUserAvatarUrl(
                message.sender ?? selectedPeer ?? headerUser,
              );
              const senderProfileId =
                message.sender?.id ?? selectedPeer?.id ?? headerUser.id;
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
                      <div className="h-8 w-8 shrink-0 self-end">
                        {shouldShowSenderAvatar && (
                          <SafeAvatar
                            src={senderAvatarUrl}
                            alt={`${
                              message.sender?.nickname ?? headerUser.nickname
                            } 프로필 이미지`}
                            className="h-8 w-8 cursor-pointer rounded-full object-cover hover:opacity-80"
                            onClick={() => {
                              if (!senderProfileId) return;
                              router.push(`/profile/${senderProfileId}`);
                            }}
                          />
                        )}
                      </div>
                    )}

                    {isMine ? (
                      <>
                        <div className="text-xs text-muted-foreground">
                          {formatMessageTime(message.createdAt)}
                        </div>
                        <div
                          className={cn(
                            "flex max-w-[68%] flex-col overflow-hidden text-sm leading-6 text-primary-foreground",
                            isImageOnlyMessage
                              ? "rounded-2xl rounded-br-md bg-transparent p-0"
                              : "gap-2 rounded-2xl rounded-br-md bg-primary px-4 py-2",
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
                            "flex max-w-[68%] flex-col overflow-hidden text-sm leading-6 text-foreground",
                            isImageOnlyMessage
                              ? "rounded-2xl rounded-bl-md bg-transparent p-0"
                              : "gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2",
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
                        <div className="text-xs text-muted-foreground">
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

        <form className="flex shrink-0 flex-col gap-2 border-t p-4" onSubmit={handleSubmit}>
          {(selectedImagePreviewUrl || selectedImageUrl) && (
            <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-2">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-background">
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
              <div className="min-w-0 text-sm text-muted-foreground">
                {isUploadingImage ? "Uploading image..." : "Image attached"}
              </div>
            </div>
          )}

          <div className="flex gap-2">
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
              disabled={!currentUserId || isUploadingImage}
              className="h-11 rounded-full px-4"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!currentUserId || isUploadingImage}
              className="h-11 w-11 shrink-0 rounded-full"
              onClick={() => imageInputRef.current?.click()}
              aria-label="Attach image"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <Button
              type="submit"
              disabled={!canSend}
              className="h-11 rounded-full px-4"
            >
              <SendHorizonal className="h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
