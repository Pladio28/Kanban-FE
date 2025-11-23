// lib/api/project.ts
import api from "../axios";
import { Project } from "@/types/project";

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get("/api/projects");
  return res.data.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const res = await api.get(`/api/projects/${id}`);
  return res.data.data;
};

export const addProject = async (project: Omit<Project, "id">): Promise<Project> => {
  const res = await api.post("/api/projects", project);
  return res.data.data;
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  const res = await api.put(`/api/projects/${id}`, project);
  return res.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
