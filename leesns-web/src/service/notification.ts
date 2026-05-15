import api from "@/lib/api";
import type { Notification } from "@/types";

export async function getNotifications() {
  const response = await api.get<Notification[]>("/notifications");
  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await api.get<number>("/notifications/unread-count");
  return response.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await api.patch<Notification>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch("/notifications/read-all");
  return response.data;
}
