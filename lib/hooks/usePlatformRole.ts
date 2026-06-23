// lib/hooks/usePlatformRole.ts
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/axios";

export type PlatformRole = "OWNER" | "PM" | "USER";

interface UsePlatformRoleReturn {
  role: PlatformRole;
  isOwner: boolean;
  isPM: boolean;
  isUser: boolean;
  loading: boolean;
}

export const usePlatformRole = (): UsePlatformRoleReturn => {
  const api = useApi();
  const [role, setRole] = useState<PlatformRole>("USER");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/clerk-users/me")
      .then((res) => {
        const r = res.data?.data?.platform_role as PlatformRole;
        setRole(r ?? "USER");
      })
      .catch(() => setRole("USER"))
      .finally(() => setLoading(false));
  }, []);

  return {
    role,
    isOwner: role === "OWNER",
    isPM: role === "PM",
    isUser: role === "USER",
    loading,
  };
};