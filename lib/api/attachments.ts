// lib/api/attachments.ts
"use client";
import { useApi } from "@/lib/axios";

export const useAttachmentsApi = () => {
  const api = useApi();

  return {
    // GET /api/attachments/:card_id
    getAttachments: async (cardId: string) => {
      const res = await api.get(`/attachments/${cardId}`);
      return res.data?.data ?? [];
    },

    // POST /api/attachments  (multipart/form-data)
    uploadFile: async (cardId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("card_id", cardId);
      const res = await api.post(`/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },

    // DELETE /api/attachments/:id
    deleteAttachment: async (id: string) => {
      await api.delete(`/attachments/${id}`);
    },
  };
};