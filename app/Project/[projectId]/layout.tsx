// app/Project/[projectId]/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import ProjectNav from "./components/ProjectNav";
import ReportButton from "./components/ReportButton";
import ProjectNotificationBell from "./components/ProjectNotificationBell"; // 🔥 fix: ./components bukan ../components
import { useProjectsApi } from "@/lib/api/projects";
import { useProjectMembers } from "./team/hooks/useProjectMembers";
import { Project } from "@/types/project";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams();
  const pid = projectId as string;

  const { getProjects } = useProjectsApi();
  const { members } = useProjectMembers(pid);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const me = members.find((m) => m.isSelf);
  const isAdmin = me?.role === "PM";

  useEffect(() => {
    if (!pid) return;
    getProjects()
      .then((list) => setProject(list.find((p) => p.id === pid) ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pid]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">
        Loading project...
      </main>
    );
  }

  const deadlineInfo = (() => {
    if (!project?.deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dl = new Date(project.deadline);
    const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const label = dl.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    if (diffDays < 0) return { label, cls: "text-red-400", tag: "Lewat!" };
    if (diffDays <= 7) return { label, cls: "text-amber-400", tag: `${diffDays} hari lagi` };
    return { label, cls: "text-emerald-400", tag: `${diffDays} hari lagi` };
  })();

  return (
    <main className="min-h-screen text-white pt-20 bg-gradient-to-br from-black via-black to-red-900/20">

      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{project?.name}</h2>
              {project?.description && (
                <p className="text-gray-400 text-sm mt-0.5">{project.description}</p>
              )}
              {deadlineInfo && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium ${deadlineInfo.cls}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {deadlineInfo.label}
                  <span className="opacity-60">· {deadlineInfo.tag}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* Notifikasi — semua member */}
              <ProjectNotificationBell projectId={pid} />
              {/* Laporan — PM only */}
              {isAdmin && <ReportButton projectId={pid} members={members} />}
            </div>
          </div>

          <ProjectNav />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </div>
    </main>
  );
}