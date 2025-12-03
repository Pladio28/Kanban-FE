"use client";

import { useEffect, useState } from "react";
import { useUsersApi } from "@/lib/api/users";
import { Member } from "./useProjectMembers"; // FIXED PATH

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export const useUsers = (projectMembers: Member[]) => {
  const api = useUsersApi();
  const [users, setUsers] = useState<UserOption[]>([]);

  const fetchUsers = async () => {
    const raw = await api.getUsers();

    // Ambil semua clerk_user_id yang sudah join project
    const usedIds = new Set(projectMembers.map((m) => m.clerk_user_id));

    const mapped: UserOption[] = raw
      .filter((u: any) => !usedIds.has(u.id)) // 🔥 FILTER OUT USERS YANG SUDAH JOIN PROJECT
      .map((u: any) => ({
        id: u.id,
        name:
          u.first_name && u.last_name
            ? `${u.first_name} ${u.last_name}`
            : u.first_name
            ? u.first_name
            : u.username
            ? u.username
            : "Unknown User",
        email: u.email_addresses?.[0]?.email_address || "No Email",
      }));

    setUsers(mapped);
  };

  useEffect(() => {
    fetchUsers();
  }, [projectMembers]); // 🔥 auto update ketika ada member baru

  return { users };
};
