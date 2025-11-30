"use client";

import { useEffect, useState } from "react";
import { useUsersApi } from "@/lib/api/users";

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export const useUsers = () => {
  const api = useUsersApi();
  const [users, setUsers] = useState<UserOption[]>([]);

  const fetchUsers = async () => {
    const raw = await api.getUsers();

    const mapped: UserOption[] = raw.map((u: any) => ({
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
  }, []);

  return { users };
};
