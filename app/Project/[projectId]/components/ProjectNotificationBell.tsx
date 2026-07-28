// app/Project/[projectId]/components/ProjectNotificationBell.tsx
"use client"; // Menandai bahwa komponen ini berjalan di Client-side (butuh state, interval, & DOM ref)

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCheck } from "lucide-react"; // Import ikon UI
import { useNotificationsApi, Notification } from "@/lib/api/notifications"; // API hook & tipe data notifikasi

interface Props {
  projectId: string; // ID project aktif untuk filter notifikasi
}

// --- HELPER 1: FORMAT WAKTU RELATIF ---
// Mengubah waktu ISO string menjadi teks relatif (misal: "Baru saja", "5 mnt lalu")
const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
};

// --- HELPER 2: MAPPING IKON NOTIFIKASI ---
// Menentukan emoji yang sesuai berdasarkan tipe aktivitas/kejadian
const notifIcon = (type: string) => {
  if (type === "ASSIGN") return "🔔";
  if (type === "ATTACHMENT") return "📎";
  if (type === "CREATE_CARD") return "➕";
  if (type === "UPDATE_CARD") return "✏️";
  if (type === "DELETE_CARD") return "🗑️";
  if (type === "CREATE_COLUMN") return "📋";
  return "📌";
};

export default function ProjectNotificationBell({ projectId }: Props) {
  const notifApi = useNotificationsApi(); // Custom hook API notifikasi
  const router = useRouter(); // NextJS router untuk navigasi antar halaman
  const [open, setOpen] = useState(false); // State kontrol dropdown (buka/tutup)
  const [allNotifs, setAllNotifs] = useState<Notification[]>([]); // Penampung semua notifikasi dari API
  const [loading, setLoading] = useState(true); // State penanda proses loading
  const dropRef = useRef<HTMLDivElement>(null); // Ref element container untuk deteksi klik di luar modal (click outside)

  // 💡 FILTER CLIENT-SIDE:
  // Karena Backend belum mendukung query filter ?project_id=xxx, 
  // kita filter di frontend: ambil yang project_id-nya cocok ATAU yang bernilai null (notif global/system).
  const notifs = allNotifs.filter(
    (n) => n.project_id === projectId || n.project_id === null
  );

  // Menghitung jumlah notifikasi yang belum dibaca khusus project ini
  const unreadCount = notifs.filter((n) => !n.is_read).length;

  // --- FUNCTION: FETCH DATA NOTIFIKASI ---
  // Menggunakan useCallback agar referensi fungsi stabil saat digunakan di useEffect
  const fetchNotifs = useCallback(async () => {
    try {
      const data = await notifApi.getNotifications();
      setAllNotifs(data);
    } catch {
      // Silent error agar tidak mengganggu pengalaman pengguna saat polling latar belakang
    } finally {
      setLoading(false);
    }
  }, []);

  // --- EFFECT 1: FETCH AWAL + POLLING 30 DETIK ---
  useEffect(() => {
    fetchNotifs(); // Panggil pertama kali saat komponen di-mount
    const interval = setInterval(fetchNotifs, 30000); // Polling update tiap 30 detik
    return () => clearInterval(interval); // Cleanup interval saat unmount
  }, [fetchNotifs]);

  // --- EFFECT 2: CLICK OUTSIDE LISTENER ---
  // Otomatis menutup dropdown jika user mengklik area luar dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- HANDLER: KLIK ITEM NOTIFIKASI ---
  const handleClickNotif = async (notif: Notification) => {
    // 1. Jika belum dibaca, tandai ke API dan perbarui state lokal secara instan
    if (!notif.is_read) {
      await notifApi.markAsRead(notif.id);
      setAllNotifs((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    // 2. Tutup dropdown
    setOpen(false);

    // 3. Jika notifikasi berkaitan dengan card/task tertentu, arahkan ke board project
    if (notif.card_id) {
      router.push(`/Project/${projectId}/board`);
    }
  };

  // --- HANDLER: TANDAI SEMUA SUDAH DIBACA ---
  const handleMarkAll = async () => {
    const toMark = notifs.filter((n) => !n.is_read);

    // Kirim request 'markAsRead' secara paralel ke semua notif unread
    await Promise.allSettled(toMark.map((n) => notifApi.markAsRead(n.id)));

    // Update state lokal
    setAllNotifs((prev) =>
      prev.map((n) =>
        toMark.some((m) => m.id === n.id) ? { ...n, is_read: true } : n
      )
    );
  };

  // --- HANDLER: HAPUS NOTIFIKASI ---
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Mencegah trigger event handleClickNotif (parent click)
    await notifApi.deleteNotification(id);
    setAllNotifs((prev) => prev.filter((n) => n.id !== id)); // Hapus dari state lokal
  };

  return (
    <div ref={dropRef} className="relative">
      {/* 1. TOMBOL LONCENG / BELL BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
          open
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
        }`}
      >
        <Bell className="w-4 h-4" />
        <span>Notifikasi</span>

        {/* Badge Merah jika ada notifikasi belum dibaca */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 2. DROPDOWN POPUP NOTIFIKASI */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#111114] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          
          {/* Header Dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-semibold text-white">
                Notifikasi Project
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                  {unreadCount} baru
                </span>
              )}
            </div>

            {/* Tombol 'Tandai Semua Dibaca' */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
              >
                <CheckCheck className="w-3 h-3" />
                Baca semua
              </button>
            )}
          </div>

          {/* List Notifikasi (Scrollable) */}
          <div className="max-h-80 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]">
            {/* Indikator Loading */}
            {loading && (
              <p className="text-center text-xs text-slate-600 py-6">
                Memuat...
              </p>
            )}

            {/* Tampilan Kosong */}
            {!loading && notifs.length === 0 && (
              <div className="text-center py-8">
                <div className="text-2xl mb-1">🔔</div>
                <p className="text-xs text-slate-600">Tidak ada notifikasi</p>
                <p className="text-[10px] text-slate-700 mt-1">
                  Notifikasi muncul saat PM assign task ke kamu
                </p>
              </div>
            )}

            {/* Iterasi Item Notifikasi */}
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotif(n)}
                className={`group flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.03] transition last:border-none ${
                  !n.is_read ? "bg-red-500/[0.04]" : ""
                }`}
              >
                {/* Titik Penanda Belum Dibaca (Red Dot) */}
                <div className="flex-shrink-0 w-1.5 mt-1.5">
                  {!n.is_read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </div>

                {/* Konten Notifikasi */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <span className="mr-1">{notifIcon(n.type)}</span>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {formatRelative(n.created_at)}
                  </p>
                </div>

                {/* Tombol Hapus Notifikasi (Muncul saat hover) */}
                <button
                  onClick={(e) => handleDelete(e, n.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-white/10 text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}