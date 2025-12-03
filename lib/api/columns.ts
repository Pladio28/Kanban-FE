// lib/api/columns.ts
"use client";
import { useApi } from "@/lib/axios";

export const useColumnsApi = () => {
  const api = useApi();

  return {
    // GET /api/columns/:boards_id
    getColumns: async (boardId: string) => {
      const res = await api.get(`/columns/${boardId}`);
      return res.data.data;
    },

    // POST /api/columns { boards_id, name }
    createColumn: async (boardId: string, name: string) => {
      const res = await api.post(`/columns`, { boards_id: boardId, name });
      return res.data.data;
    },

    // PUT /api/columns/:id { name }
    updateColumn: async (id: string, name: string) => {
      const res = await api.put(`/columns/${id}`, { name });
      return res.data.data;
    },

    // DELETE /api/columns/:id
    deleteColumn: async (id: string) => {
      const res = await api.delete(`/columns/${id}`);
      return res.data;
    },
  };
};
