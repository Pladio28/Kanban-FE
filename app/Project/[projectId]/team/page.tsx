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

  const { users } = useUsers(members);
  const [isAddOpen, setAddOpen] = React.useState(false);

  const currentUser = members.find((m) => m.isSelf);
  const isAdmin = currentUser?.role === "PM";

  return (
    <main className="min-h-screen p-6 text-white">
      <div className="max-w-[1100px] mx-auto">
      
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your team and collaboration
            </p>
          </div>
      
          {isAdmin && (
            <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30"
              onClick={() => setAddOpen(true)}
            >
              + Add Member
            </Button>
          )}
        </div>
        
        {/* CONTENT */}
        {loading ? (
          <p className="text-gray-400 animate-pulse">Loading members...</p>
        ) : (
          <TeamList
            members={members}
            onDeleteMember={isAdmin ? deleteMember : undefined}
            isAdmin={isAdmin}
          />
        )}
    
        {/* MODAL */}
        {isAdmin && (
          <AddMemberModal
            isOpen={isAddOpen}
            onClose={() => setAddOpen(false)}
            onAddMember={addMember}
            users={users}
          />
        )}
    
      </div>
    </main>
  );
}
