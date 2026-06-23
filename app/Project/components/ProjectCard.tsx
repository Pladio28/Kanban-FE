// app/Project/components/ProjectCard.tsx
"use client";

import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";

type Props = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

// 🔥 Warna deadline: merah = lewat, kuning = ≤7 hari, normal = aman
const getDeadlineInfo = (deadline: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const label = dl.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (diffDays < 0) return { label, cls: "text-red-400 bg-red-500/10 border-red-500/20", tag: "Lewat" };
  if (diffDays <= 7) return { label, cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", tag: `${diffDays}h lagi` };
  return { label, cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", tag: `${diffDays}h lagi` };
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const deadlineInfo = project.deadline ? getDeadlineInfo(project.deadline) : null;

  return (
    <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:border-red-500/30 hover:-translate-y-2 cursor-pointer flex flex-col justify-between min-h-[200px]">

      {/* GLOW */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-red-500/5 blur-xl transition" />

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
        <p className="text-sm text-gray-400">{project.description}</p>

        {/* 🔥 Deadline badge */}
        {deadlineInfo && (
          <div className={`inline-flex items-center gap-1.5 mt-3 text-xs font-medium px-2.5 py-1 rounded-full border ${deadlineInfo.cls}`}>
            <Calendar className="w-3 h-3" />
            {deadlineInfo.label}
            <span className="opacity-70">· {deadlineInfo.tag}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex justify-between items-center mt-6">
        <Link href={`/Project/${project.id}`}>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            Lihat
          </Button>
        </Link>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>Hapus</Button>
        </div>
      </div>
    </div>
  );
}