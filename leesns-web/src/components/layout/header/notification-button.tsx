"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { toBackendImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UNKNOWN_USER = "알 수 없는 사용자";

function getNotificationMessage(notification: Notification) {
  const nickname = notification.sender?.nickname || UNKNOWN_USER;

  switch (notification.type) {
    case "LIKE":
      return `${nickname}님이 회원님의 게시글을 좋아합니다.`;
    case "COMMENT":
      return `${nickname}님이 회원님의 게시글에 댓글을 남겼습니다.`;
    case "FOLLOW":
      return `${nickname}님이 회원님을 팔로우했습니다.`;
    case "MESSAGE":
      return `${nickname}님이 메시지를 보냈습니다.`;
    default:
      return "새 알림이 도착했습니다.";
  }
}

function getNotificationHref(notification: Notification) {
  if (
    (notification.type === "LIKE" || notification.type === "COMMENT") &&
    notification.postId
  ) {
    return `/post/${notification.postId}`;
  }

  if (notification.type === "FOLLOW" && notification.senderId) {
    return `/profile/${notification.senderId}`;
  }

  if (notification.type === "MESSAGE" && notification.chatRoomId) {
    return `/chat/${notification.chatRoomId}`;
  }

  return null;
}

function NotificationAvatar({ notification }: { notification: Notification }) {
  const avatarUrl = notification.sender?.avatarUrl;

  return (
    <img
      src={avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src}
      alt={`${notification.sender?.nickname || UNKNOWN_USER} 프로필 이미지`}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
      onError={(event) => {
        event.currentTarget.src = defaultAvatar.src;
      }}
    />
  );
}

export default function NotificationButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const headerUnreadCount = notifications.filter(
    (notification) =>
      notification.type !== "MESSAGE" && !notification.isRead,
  ).length;
  const badgeText =
    headerUnreadCount > 99 ? "99+" : String(headerUnreadCount);
  const unreadNotifications = notifications.filter(
    (notification) =>
      notification.type !== "MESSAGE" && !notification.isRead,
  );

  const handleNotificationClick = async (notification: Notification) => {
    const href = getNotificationHref(notification);

    try {
      await markAsRead(notification);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }

    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="알림"
        >
          <Bell className="size-6" />
          {headerUnreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white">
              {badgeText}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-semibold">알림</div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={headerUnreadCount === 0 || isMarkingAllAsRead}
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="size-3.5" />
            모두 읽음
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              알림을 불러오는 중...
            </div>
          )}

          {!isLoading && unreadNotifications.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              아직 알림이 없습니다.
            </div>
          )}

          {!isLoading &&
            unreadNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted",
                  !notification.isRead && "bg-muted/50",
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationAvatar notification={notification} />
                <div className="min-w-0 flex-1">
                  <div className="break-keep text-sm leading-5">
                    {getNotificationMessage(notification)}
                  </div>
                  {notification.post?.content && (
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {notification.post.content}
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
