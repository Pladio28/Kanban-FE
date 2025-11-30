"use client";
import { useApi } from "@/lib/axios";

export const useBoardsApi = () => {
  const api = useApi();

  return {
    getBoards: async (projectId: string) => {
      const res = await api.get(`/boards/${projectId}`);
      return res.data.data;
    },
    createBoard: async (projectId: string, name: string) => {
      const res = await api.post(`/boards`, { project_id: projectId, name });
      return res.data.data;
    },
    updateBoard: async (id: string, name: string) => {
      const res = await api.put(`/boards/${id}`, { name });
      return res.data.data;
    },
    deleteBoard: async (id: string) => {
      const res = await api.delete(`/boards/${id}`);
      return res.data;
    },
  };
};
