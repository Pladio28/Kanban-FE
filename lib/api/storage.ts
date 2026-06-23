// lib/storage.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "card_attachments"; // ← nama bucket sesuai panduan BE

/**
 * Upload file ke Supabase Storage
 * Returns: { publicUrl, filePath }
 * - publicUrl  → disimpan ke BE (bisa diakses semua user)
 * - filePath   → disimpan di FE untuk keperluan delete nanti
 */
export const uploadFileToStorage = async (
  file: File,
  cardId: string
): Promise<{ publicUrl: string; filePath: string }> => {
  // Path sesuai panduan BE: cards/{cardId}/{timestamp}_{filename}
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `cards/${cardId}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, filePath };
};

/**
 * Hapus file dari Supabase Storage berdasarkan public URL
 * Urutan: hapus storage DULU, baru hapus DB di BE
 */
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  // Extract filePath dari URL
  // Contoh URL: https://xxx.supabase.co/storage/v1/object/public/card_attachments/cards/uuid/file.pdf
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return; // bukan supabase URL, skip

  const filePath = fileUrl.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) throw new Error(`Gagal hapus storage: ${error.message}`);
};