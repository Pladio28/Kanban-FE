// lib/api/owner.ts
"use client";

import { useApi } from "@/lib/axios";

/* ===================== TYPES ===================== */

export interface YearSummary {
  year: number;
  total: number;
  selesai: number;
  on_going: number;
  terlambat: number;
}

export interface OwnerSummary {
  total_projects: number;
  total_selesai: number;
  total_on_going: number;
  total_terlambat: number;
  years: YearSummary[];
}

export interface OwnerProject {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
  status: "Selesai" | "On Going" | "Terlambat";
  percentage: number;
  total_tasks: number;
  completed_tasks: number;
  total_members: number;
}

export interface OwnerProjectsByYear {
  year: number;
  total: number;
  projects: OwnerProject[];
}

/* ===================== API ===================== */

export const useOwnerApi = () => {
  const api = useApi();

  // GET /api/owner/summary
  const getYearlySummary = async (): Promise<OwnerSummary> => {
    const res = await api.get("/owner/summary");
    return res.data?.data;
  };

  // GET /api/owner/projects?year=2026
  const getProjectsByYear = async (year: number): Promise<OwnerProjectsByYear> => {
    const res = await api.get("/owner/projects", { params: { year } });
    return res.data?.data;
  };

  // GET /api/owner/report/:project_id
  // Reuse tipe ProjectReport dari reports.ts
  const getOwnerProjectReport = async (projectId: string) => {
    const res = await api.get(`/owner/report/${projectId}`);
    return res.data?.data;
  };

  return { getYearlySummary, getProjectsByYear, getOwnerProjectReport };
};