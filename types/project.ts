// types/project.ts
export interface Project {
  id: string;             // sesuai kolom id di DB (uuid)
  name: string;           // nama project
  description: string;    // deskripsi project
  createdAt?: string;     // optional, timestamp
}
