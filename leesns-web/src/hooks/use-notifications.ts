"use client";

import { createNotificationSocket } from "@/lib/notification-socket";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/service/notification";
import { useUserId } from "@/store/auth";
import type { Notification } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useNotifications() {
  const userId = useUserId();
  const [realtimeNotifications, setRealtimeNotifications] = useState<
    Notification[]
  >([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set(),
  );

  const notificationsQuery = useQuery({
    queryKey: [...QUERY_KEYS.notification.list, userId],
    queryFn: getNotifications,
    enabled: !!userId,
  });

  const unreadCountQuery = useQuery({
    queryKey: [...QUERY_KEYS.notification.unreadCount, userId],
    queryFn: getUnreadNotificationCount,
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
  });

  const rawNotifications = useMemo(() => {
    if (!userId) return [];

    const restNotifications = notificationsQuery.data ?? [];
    const scopedRealtimeNotifications = realtimeNotifications.filter(
      (notification) => notification.receiverId === userId,
    );
    const realtimeNotificationIds = new Set(
      scopedRealtimeNotifications.map((notification) => notification.id),
    );

    return [
      ...scopedRealtimeNotifications,
      ...restNotifications.filter(
        (notification) => !realtimeNotificationIds.has(notification.id),
      ),
    ];
  }, [notificationsQuery.data, realtimeNotifications, userId]);

  const notifications = useMemo(
    () =>
      rawNotifications.map((notification) =>
        readNotificationIds.has(notification.id)
          ? { ...notification, isRead: true }
          : notification,
      ),
    [rawNotifications, readNotificationIds],
  );

  const unreadCount = useMemo(() => {
    if (!userId) return 0;

    const restUnreadCount = unreadCountQuery.data ?? 0;
    const realtimeUnreadCount = realtimeNotifications.filter(
      (notification) =>
        notification.receiverId === userId &&
        !notification.isRead &&
        !(notificationsQuery.data ?? []).some(
          (restNotification) => restNotification.id === notification.id,
        ),
    ).length;
    const locallyReadCount = rawNotifications.filter(
      (notification) =>
        !notification.isRead && readNotificationIds.has(notification.id),
    ).length;

    return Math.max(restUnreadCount + realtimeUnreadCount - locallyReadCount, 0);
  }, [
    notificationsQuery.data,
    rawNotifications,
    readNotificationIds,
    realtimeNotifications,
    unreadCountQuery.data,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;

    const socket = createNotificationSocket();

    socket.emit("joinNotificationRoom", userId);

    const handleNewNotification = (notification: Notification) => {
      setRealtimeNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }

        return [notification, ...current];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.disconnect();
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (notification: Notification) => {
      await markAsReadMutation.mutateAsync(notification.id);

      if (!notification.isRead) {
        setReadNotificationIds((current) => {
          const next = new Set(current);
          next.add(notification.id);
          return next;
        });
      }
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
    setReadNotificationIds((current) => {
      const next = new Set(current);
      rawNotifications.forEach((notification) => {
        next.add(notification.id);
      });
      return next;
    });
  }, [markAllAsReadMutation, rawNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    fetchNotifications: notificationsQuery.refetch,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
