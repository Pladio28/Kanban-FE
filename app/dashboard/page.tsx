"use client";

import { useEffect, useState } from "react";
import { getProjects, addProject, updateProject, deleteProject } from "@/lib/api/projects";
import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState<Project | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
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
    try {
      if (project.id && projects.find((p) => p.id === project.id)) {
        // update
        const updated = await updateProject(project.id, project);
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        // add
        const added = await addProject({ name: project.name, description: project.description });
        setProjects((prev) => [...prev, added]);
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project List</h1>
        <Button onClick={() => openModal()}>+ Tambah Project</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>Belum ada project.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
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
