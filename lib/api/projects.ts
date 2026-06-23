// lib/api/projects.ts
import { Project } from "@/types/project";
import { useApi } from "../axios";

export const useProjectsApi = () => {
  const api = useApi();

  const getProjects = async (): Promise<Project[]> => {
    const res = await api.get("/projects");
    return res.data?.data ?? [];
  };

  const getProjectById = async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  };

  // 🔥 Fix: Omit<Project, "id"> sudah include deadline karena ada di type Project
  const addProject = async (
    project: Omit<Project, "id" | "createdAt">
  ): Promise<Project> => {
    const res = await api.post("/projects", {
      name: project.name,
      description: project.description,
      deadline: project.deadline ?? null, // 🔥 kirim deadline ke BE
    });
    return res.data.data;
  };

  // 🔥 Fix: updateProject juga kirim deadline
  const updateProject = async (
    id: string,
    project: Partial<Omit<Project, "id" | "createdAt">>
  ): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, {
      name: project.name,
      description: project.description,
      deadline: project.deadline ?? null, // 🔥 kirim deadline ke BE
    });
    return res.data.data;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  };

  return { getProjects, getProjectById, addProject, updateProject, deleteProject };
};