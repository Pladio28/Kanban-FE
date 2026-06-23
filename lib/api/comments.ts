// lib/api/comments.ts
"use client";
import { useApi } from "@/lib/axios";

export interface Comment {
  id: string;
  card_id: string;
  clerk_user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useCommentsApi = () => {
  const api = useApi();

  return {
    // GET /api/comments/:card_id
    getComments: async (cardId: string): Promise<Comment[]> => {
      const res = await api.get(`/comment/${cardId}`);
      return res.data?.data ?? [];
    },

    // POST /api/comments { card_id, content }
    createComment: async (cardId: string, content: string): Promise<Comment> => {
      const res = await api.post("/comment", { card_id: cardId, content });
      return res.data.data;
    },

    // PUT /api/comments/:id { content }
    updateComment: async (id: string, content: string): Promise<Comment> => {
      const res = await api.put(`/comment/${id}`, { content });
      return res.data.data;
    },

    // DELETE /api/comments/:id
    deleteComment: async (id: string): Promise<void> => {
      await api.delete(`/comment/${id}`);
    },
  };
};