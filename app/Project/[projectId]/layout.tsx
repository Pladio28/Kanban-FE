// app/Project/[projectId]/layout.tsx
"use client"; // Menandai bahwa layout ini berjalan di Client-side (karena menggunakan hooks useParams, useState, & useEffect)

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Hook Next.js untuk membaca parameter URL ([projectId])
import { Calendar } from "lucide-react"; // Import ikon Kalender
import ProjectNav from "./components/ProjectNav"; // Navigasi tab internal project (Board, Team, dll.)
import ReportButton from "./components/ReportButton"; // Tombol modal laporan project
import ProjectNotificationBell from "./components/ProjectNotificationBell"; // Lonceng notifikasi spesifik project
import { useProjectsApi } from "@/lib/api/projects"; // Hook API project
import { useProjectMembers } from "./team/hooks/useProjectMembers"; // Custom hook untuk ambil daftar anggota project
import { Project } from "@/types/project"; // Tipe data Project

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  // Ambil projectId dari URL path
  const { projectId } = useParams();
  const pid = projectId as string;

  // Custom Hooks
  const { getProjects } = useProjectsApi();
  const { members } = useProjectMembers(pid);

  // States
  const [project, setProject] = useState<Project | null>(null); // Penampung detail data project aktif
  const [loading, setLoading] = useState(true); // Indikator loading saat fetching data project

  // Otorisasi sederhana: Cek apakah user yang sedang login bertindak sebagai Project Manager (PM)
  const me = members.find((m) => m.isSelf);
  const isAdmin = me?.role === "PM";

  // --- EFFECT: FETCH DETAIL PROJECT ---
  useEffect(() => {
    if (!pid) return;
    
    getProjects()
      .then((list) => setProject(list.find((p) => p.id === pid) ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pid]);

  // Tampilan placeholder saat data project masih dimuat
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Loading project...
      </main>
    );
  }

  // --- HELPER LOGIC: HITUNG TANGGAL & STATUS DEADLINE ---
  const deadlineInfo = (() => {
    if (!project?.deadline) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalisasi jam ke 00:00 agar hitungan hari akurat

    const dl = new Date(project.deadline);
    // Hitung selisih hari antara deadline dan hari ini
    const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format tampilan tanggal (Contoh: "15 Agu 2026")
    const label = dl.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    // Tentukan status & warna berdasarkan selisih hari
    if (diffDays < 0) return { label, cls: "text-red-400", tag: "Lewat!" }; // Deadline sudah lewat (Merah)
    if (diffDays <= 7) return { label, cls: "text-amber-400", tag: `${diffDays} hari lagi` }; // Mendekati < 7 hari (Kuning/Kuning)
    return { label, cls: "text-emerald-400", tag: `${diffDays} hari lagi` }; // Masih aman (Hijau)
  })();

  return (
    <main className="min-h-screen text-white pt-20 bg-gradient-to-br from-black via-black to-red-900/20">

      {/* HEADER STICKY (Melayang di atas saat scroll) */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">

          {/* Baris Atas Header: Judul, Deskripsi, Deadline, & Actions */}
          <div className="flex items-start justify-between mb-4">
            
            {/* Sisi Kiri: Nama & Info Project */}
            <div>
              <h2 className="text-2xl font-bold text-white">{project?.name}</h2>
              {project?.description && (
                <p className="text-gray-400 text-sm mt-0.5">{project.description}</p>
              )}

              {/* Badge Tanggal Deadline */}
              {deadlineInfo && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${deadlineInfo.cls}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {deadlineInfo.label}
                  <span className="opacity-60">· {deadlineInfo.tag}</span>
                </div>
              )}
            </div>

            {/* Sisi Kanan: Action Buttons Header */}
            <div className="flex items-center gap-2 mt-1">
              {/* Lonceng Notifikasi — Dapat diakses oleh SEMUA member */}
              <ProjectNotificationBell projectId={pid} />

              {/* Tombol Laporan — HANYA tampil jika user ber-role "PM" */}
              {isAdmin && <ReportButton projectId={pid} members={members} />}
            </div>
          </div>

          {/* Baris Bawah Header: Menu Navigasi Sub-Halaman Project */}
          <ProjectNav />
        </div>
      </div>

      {/* KONTEN UTAMA (Tempat sub-page/children dirender) */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </div>
    </main>
  );
}