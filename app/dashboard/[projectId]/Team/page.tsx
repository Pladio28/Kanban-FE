"use client";

import React from "react";
import TeamList from "./components/TeamList";
import AddMemberModal from "./components/AddMemberModal";
import EditMemberModal from "./components/EditMemberModal";
import { useProjectMember } from "./hooks/useProjectMembers";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const { members, addMember, editMember, deleteMember, getMemberById } =
    useProjectMember();

  const [isAddOpen, setAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <Button onClick={() => setAddOpen(true)}>Add Member</Button>
        </div>

        <TeamList
          members={members}
          onEditMember={(id) => setEditingId(id)}
          onDeleteMember={(id) => deleteMember(id)}
        />

        <AddMemberModal
          isOpen={isAddOpen}
          onClose={() => setAddOpen(false)}
          onAddMember={(name, role, email) => {
            addMember(name, role, email);
            setAddOpen(false);
          }}
        />

        <EditMemberModal
          isOpen={!!editingId}
          onClose={() => setEditingId(null)}
          member={editingId ? getMemberById(editingId) : null}
          onUpdateMember={(id, name, role, email) => {
            editMember(id, name, role, email);
            setEditingId(null);
          }}
        />
      </div>
    </main>
  );
}
