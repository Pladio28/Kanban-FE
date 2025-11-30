"use client";
import { useApi } from "@/lib/axios";

export const useCardsApi = () => {
  const api = useApi();

  return {
    getCards: async (columnId: string) => {
      const res = await api.get(`/cards/${columnId}`);
      return res.data.data;
    },
    createCard: async (columnId: string, title: string, description?: string, due_date?: string) => {
      const res = await api.post(`/cards`, { columns_id: columnId, title, description, due_date });
      return res.data.data;
    },
    updateCard: async (id: string, updates: { title?: string; description?: string; due_date?: string; columns_id?: string; position?: number }) => {
      const res = await api.put(`/cards/${id}`, updates);
      return res.data.data;
    },
    deleteCard: async (id: string) => {
      const res = await api.delete(`/cards/${id}`);
      return res.data;
    },
    moveCard: async (id: string, columnId: string, position: number) => {
      const res = await api.patch(`/cards/${id}/move`, { columnId, index: position });
      return res.data.data;
    },
  };
};
