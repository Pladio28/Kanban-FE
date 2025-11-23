"use client";

import { useState } from "react";

export interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
}

export const useProjectMember = () => {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "John Young", role: "Developer", email: "john@example.com" },
    { id: 2, name: "Jane Doe", role: "Designer", email: "jane@example.com" },
    { id: 3, name: "Sung Song", role: "Tester", email: "sung@example.com" },
  ]);

  // Tambah member
  const addMember = (name: string, role: string, email: string) => {
    const newMember: Member = { id: Date.now(), name, role, email };
    setMembers((prev) => [...prev, newMember]);
  };

  // Edit member
  const editMember = (id: number, name: string, role: string, email: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { id, name, role, email } : m)));
  };

  // Hapus member
  const deleteMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Ambil member by id
  const getMemberById = (id: number) => members.find((m) => m.id === id) || null;

  return {
    members,
    addMember,
    editMember,
    deleteMember,
    getMemberById,
  };
};
