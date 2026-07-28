// app/Project/[projectId]/components/ReportModal.tsx
"use client"; // Menandai bahwa komponen ini berjalan di Client-side (karena butuh state, dialog DOM, & export PDF)

import { useState, useEffect } from "react";
// Import komponen Dialog (Modal) dari Radix UI / Shadcn UI
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, X, Users, BarChart3, Clock } from "lucide-react"; // Import ikon UI
import { useReportsApi, ProjectReport } from "@/lib/api/reports"; // Import API khusus report
import { Member } from "../team/hooks/useProjectMembers"; // Import tipe data Member tim

// Props yang wajib dikirim saat panggil komponen ini
interface Props {
  open: boolean;         // Control status modal: true (terbuka) | false (tertutup)
  onClose: () => void;   // Callback function buat nutup modal
  projectId: string;     // ID project yang mau ditampilin laporannya
  members: Member[];     // List data anggota tim (buat mapping ID ke Nama Asli)
}

// Map warna teks berdasarkan tipe status kolom/task
const typeColor: Record<string, string> = {
  done: "text-green-400",
  in_progress: "text-blue-400",
  todo: "text-slate-400",
  other: "text-amber-400",
};

// Map warna Hex untuk keperluan render grafik/PDF
const typeDot: Record<string, string> = {
  done: "#22c55e",
  in_progress: "#3b82f6",
  todo: "#6b7280",
  other: "#f59e0b",
};

