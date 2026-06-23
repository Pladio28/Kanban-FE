// lib/api/columns.ts
"use client";
import { useApi } from "@/lib/axios";

export type ColumnType = "todo" | "in_progress" | "done" | "other";

export const useColumnsApi = () => {
  const api = useApi();

  return {
    // GET /api/columns/:boards_id
    getColumns: async (boardId: string) => {
      const res = await api.get(`/columns/${boardId}`);
      return res.data.data;
    },

    // POST /api/columns { boards_id, name, type }
    createColumn: async (boardId: string, name: string, type: ColumnType = "other") => {
      const res = await api.post(`/columns`, { boards_id: boardId, name, type });
      return res.data.data;
    },

    // PUT /api/columns/:id { name, type }
    updateColumn: async (id: string, name: string, type?: ColumnType) => {
      const res = await api.put(`/columns/${id}`, { name, ...(type ? { type } : {}) });
      return res.data.data;
    },

    // DELETE /api/columns/:id
    deleteColumn: async (id: string) => {
      const res = await api.delete(`/columns/${id}`);
      return res.data;
    },
  };
};