"use client";

import React from "react";
import TeamList from "./components/TeamList";
import AddMemberModal from "./components/AddMemberModal";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useUsers } from "./hooks/useUsers";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function TeamPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { members, loading, addMember, deleteMember } =
    useProjectMembers(projectId);

  const { users } = useUsers();
  const [isAddOpen, setAddOpen] = React.useState(false);

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <Button onClick={() => setAddOpen(true)}>Add Member</Button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading members...</p>
        ) : (
          <TeamList members={members} onDeleteMember={deleteMember} />
        )}

        <AddMemberModal
          isOpen={isAddOpen}
          onClose={() => setAddOpen(false)}
          onAddMember={async (clerk_user_id, role) =>
            await addMember(clerk_user_id, role)
          }
          users={users}
        />
      </div>
    </main>
  );
}
