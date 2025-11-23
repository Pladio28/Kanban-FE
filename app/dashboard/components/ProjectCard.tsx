"use client";

import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";

type Props = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <p className="text-sm text-gray-500">{project.description}</p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={onEdit}>Edit</Button>
        <Button variant="destructive" onClick={onDelete}>Hapus</Button>
      </div>
    </div>
  );
}
