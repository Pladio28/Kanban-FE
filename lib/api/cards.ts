"use client";
import { useApi } from "@/lib/axios";

export const useCardsApi = () => {
  const api = useApi();

  return {
    // ── CARDS ────────────────────────────────────────────────
    getCardsByColumn: async (columnId: string) => {
      const res = await api.get(`/cards/${columnId}`);
      return res.data.data;
    },

    createCard: async (
      columnId: string,
      title: string,
      description?: string,
      due_date?: string
    ) => {
      const res = await api.post(`/cards`, {
        columns_id: columnId,
        title,
        description,
        due_date,
      });
      return res.data.data;
    },

    updateCard: async (
      id: string,
      updates: {
        title?: string;
        description?: string;
        due_date?: string | null;
        columns_id?: string;
        progress?: number;
      }
    ) => {
      const res = await api.put(`/cards/${id}`, updates);
      return res.data.data;
    },

    deleteCard: async (id: string) => {
      const res = await api.delete(`/cards/${id}`);
      return res.data;
    },

    // ── PROJECT PROGRESS ─────────────────────────────────────
    getProjectProgress: async (projectId: string) => {
      const res = await api.get(`/cards/progress/${projectId}`);
      return res.data.progress as {
        percentage: number;
        total: number;
        done: number;
        breakdown: {
          column_id: string;
          column_name: string;
          type: "todo" | "in_progress" | "done" | "other";
          count: number;
        }[];
      };
    },

    // ── ATTACHMENTS ──────────────────────────────────────────
    getAttachments: async (cardId: string) => {
      const res = await api.get(`/cards/attachments/${cardId}`);
      return res.data.data ?? [];
    },

    // 🔥 FINAL: Upload pakai FormData (multer friendly)
    uploadAttachment: async (data: {
      card_id: string;
      file_url: string;
      file_name: string;
    }) => {
      const res = await api.post(`/cards/attachments`, data);
      return res.data.data;
    },

    deleteAttachment: async (id: string) => {
      await api.delete(`/cards/attachments/${id}`);
    },

    // ── CARD MEMBERS ─────────────────────────────────────────
    getCardMembers: async (cardId: string) => {
      const res = await api.get(`/cards/members/${cardId}`);
      return res.data.data ?? [];
    },

    assignUser: async (cardId: string, userId: string) => {
      await api.post(`/cards/assign`, {
        card_id: cardId,
        user_id: userId,
      });
    },

    unassignUser: async (cardId: string, userId: string) => {
      await api.post(`/cards/unassign`, {
        card_id: cardId,
        user_id: userId,
      });
    },
  };
};