// lib/api/reports.ts
"use client";

import { useApi } from "@/lib/axios";

/* ===================== TYPES ===================== */

export interface ReportMember {
  clerk_user_id: string;
  role: string;
  tasks_assigned: number;
  tasks_completed: number;
  task_titles: string[];
}

export interface ReportBreakdown {
  column_name: string;
  type: string;
  count: number;
}

export interface ReportTask {
  id: string;
  title: string;
  description: string | null;
  label: string | null;
  column_name: string;
  column_type: string;
  progress: number;
  due_date: string | null;
  assignees: string[];
  is_overdue: boolean;
  total_comments: number;
  total_attachments: number;
}

export interface ProjectReport {
  project: {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    deadline: string | null;
  };
  status: string;
  duration_days: number;
  percentage: number;
  total_tasks: number;
  completed_tasks: number;
  members: ReportMember[];
  top_member: { clerk_user_id: string; tasks: number } | null;
  tasks: ReportTask[];
  breakdown: ReportBreakdown[];
  summary: {
    total_comments: number;
    total_attachments: number;
    overdue_tasks: number;
  };
  boards: { id: string; name: string }[];
}

/* ===================== API ===================== */

export const useReportsApi = () => {
  const api = useApi();

  const getProjectReport = async (
    projectId: string
  ): Promise<ProjectReport> => {
    try {
      const res = await api.get(`/report/project/${projectId}`);
      return res.data?.data;
    } catch (error: any) {
      console.error("getProjectReport error:", error);
      throw error;
    }
  };

  return {
    getProjectReport,
  };
};