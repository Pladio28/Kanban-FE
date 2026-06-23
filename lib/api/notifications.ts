// lib/api/notifications.ts
"use client";
import { useApi } from "@/lib/axios";

export interface Notification {
  id: string;
  recipient_clerk_id: string;
  sender_clerk_id: string;
  project_id: string | null; // 🔥 tambah project_id
  type: string;
  message: string;
  card_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useNotificationsApi = () => {
  const api = useApi();

  return {
    // GET /api/notifications — semua notif user
    getNotifications: async (): Promise<Notification[]> => {
      const res = await api.get("/notification");
      return res.data?.data ?? [];
    },

    // GET /api/notifications?project_id=xxx — notif per project
    getNotificationsByProject: async (projectId: string): Promise<Notification[]> => {
      const res = await api.get(`/notification?project_id=${projectId}`);
      return res.data?.data ?? [];
    },

    // PUT /api/notifications/:id/read
    markAsRead: async (id: string): Promise<void> => {
      await api.put(`/notification/${id}/read`);
    },

    // PUT /api/notifications/read-all
    markAllAsRead: async (): Promise<void> => {
      await api.put("/notification/read-all");
    },

    // PUT /api/notifications/read-all?project_id=xxx — baca semua notif project ini
    markAllReadByProject: async (projectId: string): Promise<void> => {
      await api.put(`/notification/read-all?project_id=${projectId}`);
    },

    // DELETE /api/notifications/:id
    deleteNotification: async (id: string): Promise<void> => {
      await api.delete(`/notification/${id}`);
    },
  };
};