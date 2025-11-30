"use client";
import { useApi } from "@/lib/axios";

export const useColumnsApi = () => {
  const api = useApi();

  return {
    getColumns: async (boardId: string) => {
      const res = await api.get(`/columns/${boardId}`);
      return res.data.data;
    },
    createColumn: async (boardId: string, name: string) => {
      const res = await api.post(`/columns`, { boards_id: boardId, name });
      return res.data.data;
    },
    updateColumn: async (id: string, name: string) => {
      const res = await api.put(`/columns/${id}`, { name });
      return res.data.data;
    },
    deleteColumn: async (id: string) => {
      const res = await api.delete(`/columns/${id}`);
      return res.data;
    },
  };
};
