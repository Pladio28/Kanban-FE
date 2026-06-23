// app/Project/[projectId]/components/ReportModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, X, Users, BarChart3, Clock } from "lucide-react";
import { useReportsApi, ProjectReport } from "@/lib/api/reports";
import { Member } from "../team/hooks/useProjectMembers";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
}

const typeColor: Record<string, string> = {
  done: "text-green-400",
  in_progress: "text-blue-400",
  todo: "text-slate-400",
  other: "text-amber-400",
};

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
  const reportsApi = useReportsApi();
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReport(null);
      return;
    }

    setLoading(true);
    setError(null);

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

  const resolveName = (clerkUserId: string) => {
    const m = members.find((m) => m.clerk_user_id === clerkUserId);
    return m?.name ?? `User-${clerkUserId.slice(-4)}`;
  };

  const handleDownload = async () => {
    if (!report) return;

    setDownloading(true);

    try {
      const jsPDFModule = await import("jspdf");
      const JsPDF = jsPDFModule.default ?? jsPDFModule.jsPDF;
      const doc = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const W = 210;
      const margin = 20;
      let y = 20;

      const checkNewPage = (needed = 10) => {
        if (y + needed > 280) {
          doc.addPage();
          y = 20;
          doc.setFillColor(15, 15, 17);
          doc.rect(0, 0, W, 297, "F");
        }
      };

      doc.setFillColor(15, 15, 17);
      doc.rect(0, 0, W, 297, "F");

      const redLine = () => {
        checkNewPage(10);
        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(0.4);
        doc.line(margin, y, W - margin, y);
        y += 7;
      };

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

      const sectionTitle = (title: string) => {
        checkNewPage(15);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor("#ef4444");
        doc.text(title, margin, y);
        y += 9;
      };

      // Title
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

      // Info
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

      // Summary
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

      // TIM
      sectionTitle("TIM");

      report.members.forEach((m) => {
        checkNewPage(14);

        const isTop =
          report.top_member?.clerk_user_id === m.clerk_user_id;

        const name = resolveName(m.clerk_user_id);

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

      // Breakdown
      sectionTitle("BREAKDOWN");

      report.breakdown.forEach((b) => {
        checkNewPage(8);

        doc.setFontSize(10);
        doc.setTextColor("#e2e8f0");

        doc.text(`${b.column_name} : ${b.count}`, margin, y);

        y += 6;
      });

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

  const pct = report?.percentage ?? 0;
  const barColor =
    pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : "#ef4444";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 bg-[#0f0f11] border border-white/10 text-white overflow-hidden rounded-2xl shadow-2xl shadow-black/60 gap-0">
        <DialogTitle className="hidden">Laporan Project</DialogTitle>

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400 uppercase tracking-widest">
              Laporan Project
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
          {loading && (
            <div className="flex flex-col items-center py-16">
              <Loader2 className="animate-spin text-red-500 w-6 h-6" />
            </div>
          )}

          {error && <p className="text-red-400">{error}</p>}

          {report && (
            <>
              {/* PROJECT INFO */}
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

              {/* PROGRESS */}
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

              {/* BREAKDOWN */}
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

              {/* TEAM */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Tim ({report.members.length})
                </h3>

                <div className="space-y-2">
                  {report.members.map((m) => {
                    const isTop =
                      report.top_member?.clerk_user_id === m.clerk_user_id;

                    const name = resolveName(m.clerk_user_id);

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

        {/* FOOTER */}
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