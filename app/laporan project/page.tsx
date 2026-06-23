// app/LaporanProject/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useOwnerApi, OwnerSummary, OwnerProject, OwnerProjectsByYear } from "@/lib/api/owner";
import { usePlatformRole } from "@/lib/hooks/usePlatformRole";
import { useRouter } from "next/navigation";
import { ProjectReport } from "@/lib/api/reports";
import { FileDown, Loader2, ArrowLeft, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "overview" | "year" | "report";

const statusColor: Record<string, string> = {
  Selesai: "text-green-400 bg-green-400/10",
  "On Going": "text-blue-400 bg-blue-400/10",
  Terlambat: "text-red-400 bg-red-400/10",
};

export default function LaporanProjectPage() {
  const { isOwner, loading: roleLoading } = usePlatformRole();
  const { getYearlySummary, getProjectsByYear, getOwnerProjectReport } = useOwnerApi();
  const router = useRouter();

  const [view, setView] = useState<View>("overview");
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [yearData, setYearData] = useState<OwnerProjectsByYear | null>(null);
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<OwnerProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Guard: redirect kalau bukan owner
  useEffect(() => {
    if (!roleLoading && !isOwner) {
      router.replace("/Project");
    }
  }, [roleLoading, isOwner]);

  // Load summary awal
  useEffect(() => {
    if (!isOwner) return;
    setLoading(true);
    getYearlySummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOwner]);

  const handleSelectYear = async (year: number) => {
    setLoading(true);
    setSelectedYear(year);
    try {
      const data = await getProjectsByYear(year);
      setYearData(data);
      setView("year");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (project: OwnerProject) => {
    setLoading(true);
    setSelectedProject(project);
    try {
      const data = await getOwnerProjectReport(project.id);
      setReport(data);
      setView("report");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const jsPDFModule = await import("jspdf");
      const JsPDF = jsPDFModule.default ?? jsPDFModule.jsPDF;
      const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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

      const row = (label: string, value: string, lc = "#94a3b8", vc = "#ffffff", bold = false) => {
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

      row("Nama Project", report.project.name, "#94a3b8", "#ffffff", true);
      if (report.project.deadline) {
        row("Deadline", new Date(report.project.deadline).toLocaleDateString("id-ID"));
      }
      row("Mulai", new Date(report.project.start_date).toLocaleDateString("id-ID"));
      row("Durasi", `${report.duration_days} hari`);
      const pc = report.percentage === 100 ? "#22c55e" : report.percentage >= 50 ? "#60a5fa" : "#ef4444";
      row("Progress", `${report.percentage}% (${report.completed_tasks}/${report.total_tasks})`, "#94a3b8", pc);
      y += 3;
      redLine();

      sectionTitle("RINGKASAN");
      row("Total Komentar", `${report.summary.total_comments}`);
      row("Attachment", `${report.summary.total_attachments}`);
      row("Overdue", `${report.summary.overdue_tasks}`, "#94a3b8", report.summary.overdue_tasks > 0 ? "#ef4444" : "#22c55e");
      y += 3;
      redLine();

      sectionTitle("TIM");
      report.members.forEach((m) => {
        checkNewPage(14);
        const isTop = report.top_member?.clerk_user_id === m.clerk_user_id;
        doc.setFontSize(10);
        doc.setFont("helvetica", isTop ? "bold" : "normal");
        doc.setTextColor(isTop ? "#fbbf24" : "#e2e8f0");
        doc.text(`${m.clerk_user_id} (${m.role})${isTop ? " ⭐ Top" : ""}`, margin, y);
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor("#64748b");
        doc.text(`Assigned: ${m.tasks_assigned} | Done: ${m.tasks_completed}`, margin, y);
        y += 7;
      });
      y += 2;
      redLine();

      sectionTitle("BREAKDOWN");
      report.breakdown.forEach((b) => {
        checkNewPage(8);
        doc.setFontSize(10);
        doc.setTextColor("#e2e8f0");
        doc.text(`${b.column_name} : ${b.count}`, margin, y);
        y += 6;
      });

      doc.save(`laporan-${report.project.name.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (roleLoading || (!isOwner && !roleLoading)) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Loading...
      </main>
    );
  }

  const maxTotal = Math.max(...(summary?.years.map((y) => y.total) ?? [1]));

  return (
    <main className="min-h-screen text-white pt-28 pb-16 px-6 bg-gradient-to-br from-black via-black to-red-900/20">
      <div className="max-w-5xl mx-auto">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <span
            className={view !== "overview" ? "text-red-500 cursor-pointer hover:underline" : "text-white"}
            onClick={() => { if (view !== "overview") { setView("overview"); setSelectedYear(null); } }}
          >
            Semua Project
          </span>
          {(view === "year" || view === "report") && (
            <>
              <span>›</span>
              <span
                className={view === "report" ? "text-red-500 cursor-pointer hover:underline" : "text-white"}
                onClick={() => { if (view === "report") setView("year"); }}
              >
                Tahun {selectedYear}
              </span>
            </>
          )}
          {view === "report" && (
            <>
              <span>›</span>
              <span className="text-white">{selectedProject?.name}</span>
            </>
          )}
        </div>

        {/* ==================== OVERVIEW ==================== */}
        {view === "overview" && (
          <>
            <h1 className="text-3xl font-bold mb-2">
              Laporan <span className="text-red-500">Project</span>
            </h1>
            <p className="text-gray-400 text-sm mb-8">Ringkasan semua project berdasarkan tahun</p>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : summary && (
              <>
                {/* METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Project", val: summary.total_projects, accent: true },
                    { label: "Selesai", val: summary.total_selesai },
                    { label: "On Going", val: summary.total_on_going },
                    { label: "Terlambat", val: summary.total_terlambat },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className={`text-2xl font-bold ${m.accent ? "text-red-500" : "text-white"}`}>{m.val}</div>
                    </div>
                  ))}
                </div>

                {/* CHART */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">Project per Tahun</h2>
                    <span className="text-xs text-gray-500">Klik untuk detail</span>
                  </div>
                  <div className="flex items-end gap-4 h-40">
                    {summary.years.map((yr) => (
                      <div
                        key={yr.year}
                        className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => handleSelectYear(yr.year)}
                      >
                        <span className="text-xs text-gray-400 group-hover:text-white transition">{yr.total}</span>
                        <div className="w-full relative" style={{ height: `${(yr.total / maxTotal) * 120}px` }}>
                          {/* done part */}
                          <div
                            className="absolute bottom-0 w-full bg-red-600 group-hover:bg-red-500 transition rounded-t-sm"
                            style={{ height: `${(yr.selesai / yr.total) * 100}%` }}
                          />
                          {/* non-done part */}
                          <div
                            className="absolute bottom-0 w-full bg-white/10 group-hover:bg-white/20 transition rounded-t-sm"
                            style={{ height: "100%" }}
                          />
                          <div
                            className="absolute bottom-0 w-full bg-red-600 group-hover:bg-red-500 transition rounded-t-sm"
                            style={{ height: `${yr.total > 0 ? (yr.selesai / yr.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-400 group-hover:text-white transition">{yr.year}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" />Selesai</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-white/10 inline-block" />On Going / Terlambat</span>
                  </div>
                </div>

                {/* YEAR CARDS */}
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Pilih Tahun</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {summary.years.map((yr) => (
                    <div
                      key={yr.year}
                      onClick={() => handleSelectYear(yr.year)}
                      className="bg-white/5 border border-white/10 hover:border-red-500/50 rounded-xl p-4 cursor-pointer transition"
                    >
                      <div className="text-2xl font-bold text-red-500">{yr.year}</div>
                      <div className="text-xs text-gray-400 mt-1">{yr.total} project</div>
                      <div className="text-xs text-green-400">{yr.selesai} selesai</div>
                      {yr.terlambat > 0 && <div className="text-xs text-red-400">{yr.terlambat} terlambat</div>}
                      <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${yr.total > 0 ? (yr.selesai / yr.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ==================== YEAR VIEW ==================== */}
        {view === "year" && yearData && (
          <>
            <button onClick={() => setView("overview")} className="flex items-center gap-2 text-red-500 text-sm mb-6 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <h1 className="text-2xl font-bold mb-2">Project Tahun <span className="text-red-500">{selectedYear}</span></h1>
            <p className="text-gray-400 text-sm mb-6">{yearData.total} project ditemukan</p>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
            ) : (
              <div className="space-y-3">
                {yearData.projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className="bg-white/5 border border-white/10 hover:border-red-500/50 rounded-xl px-5 py-4 cursor-pointer flex items-center gap-4 transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {p.description ?? "-"} · Deadline: {p.deadline ? new Date(p.deadline).toLocaleDateString("id-ID") : "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" /> {p.total_members}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "text-gray-400 bg-white/10"}`}>
                        {p.status}
                      </span>
                      <span className="text-sm font-bold text-red-400 min-w-[40px] text-right">{p.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================== REPORT VIEW ==================== */}
        {view === "report" && (
          <>
            <button onClick={() => setView("year")} className="flex items-center gap-2 text-red-500 text-sm mb-6 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Kembali ke daftar project
            </button>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
            ) : report && (
              <>
                {/* HEADER */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">{report.project.name}</h1>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(report.project.start_date).toLocaleDateString("id-ID")}
                        {report.project.deadline && ` — ${new Date(report.project.deadline).toLocaleDateString("id-ID")}`}
                        {" · "}{report.duration_days} hari
                      </p>
                      <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${statusColor[report.status] ?? "text-gray-400 bg-white/10"}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-red-500">{report.percentage}%</div>
                      <div className="text-xs text-gray-400">{report.completed_tasks}/{report.total_tasks} task selesai</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${report.percentage}%` }} />
                    </div>
                    <span className="text-sm font-bold">{report.percentage}%</span>
                  </div>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Komentar", val: report.summary.total_comments },
                    { label: "Attachment", val: report.summary.total_attachments },
                    { label: "Task Terlambat", val: report.summary.overdue_tasks },
                    { label: "Durasi", val: `${report.duration_days} hari` },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                      <div className="text-xl font-bold text-white">{m.val}</div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* TIM */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Tim</h3>
                    <div className="space-y-3">
                      {report.members.map((m) => {
                        const isTop = report.top_member?.clerk_user_id === m.clerk_user_id;
                        return (
                          <div key={m.clerk_user_id} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isTop ? "bg-amber-500/10" : "bg-white/5"}`}>
                            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                              {m.clerk_user_id.slice(-2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${isTop ? "text-amber-400" : "text-white"}`}>
                                {m.clerk_user_id} {isTop && "⭐"}
                              </div>
                              <div className="text-xs text-gray-400">{m.role}</div>
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                              {m.tasks_assigned}/{m.tasks_completed}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BREAKDOWN */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Breakdown Kolom</h3>
                    <div className="space-y-3">
                      {report.breakdown.map((b) => (
                        <div key={b.column_name} className="flex items-center gap-3">
                          <span className="text-sm text-gray-300 w-24 flex-shrink-0">{b.column_name}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${report.total_tasks > 0 ? (b.count / report.total_tasks) * 100 : 0}%`,
                                background: b.type === "done" ? "#ef4444" : b.type === "in_progress" ? "#3b82f6" : "#6b7280",
                              }}
                            />
                          </div>
                          <span className="text-sm text-white min-w-[30px] text-right">{b.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* TASKS */}
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-6 mb-4">Daftar Task</h3>
                    <div className="space-y-3">
                      {report.tasks.map((t, i) => (
                        <div key={t.id} className="bg-white/5 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{i + 1}.</span>
                            <span className="flex-1 font-medium truncate">{t.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[t.column_type === "done" ? "Selesai" : "On Going"] ?? "text-gray-400 bg-white/10"}`}>
                              {t.column_name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            💬 {t.total_comments} · 📎 {t.total_attachments}
                            {t.due_date && ` · Due: ${new Date(t.due_date).toLocaleDateString("id-ID")}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DOWNLOAD */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                    {downloading ? "Generating PDF..." : "Download PDF"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}