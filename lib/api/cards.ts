// lib/api/cards.ts
"use client";
import { useApi } from "@/lib/axios";

export const useCardsApi = () => {
  const api = useApi();

  return {
    // GET /api/cards/:columns_id
    getCardsByColumn: async (columnId: string) => {
      const res = await api.get(`/cards/${columnId}`);
      return res.data.data;
    },

    // POST /api/cards { columns_id, title, description, due_date }
    createCard: async (columnId: string, title: string, description?: string, due_date?: string) => {
      const res = await api.post(`/cards`, { columns_id: columnId, title, description, due_date });
      return res.data.data;
    },

    // PUT /api/cards/:id { title, description, due_date, columns_id, position }
    updateCard: async (id: string, updates: { title?: string; description?: string; due_date?: string | null; columns_id?: string; position?: number }) => {
      const res = await api.put(`/cards/${id}`, updates);
      return res.data.data;
    },

    // DELETE /api/cards/:id
    deleteCard: async (id: string) => {
      const res = await api.delete(`/cards/${id}`);
      return res.data;
    },
  };
};
