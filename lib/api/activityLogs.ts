// lib/api/activityLogs.ts
"use client";
import { useApi } from "@/lib/axios";

export interface ActivityLog {
  id: string;
  card_id: string | null;     // null kalau log dari aksi kolom (CREATE_COLUMN, dll)
  project_id: string | null;  // 🔥 baru — diisi untuk log aksi kolom
  clerk_user_id: string;
  action: string;
  description: string;        // sudah human-readable dari BE, langsung tampilkan
  created_at: string;
}

export const useActivityLogsApi = () => {
  const api = useApi();

  return {
    // GET /api/activity-logs/card/:card_id
    // → log aktivitas di 1 card (untuk modal detail card)
    getLogsByCard: async (cardId: string): Promise<ActivityLog[]> => {
      const res = await api.get(`/activity-logs/card/${cardId}`);
      return res.data.data ?? [];
    },

    // GET /api/activity-logs/project/:project_id
    // → semua log di project: card logs + kolom logs (untuk sidebar board)
    getLogsByProject: async (projectId: string): Promise<ActivityLog[]> => {
      const res = await api.get(`/activity-logs/project/${projectId}`);
      return res.data.data ?? [];
    },
  };
};