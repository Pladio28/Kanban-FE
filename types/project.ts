// types/project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  deadline?: string | null; // 🔥 format YYYY-MM-DD
}