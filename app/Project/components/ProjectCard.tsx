"use client";

import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  return (
    <div
      className={cn(
        "group relative bg-[#0f172a] border border-white/10 rounded-xl p-5",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-blue-500/20",
        "hover:border-blue-500/40 hover:scale-[1.03]",
        "cursor-pointer flex flex-col justify-between min-h-[200px]"
      )}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
        <p className="text-sm text-gray-400">{project.description}</p>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <Link href={`/Project/${project.id}`}>
          <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
            Lihat
          </Button>
        </Link>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}
