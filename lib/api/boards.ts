// lib/api/boards.ts
"use client";
import { useApi } from "@/lib/axios";

export const useBoardsApi = () => {
  const api = useApi();

  return {
    // GET /api/boards/:project_id
    getBoardsByProject: async (projectId: string) => {
      const res = await api.get(`/boards/${projectId}`);
      return res.data.data;
    },

    // POST /api/boards  { project_id, name }
    createBoard: async (projectId: string, name: string) => {
      const res = await api.post(`/boards`, { project_id: projectId, name });
      return res.data.data;
    },

    // PUT /api/boards/:id  { name }
    updateBoard: async (id: string, name: string) => {
      const res = await api.put(`/boards/${id}`, { name });
      return res.data.data;
    },

    // DELETE /api/boards/:id
    deleteBoard: async (id: string) => {
      const res = await api.delete(`/boards/${id}`);
      return res.data;
    },
  };
};