export default function ReportModal({
  open,
  onClose,
  projectId,
  members,
}: Props) {
  const reportsApi = useReportsApi(); // Hook API report
  const [report, setReport] = useState<ProjectReport | null>(null); // State nampung detail data laporan
  const [loading, setLoading] = useState(false); // Indicator loading fetching data
  const [downloading, setDownloading] = useState(false); // Indicator loading generate PDF
  const [error, setError] = useState<string | null>(null); // State penampung pesan error

  // --- EFFECT: FETCH DATA REPORT ---
  // Dijalankan setiap kali prop 'open' atau 'projectId' berubah
  useEffect(() => {
    // Kalau modal ditutup, bersihkan data report lama
    if (!open) {
      setReport(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Ambil data laporan project dari backend berdasarkan projectId
    reportsApi
      .getProjectReport(projectId)
      .then(setReport)
      .catch((err: any) =>
        setError(
          err?.response?.data?.error ??
            err?.message ??
            "Gagal memuat laporan"
        )
      )
      .finally(() => setLoading(false));
  }, [open, projectId]);

  // --- HELPER 1: CONVERT USER ID KE NAMA ---
  // Mengubah Clerk User ID (misal: "user_2x3y...") jadi nama asli dari prop 'members'
  const resolveName = (clerkUserId: string) => {
    const m = members.find((m) => m.clerk_user_id === clerkUserId);
    return m?.name ?? `User-${clerkUserId.slice(-4)}`; // Fallback jika nama tidak ditemukan
  };

  // --- HANDLER: GENERATE & DOWNLOAD PDF ---
  const handleDownload = async () => {
    if (!report) return;

    setDownloading(true);

    try {
      // Dynamic import jsPDF agar bundle size awal tetap ringan
      const jsPDFModule = await import("jspdf");
      const JsPDF = jsPDFModule.default ?? jsPDFModule.jsPDF;
      const doc = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const W = 210; // Lebar A4 (mm)
      const margin = 20;
      let y = 20; // Posisi vertical cursor di PDF

      // Helper: Tambah halaman baru jika kursor melampaui batas kertas (280mm)
      const checkNewPage = (needed = 10) => {
        if (y + needed > 280) {
          doc.addPage();
          y = 20;
          doc.setFillColor(15, 15, 17); // Set background gelap halaman baru
          doc.rect(0, 0, W, 297, "F");
        }
      };

      // Set background halaman pertama jadi dark mode
      doc.setFillColor(15, 15, 17);
      doc.rect(0, 0, W, 297, "F");

      // Helper: Gambar garis pembatas warna merah
      const redLine = () => {
        checkNewPage(10);
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.4);
        doc.line(margin, y, W - margin, y);
        y += 7;
      };

      // Helper: Cetak baris data pasangan (Label : Value)
      const row = (
        label: string,
        value: string,
        lc = "#94a3b8",
        vc = "#ffffff",
        bold = false
      ) => {
        checkNewPage(8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(lc);
        doc.text(label, margin, y);

        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(vc);
        doc.text(value, margin + 55, y);

        y += 7;
      };

      // Helper: Cetak judul sub-section berwarna merah
      const sectionTitle = (title: string) => {
        checkNewPage(15);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#ef4444");
        doc.text(title, margin, y);
        y += 9;
      };

      // --- SUSUN ISI PDF ---
      // Header Utama
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#ef4444");
      doc.text("LAPORAN PROJECT", margin, y);

      y += 5;

      doc.setFontSize(9);
      doc.setTextColor("#475569");
      doc.text(`Status: ${report.status}`, margin, y + 5);

      y += 12;
      redLine();

      // Info Utama
      row("Nama Project", report.project.name, "#94a3b8", "#ffffff", true);

      if (report.project.deadline) {
        row(
          "Deadline",
          new Date(report.project.deadline).toLocaleDateString("id-ID")
        );
      }

      row(
        "Mulai",
        new Date(report.project.start_date).toLocaleDateString("id-ID")
      );

      row("Durasi", `${report.duration_days} hari`);

      // Tentukan warna teks persentase
      const pc =
        report.percentage === 100
          ? "#22c55e"
          : report.percentage >= 50
          ? "#60a5fa"
          : "#ef4444";

      row(
        "Progress",
        `${report.percentage}% (${report.completed_tasks}/${report.total_tasks})`,
        "#94a3b8",
        pc
      );

      y += 3;
      redLine();

      // Ringkasan
      sectionTitle("RINGKASAN");

      row("Total Komentar", `${report.summary.total_comments}`);
      row("Attachment", `${report.summary.total_attachments}`);
      row(
        "Overdue",
        `${report.summary.overdue_tasks}`,
        "#94a3b8",
        report.summary.overdue_tasks > 0 ? "#ef4444" : "#22c55e"
      );

      y += 3;
      redLine();

      // Tim (Menggunakan resolveName agar nama user di PDF sesuai nama asli, bukan ID)
      sectionTitle("TIM");

      report.members.forEach((m) => {
        checkNewPage(14);

        const isTop =
          report.top_member?.clerk_user_id === m.clerk_user_id;

        const name = resolveName(m.clerk_user_id); // Resolving nama asli user

        doc.setFontSize(10);
        doc.setFont("helvetica", isTop ? "bold" : "normal");
        doc.setTextColor(isTop ? "#fbbf24" : "#e2e8f0");

        doc.text(
          `${name} (${m.role})${isTop ? " ⭐ Top" : ""}`,
          margin,
          y
        );

        y += 5;

        doc.setFontSize(9);
        doc.setTextColor("#64748b");
        doc.text(
          `Assigned: ${m.tasks_assigned} | Done: ${m.tasks_completed}`,
          margin,
          y
        );

        y += 7;
      });

      y += 2;
      redLine();

      // Breakdown Status Task
      sectionTitle("BREAKDOWN");

      report.breakdown.forEach((b) => {
        checkNewPage(8);

        doc.setFontSize(10);
        doc.setTextColor("#e2e8f0");

        doc.text(`${b.column_name} : ${b.count}`, margin, y);

        y += 6;
      });

      // Trigger download file PDF
      doc.save(
        `laporan-${report.project.name.replace(/\s+/g, "-")}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert("Gagal generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  // Hitung persentase progress & tentukan warna progress bar UI modal
  const pct = report?.percentage ?? 0;
  const barColor =
    pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#ef4444";

  return (
    // Component Dialog Modal yang dikontrol oleh state 'open'
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 bg-[#0f0f11] border border-white/10 text-white overflow-hidden rounded-2xl shadow-2xl shadow-black/60 gap-0">
        <DialogTitle className="hidden">Laporan Project</DialogTitle>

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400 uppercase tracking-widest">
              Laporan Project
            </span>
          </div>
        </div>

        {/* MODAL BODY (Scrollable area) */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
          {/* Tampilan Loading */}
          {loading && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="animate-spin text-red-500 w-6 h-6" />
            </div>
          )}

          {/* Tampilan Error */}
          {error && <p className="text-red-400">{error}</p>}

          {/* Tampilan Utama Data Laporan */}
          {report && (
            <>
              {/* Informasi Utama Project */}
              <div>
                <h2 className="text-xl font-bold">{report.project.name}</h2>

                <div className="flex gap-2 flex-wrap mt-2">
                  {report.project.deadline && (
                    <span className="text-xs bg-white/5 px-3 py-1 rounded-full">
                      Deadline:{" "}
                      {new Date(report.project.deadline).toLocaleDateString("id-ID")}
                    </span>
                  )}
                  <span className="text-xs bg-white/5 px-3 py-1 rounded-full">
                    Durasi: {report.duration_days} hari
                  </span>
                </div>
              </div>

              {/* Progress Bar & Counter Task */}
              <div className="bg-white/5 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span>Progress</span>
                  <span>{pct}%</span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                    }}
                  />
                </div>

                <div className="flex gap-4 mt-3 text-sm">
                  <span>Total: {report.total_tasks}</span>
                  <span className="text-green-400">
                    Done: {report.completed_tasks}
                  </span>
                  <span>
                    Sisa: {report.total_tasks - report.completed_tasks}
                  </span>
                </div>
              </div>

              {/* Breakdown Task Per Kolom Kanban */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Breakdown Kolom
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {report.breakdown.map((b) => (
                    <div
                      key={b.column_name}
                      className="flex justify-between bg-white/5 px-3 py-2 rounded"
                    >
                      <span>{b.column_name}</span>
                      <span
                        className={`font-bold ${
                          typeColor[b.type] ?? typeColor.other
                        }`}
                      >
                        {b.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daftar Anggota Tim & Top Contributor */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Tim ({report.members.length})
                </h3>

                <div className="space-y-2">
                  {report.members.map((m) => {
                    const isTop =
                      report.top_member?.clerk_user_id === m.clerk_user_id;

                    const name = resolveName(m.clerk_user_id); // Panggil mapper nama

                    return (
                      <div
                        key={m.clerk_user_id}
                        className={`flex justify-between px-3 py-2 rounded ${
                          isTop ? "bg-amber-500/10" : "bg-white/5"
                        }`}
                      >
                        <div>
                          <div
                            className={`font-medium ${
                              isTop ? "text-amber-400" : ""
                            }`}
                          >
                            {name} {isTop && "⭐"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {m.role}
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          {m.tasks_assigned} task
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-white/8">
          <span className="text-xs text-slate-500">
            {report &&
              `Data per: ${new Date().toLocaleString("id-ID")}`}
          </span>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Tutup
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!report || downloading}
              className="bg-red-600 hover:bg-red-700"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" /> Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}