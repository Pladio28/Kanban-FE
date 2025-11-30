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

  const addProject = async (project: Omit<Project, "id">): Promise<Project> => {
    const res = await api.post("/projects", project);
    return res.data.data;
  };

  const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, project);
    return res.data.data;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  };

  return { getProjects, getProjectById, addProject, updateProject, deleteProject };
};
