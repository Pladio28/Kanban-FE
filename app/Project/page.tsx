// app/Project/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useProjectsApi } from "@/lib/api/projects";
import { Project } from "@/types/project";
import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
  const { getProjects, addProject, updateProject, deleteProject } = useProjectsApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        toast.error("Gagal memuat daftar project");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const openModal = (project?: Project) => {
    setModalPayload(project ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalPayload(null);
  };

  const handleSave = async (project: Project) => {
    const isEdit = !!(project.id && projects.find((p) => p.id === project.id));
    try {
      if (isEdit) {
        const updated = await updateProject(project.id, {
          name: project.name,
          description: project.description,
          deadline: project.deadline ?? null,
        });
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Project berhasil diperbarui");
      } else {
        const added = await addProject({
          name: project.name,
          description: project.description,
          deadline: project.deadline ?? null,
        });
        setProjects((prev) => [...prev, added]);
        toast.success("Project berhasil dibuat");
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      toast.error(isEdit ? "Gagal memperbarui project" : "Gagal membuat project");
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project berhasil dihapus");
    } catch (err) {
      console.error("Failed to delete project:", err);
      toast.error("Gagal menghapus project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const keyword = search.toLowerCase();
    return (
      project.name.toLowerCase().includes(keyword) ||
      project.description.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="p-8 pt-28 text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          Daftar <span className="text-red-500">Project</span>
        </h1>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
          <Button
            onClick={() => openModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-red-600/30 hover:scale-105 transition whitespace-nowrap"
          >
            + New Project
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-gray-400">Project tidak ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => openModal(project)}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          open={modalOpen}
          payload={modalPayload}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </main>
  );
}